# How AutoGmail Works - Email Drafting Based on Previous Replies

## Overview

Yes, **AutoGmail DOES draft emails based on previous replies** using a RAG (Retrieval Augmented Generation) system. Here's how it works:

## The Complete Flow

### 1. **Training Phase: Syncing Past Emails**

When a user clicks "Sync Sent Emails" in the dashboard:

1. **Fetches Sent Emails** from Gmail API
   - Retrieves the last N sent emails (default: 20)
   - Gets full email body (not just snippet)

2. **Cleans Email Content**
   - Removes HTML tags
   - Strips signatures and quoted text
   - Normalizes whitespace

3. **Indexes into Vector Database** (ChromaDB)
   - Chunks email text into 1000-character segments
   - Generates embeddings using `sentence-transformers` (all-MiniLM-L6-v2)
   - Stores in user-specific collection with metadata

**Code Location**: `backend/app/api/gmail.py` → `sync_sent_emails()` endpoint

### 2. **Document Upload (Optional)**

Users can also upload policy documents:

1. **Upload PDF/DOCX/TXT** files
2. **Extract text** from documents
3. **Index into same vector database** as sent emails

**Code Location**: `backend/app/api/documents.py` → `upload_document()` endpoint

### 3. **Email Generation Phase**

When generating a reply to an incoming email:

1. **Fetch Full Email Body**
   - Frontend now fetches complete email (not just snippet)
   - Includes subject, sender, and full body text

2. **Query Similar Context**
   - Uses RAG to find 3 most similar past emails/documents
   - Compares incoming email against indexed sent emails
   - Uses semantic similarity (vector search)

3. **Generate Draft with Context**
   - LLM (Groq/Llama 3.3) receives:
     - The incoming email
     - 3 most relevant past replies/documents
   - Generates reply matching tone and style from context

**Code Location**: 
- `backend/app/api/generate.py` → `generate_reply_endpoint()`
- `backend/app/services/rag_service.py` → `query_similar()`
- `backend/app/services/llm_service.py` → `generate_draft()`

## Key Components

### RAG Service (`rag_service.py`)
- **Vector Database**: ChromaDB (persistent storage)
- **Embedding Model**: sentence-transformers (all-MiniLM-L6-v2)
- **Chunking**: 1000 chars with 100 char overlap
- **Query**: Returns top 3 similar documents

### LLM Service (`llm_service.py`)
- **Provider**: Groq API
- **Model**: llama-3.3-70b-versatile
- **Prompt Engineering**: 
  - System prompt emphasizes using context
  - Matches tone from previous emails
  - Prevents making commitments not in context

### Email Processing (`gmail_service.py`)
- **Full Body Extraction**: Handles multipart emails
- **Text/HTML Parsing**: Prefers plain text, falls back to HTML
- **Base64 Decoding**: Properly decodes Gmail API responses

## What Gets Indexed

1. **Sent Emails** (via sync):
   - Full email body
   - Subject and sender info (in metadata)
   - Email ID for deduplication

2. **Uploaded Documents**:
   - Policy documents
   - Company guidelines
   - Any reference material

## What Gets Retrieved

When generating a reply:
- **Top 3 similar emails/documents**
- Based on semantic similarity to incoming email
- Includes full context (not just snippets)

## Improvements Made

### Fixed: Snippet Issue
- **Before**: Only snippet was sent to generation endpoint
- **After**: Full email body is fetched via `/gmail/email/{id}` endpoint
- **Impact**: Better context for RAG and LLM

### New Endpoint: `/gmail/email/{email_id}`
- Returns full email body, subject, sender
- Used by frontend before generating reply

## Limitations & Notes

1. **Requires Sync**: Users must sync sent emails first
2. **ML Dependencies**: Requires `sentence-transformers` and `chromadb`
3. **No Context = Generic Reply**: If no similar emails found, generates generic reply
4. **ChromaDB Storage**: Local file-based (needs cloud storage for production)

## Testing the System

1. **Sync some sent emails** (Dashboard → Sync button)
2. **Upload a policy document** (optional)
3. **Generate reply** to a new email
4. **Check response**: Should match tone/style of past emails

## Production Considerations

- Use cloud vector database (Pinecone, Weaviate, etc.)
- Implement proper chunking strategy
- Add metadata filtering (date ranges, categories)
- Cache embeddings for performance
- Monitor RAG quality metrics



