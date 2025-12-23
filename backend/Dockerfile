# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Create directory for ChromaDB (if using local storage)
RUN mkdir -p /app/chroma_db

# Expose port (Cloud Run uses PORT env var, default to 8080)
EXPOSE 8080

# Health check (uses container port)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import os, requests; port=os.getenv('PORT','8080'); requests.get(f'http://127.0.0.1:{port}/')" || exit 1

# Run the application
# Cloud Run sets PORT environment variable
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1

