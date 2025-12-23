from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.api import deps
from app.models.user import User
from app.services import rag_service
import io
# import pypdf
# import docx

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(deps.get_current_user)
):
    """
    Upload a policy document (PDF/DOCX/TXT).
    For now, we just read the text and return it to verify.
    In Phase 3, we will chunk and embed this.
    """
    content_type = file.content_type
    filename = file.filename
    
    content = ""
    
    try:
        file_bytes = await file.read()
        file_stream = io.BytesIO(file_bytes)
        
        if "pdf" in content_type or filename.endswith(".pdf"):
            import pypdf
            reader = pypdf.PdfReader(file_stream)
            for page in reader.pages:
                content += page.extract_text() + "\n"
                
        elif "wordprocessingml" in content_type or filename.endswith(".docx"):
            import docx
            doc = docx.Document(file_stream)
            for para in doc.paragraphs:
                content += para.text + "\n"
        
        elif "text" in content_type or filename.endswith(".txt"):
            content = file_bytes.decode("utf-8")
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
            
        # Indexing
        rag_service.add_document(
            user_id=user.id,
            text=content,
            metadata={"filename": filename, "type": "policy"}
        )
        
        return {
            "filename": filename,
            "char_count": len(content),
            "status": "Indexed successfully in Vector DB"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
