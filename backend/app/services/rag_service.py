import uuid

# Optional ML imports - handle gracefully if not available
try:
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
    ML_AVAILABLE = True
    
    # Initialize components globally to avoid reloading
    # In production, this might be a separate service or singleton class
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError as e:
    ML_AVAILABLE = False
    chroma_client = None
    embedding_model = None
    print(f"Warning: ML packages not available. RAG features will be disabled. Error: {e}")

def get_collection(user_id: int):
    """
    Get or create a collection for a specific user.
    """
    if not ML_AVAILABLE:
        raise ImportError("ML packages (chromadb, sentence-transformers) are not installed. Please install them to use RAG features.")
    collection_name = f"user_{user_id}_docs"
    return chroma_client.get_or_create_collection(name=collection_name)

def add_document(user_id: int, text: str, metadata: dict, doc_id_prefix: str = None):
    """
    Chunks text and adds to user's collection.
    doc_id_prefix: specific prefix for ids (e.g. email_id) for idempotency
    """
    if not ML_AVAILABLE:
        print("Warning: RAG features not available. Document not indexed.")
        return 0
    collection = get_collection(user_id)
    
    # Simple chunking by 1000 chars for now
    # A real generic chunker is complex, keeping it simple
    chunk_size = 1000
    overlap = 100
    
    chunks = []
    ids = []
    metadatas = []
    
    start = 0
    chunk_idx = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        
        if doc_id_prefix:
            ids.append(f"{doc_id_prefix}_{chunk_idx}")
        else:
            ids.append(str(uuid.uuid4()))
            
        metadatas.append(metadata)
        start += (chunk_size - overlap)
        chunk_idx += 1
        
    if chunks:
        # Generate embeddings explicitly
        embeddings = embedding_model.encode(chunks).tolist()
        
        # Use upsert to handle updates/deduplication
        collection.upsert(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
    return len(chunks)

def query_similar(user_id: int, query_text: str, n_results: int = 3):
    """
    Query the user's collection.
    """
    if not ML_AVAILABLE:
        # Return empty results if ML is not available
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
    collection = get_collection(user_id)
    query_embedding = embedding_model.encode([query_text]).tolist()
    
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )
    return results
