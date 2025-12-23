from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.services import gmail_service, cleaning_service, rag_service

router = APIRouter()

@router.get("/inbox")
def get_inbox_emails(max_results: int = 10, user: User = Depends(deps.get_current_user)):
    try:
        service = gmail_service.get_gmail_service(user)
        messages = gmail_service.list_emails(service, label_ids=['INBOX'], max_results=max_results)
        
        # Hydrate messages with snippet/subject for UI
        email_list = []
        for msg in messages:
            details = gmail_service.get_email_details(service, msg['id'])
            headers = details['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), '(Unknown)')
            
            email_list.append({
                "id": msg['id'],
                "threadId": msg['threadId'],
                "snippet": details.get('snippet', ''),
                "subject": subject,
                "sender": sender
            })
            
        return email_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching emails: {str(e)}")

@router.get("/sent")
def get_sent_emails(max_results: int = 50, user: User = Depends(deps.get_current_user)):
    # Used for training/ingestion
    try:
        service = gmail_service.get_gmail_service(user)
        messages = gmail_service.list_emails(service, label_ids=['SENT'], max_results=max_results)
        # We might want the full body here later for RAG
        return messages
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching sent emails: {str(e)}")

@router.get("/email/{email_id}")
def get_email_body(email_id: str, user: User = Depends(deps.get_current_user)):
    """
    Get the full body text of a specific email.
    This is used when generating replies to ensure we have the complete email content.
    """
    try:
        service = gmail_service.get_gmail_service(user)
        message = gmail_service.get_email_details(service, email_id)
        
        # Extract headers
        headers = message.get('payload', {}).get('headers', [])
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), '(Unknown)')
        
        # Extract full body
        body_text = gmail_service.extract_email_body(message)
        
        return {
            "id": email_id,
            "subject": subject,
            "sender": sender,
            "body": body_text,
            "snippet": message.get('snippet', '')
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching email: {str(e)}")

from pydantic import BaseModel

class DraftRequest(BaseModel):
    recipient: str
    subject: str
    body: str

@router.post("/draft")
def create_draft_endpoint(request: DraftRequest, user: User = Depends(deps.get_current_user)):
    try:
        service = gmail_service.get_gmail_service(user)
        draft = gmail_service.create_draft(service, 'me', {
            'recipient': request.recipient,
            'subject': request.subject,
            'body': request.body
        })
        return {"status": "Draft Created", "draft_id": draft['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create draft: {str(e)}")

@router.post("/sync-sent")
def sync_sent_emails(limit: int = 20, user: User = Depends(deps.get_current_user)):
    """
    Fetches past sent emails, cleans them, and indexes them into the vector DB.
    """
    try:
        service = gmail_service.get_gmail_service(user)
        # 1. Fetch sent emails
        messages = gmail_service.list_emails(service, label_ids=['SENT'], max_results=limit)
        
        count = 0
        for msg in messages:
            # 2. Get full content
            full_msg = gmail_service.get_email_details(service, msg['id'])
            
            # Extract body
            snippet = full_msg.get('snippet', '')
            # payload.body.data is usually for text/plain parts
            # This is simplified; real email parsing is complex (multipart etc)
            # For know, let's use the snippet as a fallback if body parsing is hard, 
            # but ideally we want the body. 
            # Let's try to find text/plain part.
            payload = full_msg['payload']
            body_data = ""
            
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        body_data = part['body'].get('data', '')
                        break
            else:
                 body_data = payload['body'].get('data', '')
                 
            import base64
            email_text = ""
            if body_data:
                try:
                    email_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
                except:
                    email_text = snippet
            else:
                email_text = snippet

            # 3. Clean
            cleaned_text = cleaning_service.clean_email_body(email_text)
            
            if len(cleaned_text) < 50: # Skip very short emails
                continue
                
            # 4. Index
            rag_service.add_document(
                user_id=user.id,
                text=cleaned_text,
                metadata={"source": "sent_email", "email_id": msg['id']},
                doc_id_prefix=f"email_{msg['id']}"
            )
            count += 1
            
        return {"status": "success", "synced_count": count}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
