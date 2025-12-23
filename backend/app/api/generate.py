from fastapi import APIRouter, Depends, HTTPException, Body
from app.api import deps
from app.models.user import User
from app.services import rag_service, llm_service, cleaning_service
from pydantic import BaseModel

router = APIRouter()

class GenerateRequest(BaseModel):
    email_text: str

@router.post("/draft")
def generate_reply_endpoint(
    request: GenerateRequest,
    user: User = Depends(deps.get_current_user)
):
    try:
        # 1. Clean email
        cleaned_text = cleaning_service.clean_email_body(request.email_text)
        
        # 2. Retrieve Context
        results = rag_service.query_similar(user.id, cleaned_text, n_results=3)
        documents = results['documents'][0] if results['documents'] else []
        
        # 3. Generate with LLM
        draft = llm_service.generate_draft(cleaned_text, documents)
        
        return {
            "draft": draft,
            "context_used": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
