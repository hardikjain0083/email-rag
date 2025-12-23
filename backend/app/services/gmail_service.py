from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.models.user import User
from app.core.config import settings

def get_gmail_service(user: User):
    """
    Constructs a Gmail API service instance for the given user.
    Handles token refresh if expired (assuming refresh_token is valid).
    """
    creds = Credentials(
        token=user.access_token,
        refresh_token=user.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']
    )
    
    return build('gmail', 'v1', credentials=creds)

def list_emails(service, label_ids=['INBOX'], max_results=10):
    results = service.users().messages().list(userId='me', labelIds=label_ids, maxResults=max_results).execute()
    messages = results.get('messages', [])
    return messages

def get_email_details(service, msg_id):
    message = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    return message

def extract_email_body(message):
    """
    Extracts the full text body from a Gmail message.
    Handles both simple and multipart messages.
    """
    import base64
    payload = message.get('payload', {})
    body_text = ""
    
    # Check if message has parts (multipart)
    if 'parts' in payload:
        for part in payload['parts']:
            mime_type = part.get('mimeType', '')
            body_data = part.get('body', {}).get('data', '')
            
            # Prefer text/plain, but also accept text/html
            if mime_type == 'text/plain' and body_data:
                try:
                    body_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
                    break  # Found plain text, use it
                except:
                    pass
            elif mime_type == 'text/html' and body_data and not body_text:
                # Fallback to HTML if no plain text found
                try:
                    html_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
                    # Simple HTML stripping (you might want to use BeautifulSoup)
                    from app.services.cleaning_service import clean_email_body
                    body_text = clean_email_body(html_text)
                except:
                    pass
    else:
        # Simple message without parts
        body_data = payload.get('body', {}).get('data', '')
        if body_data:
            try:
                body_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
            except:
                pass
    
    # Fallback to snippet if body extraction failed
    if not body_text:
        body_text = message.get('snippet', '')
    
    return body_text

def create_draft(service, user_id, message_body):
    """
    Creates a draft email in Gmail.
    message_body: dict with 'recipient', 'subject', 'body'
    """
    from email.mime.text import MIMEText
    import base64

    message = MIMEText(message_body['body'])
    message['to'] = message_body['recipient']
    message['subject'] = message_body['subject']
    
    # Encode the message
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    body = {'message': {'raw': raw_message}}

    draft = service.users().drafts().create(userId=user_id, body=body).execute()
    return draft
