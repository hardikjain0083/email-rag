# AutoGmail - AI-Powered Email Assistant

A full-stack application that uses AI to generate intelligent email replies based on your email history and policy documents.

## Project Structure

```
autogmail-frontend/
├── autogmail-landing/    # Frontend React application (Vite + TypeScript)
└── backend/              # Backend FastAPI application (Python)
```

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package manager)

### Frontend Requirements
- Node.js 18 or higher
- npm or yarn

## Setup Instructions

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   
   # macOS/Linux
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   
   **For Windows users (recommended):**
   ```bash
   # Use the helper script
   install_windows.bat
   ```
   
   **For all platforms (manual):**
   ```bash
   # Upgrade pip first
   python -m pip install --upgrade pip setuptools wheel
   
   # Install dependencies (may take several minutes)
   pip install -r requirements.txt
   ```
   
   **Note for Windows users:** If you encounter "metadata-generation-failed" errors:
   - Install Microsoft Visual C++ Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Restart your terminal after installing
   - Use the `install_windows.bat` script which installs packages in the correct order
   - Or try installing packages individually:
     ```bash
     pip install torch --index-url https://download.pytorch.org/whl/cpu
     pip install sentence-transformers
     pip install chromadb
     pip install -r requirements.txt
     ```

5. **Create a `.env` file in the backend directory:**
   ```env
   SECRET_KEY=your-secret-key-here
   GROQ_API_KEY=your-groq-api-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/callback
   DATABASE_URL=sqlite:///./autogmail.db
   ```

   **Note:** You need to:
   - Generate a secret key (can use: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
   - Get a Groq API key from [Groq Console](https://console.groq.com/)
   - Create a Google OAuth 2.0 application at [Google Cloud Console](https://console.cloud.google.com/)
     - Enable Gmail API
     - Add `http://localhost:8000/api/v1/auth/callback` as an authorized redirect URI

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd autogmail-landing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Activate your virtual environment** (if not already activated):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Run the backend server:**
   ```bash
   # Option 1: Using the batch file (Windows)
   run_backend.bat
   
   # Option 2: Using uvicorn directly
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at: `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Start the Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd autogmail-landing
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:8080`

## Application Flow

1. **Landing Page** (`http://localhost:8080/`)
   - Click "Get Started" to initiate Google OAuth login

2. **Authentication**
   - Redirects to Google OAuth
   - After authentication, redirects back to `/auth/callback`
   - Token is stored in localStorage

3. **Dashboard** (`http://localhost:8080/dashboard`)
   - View inbox emails
   - Generate AI-powered replies
   - Upload policy documents
   - Sync sent emails for training

## API Endpoints

The backend exposes the following main endpoints:

- `GET /api/v1/auth/login` - Initiate Google OAuth login
- `GET /api/v1/auth/callback` - OAuth callback handler
- `GET /api/v1/gmail/inbox` - Get inbox emails
- `POST /api/v1/gmail/draft` - Create a draft email
- `POST /api/v1/gmail/sync-sent` - Sync sent emails for training
- `POST /api/v1/generate/draft` - Generate AI reply draft
- `POST /api/v1/documents/upload` - Upload policy documents

## Configuration

### Backend Configuration
- Backend runs on port **8000**
- CORS is configured to allow requests from `http://localhost:8080`
- Database: SQLite (stored as `autogmail.db` in backend directory)

### Frontend Configuration
- Frontend runs on port **8080**
- API base URL: `http://localhost:8000/api/v1`
- Configured in `autogmail-landing/src/lib/api.ts`

## Troubleshooting

### Backend Issues

1. **Metadata generation failed / Installation errors:**
   
   **If you're using Python 3.14:**
   - Python 3.14 is very new and many packages don't have wheels for it yet
   - **Recommended:** Use Python 3.11 or 3.12 instead
   - Or use the fix script: `install_fix_python314.bat` (installs core packages, skips problematic ML packages)
   
   **For all Python versions:**
   - **Windows users:** Install Microsoft Visual C++ Build Tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Upgrade pip, setuptools, and wheel:
     ```bash
     pip install --upgrade pip setuptools wheel
     ```
   - Try installing core packages first (without ML):
     ```bash
     pip install -r requirements-minimal.txt
     ```
   - Then try ML packages separately:
     ```bash
     pip install torch --index-url https://download.pytorch.org/whl/cpu
     pip install sentence-transformers
     pip install chromadb
     ```
   - If ML packages fail, the app will still work but RAG/vector features will be limited
   - **Best practice:** Use Python 3.11 or 3.12 for best compatibility

2. **Module not found errors:**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **Database errors:**
   - Delete `autogmail.db` to reset the database
   - The database will be recreated on next startup

4. **Google OAuth errors:**
   - Verify `.env` file has correct Google credentials
   - Ensure redirect URI matches exactly: `http://localhost:8000/api/v1/auth/callback`
   - Check that Gmail API is enabled in Google Cloud Console

### Frontend Issues

1. **Cannot connect to backend:**
   - Ensure backend is running on port 8000
   - Check CORS configuration in `backend/main.py`
   - Verify API base URL in `autogmail-landing/src/lib/api.ts`

2. **Dependencies issues:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

## Development Notes

- Backend uses FastAPI with automatic API documentation at `/docs`
- Frontend uses Vite for fast development with hot module replacement
- Both servers support hot-reload during development
- Token-based authentication using JWT tokens stored in localStorage

## License

This project is private and proprietary.

