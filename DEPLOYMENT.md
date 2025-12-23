# Deployment Guide: Vercel (Frontend) + Hugging Face Spaces (Backend)

## Overview

This guide will help you deploy:
- **Frontend** (React/Vite) → **Vercel**
- **Backend** (FastAPI) → **Hugging Face Spaces**

---

## Part 1: Backend Deployment to Hugging Face Spaces

### Prerequisites
1. Hugging Face account (sign up at https://huggingface.co)
2. Git installed locally
3. Backend code ready

### Step 1: Prepare Backend for Hugging Face

1. **Create `app.py` file** (Hugging Face expects this):
   ```bash
   cd backend
   # Copy main.py to app.py or create a wrapper
   ```

2. **Create `requirements.txt`** (already exists, but verify it's complete)

3. **Create `Dockerfile`** (optional, but recommended):
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
   ```

4. **Update CORS in `main.py`** to allow your Vercel domain:
   ```python
   origins = [
       "https://hardikjain0083-email-rag.hf.space",
       "https://your-app.vercel.app",  # Add your Vercel URL
   ]
   ```

### Step 2: Create Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in:
   - **Space name**: `autogmail-backend` (or your choice)
   - **SDK**: Select **"Docker"** or **"Gradio"** (Docker recommended)
   - **Visibility**: Public or Private
4. Click **"Create Space"**

### Step 3: Upload Backend Code

**Option A: Using Git (Recommended)**

1. **Initialize git in backend folder** (if not already):
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Add Hugging Face remote**:
   ```bash
   git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/autogmail-backend
   git push -u origin main
   ```

**Option B: Using Web Interface**

1. Go to your Space page
2. Click **"Files and versions"** tab
3. Upload files directly:
   - `main.py` (or `app.py`)
   - `requirements.txt`
   - `app/` directory (all Python files)
   - `.env.example` (for reference, don't upload actual `.env`)

### Step 4: Configure Environment Variables

1. Go to your Space settings
2. Click **"Variables and secrets"**
3. Add these secrets:
   - `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `GROQ_API_KEY` - Your Groq API key
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `GOOGLE_REDIRECT_URI` - `https://YOUR_SPACE.hf.space/api/v1/auth/callback`
   - `DATABASE_URL` - For production, use a proper database (PostgreSQL recommended)

### Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Edit your OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://YOUR_USERNAME-autogmail-backend.hf.space/api/v1/auth/callback
   ```
4. Save changes

### Step 6: Test Backend

1. Your Space will auto-deploy
2. Check the logs in the Space interface
3. Visit: `https://YOUR_SPACE.hf.space/docs` to see API docs
4. Test health endpoint: `https://YOUR_SPACE.hf.space/`

---

## Part 2: Frontend Deployment to Vercel

### Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. GitHub account (for Git integration)
3. Frontend code ready

### Step 1: Prepare Frontend

1. **Update API base URL** in `autogmail-landing/src/lib/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: process.env.VITE_API_URL || 'https://YOUR_SPACE.hf.space/api/v1',
   });
   ```

2. **Create `.env.production`** (optional):
   ```
   VITE_API_URL=https://YOUR_USERNAME-autogmail-backend.hf.space/api/v1
   ```

3. **Update `vite.config.ts`** if needed for production builds

### Step 2: Push to GitHub

1. **Initialize git** (if not already):
   ```bash
   cd autogmail-landing
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository
   - Don't initialize with README

3. **Push code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/autogmail-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. **Import your GitHub repository**
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `autogmail-landing` (if repo is at root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - `VITE_API_URL`: `https://YOUR_SPACE.hf.space/api/v1`

6. Click **"Deploy"**

### Step 4: Update CORS in Backend

After getting your Vercel URL, update backend CORS:

1. Go to your Hugging Face Space
2. Edit `main.py` or update via web interface
3. Add your Vercel URL to origins:
   ```python
   origins = [
       "https://your-app.vercel.app",
       # ... other origins
   ]
   ```
4. Commit and push changes

### Step 5: Update Frontend API URL

1. In Vercel dashboard, go to your project
2. Go to **Settings → Environment Variables**
3. Add/update `VITE_API_URL` with your Hugging Face Space URL
4. Redeploy the project

---

## Part 3: Post-Deployment Configuration

### Update Google OAuth Redirect URI

1. In Google Cloud Console, add:
   - `https://your-app.vercel.app/auth/callback`
   - `https://YOUR_SPACE.hf.space/api/v1/auth/callback`

### Update Backend Auth Callback

Edit `backend/app/api/auth.py`:
```python
return RedirectResponse(
    url=f"https://your-app.vercel.app/auth/callback?token={access_token}&email={user.email}"
)
```

### Test the Full Flow

1. Visit your Vercel URL
2. Click "Get Started"
3. Complete OAuth flow
4. Test email generation
5. Test document upload
6. Test email sync

---

## Alternative: Using Hugging Face Inference API

If you prefer not to use Spaces, you can:

1. **Deploy backend to a VPS** (DigitalOcean, AWS, etc.)
2. **Use Hugging Face Inference Endpoints** for ML models
3. **Use external database** (Supabase, Railway, etc.)

---

## Troubleshooting

### Backend Issues

1. **Import errors**: Ensure all dependencies are in `requirements.txt`
2. **Port issues**: Hugging Face uses port 7860, ensure your code uses this
3. **Database**: Use external database (not SQLite) for production
4. **ChromaDB**: May need to use external storage or disable for production

### Frontend Issues

1. **CORS errors**: Update backend CORS with exact Vercel URL
2. **API not found**: Check `VITE_API_URL` environment variable
3. **Build fails**: Check Node.js version (use 18+)

### Common Fixes

1. **Clear browser cache** after deployment
2. **Check browser console** for errors
3. **Verify environment variables** are set correctly
4. **Check Hugging Face Space logs** for backend errors

---

## Production Considerations

1. **Database**: Use PostgreSQL (Supabase, Railway, or Neon)
2. **File Storage**: Use cloud storage (S3, Cloudflare R2) for ChromaDB
3. **Secrets Management**: Use Vercel/Hugging Face secrets, never commit `.env`
4. **Monitoring**: Set up error tracking (Sentry)
5. **Rate Limiting**: Add rate limiting to backend
6. **SSL**: Both Vercel and Hugging Face provide SSL automatically

---

## Quick Reference

- **Backend URL**: `https://YOUR_USERNAME-autogmail-backend.hf.space`
- **Frontend URL**: `https://your-app.vercel.app`
- **API Docs**: `https://YOUR_SPACE.hf.space/docs`
- **Health Check**: `https://YOUR_SPACE.hf.space/`

---

## Next Steps

1. Set up monitoring and error tracking
2. Configure custom domain (optional)
3. Set up CI/CD for automatic deployments
4. Add database backups
5. Implement rate limiting and security measures

