# Quick Start: Deploy to Google Cloud

## Prerequisites Checklist

- [ ] Google Cloud account with billing enabled (Free tier available!)
- [ ] Google Cloud SDK installed (`gcloud`)
- [ ] Docker installed (for local testing)
- [ ] Project code ready

> **💡 Cost Note:** AutoGmail can run **completely FREE** on Google Cloud's Always Free tier for small to medium usage. See `GOOGLE_CLOUD_PRICING.md` for details.

## Step-by-Step Deployment

### 1. Initial Setup (One-time)

```bash
# Set your project ID
export PROJECT_ID=your-project-id
export REGION=us-central1

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

# Authenticate
gcloud auth login
gcloud auth configure-docker
```

### 2. Create Secrets

```bash
# Create secrets in Secret Manager
echo -n "your-groq-api-key" | gcloud secrets create groq-api-key --data-file=-
echo -n "your-google-client-id" | gcloud secrets create google-client-id --data-file=-
echo -n "your-google-client-secret" | gcloud secrets create google-client-secret --data-file=-

# Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Save this for SECRET_KEY
```

### 3. Deploy Backend

```bash
cd backend

# Build and push image
gcloud builds submit --tag gcr.io/$PROJECT_ID/autogmail-backend

# Deploy to Cloud Run
gcloud run deploy autogmail-backend \
    --image gcr.io/$PROJECT_ID/autogmail-backend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --set-env-vars="SECRET_KEY=your-secret-key,DATABASE_URL=sqlite:///./autogmail.db" \
    --set-secrets="GROQ_API_KEY=groq-api-key:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest"

# Get backend URL
export BACKEND_URL=$(gcloud run services describe autogmail-backend --region $REGION --format="value(status.url)")
echo "Backend URL: $BACKEND_URL"
```

### 4. Update Backend Configuration

```bash
# Update CORS and redirect URI
# Edit backend/main.py - add your frontend URL to origins
# Edit backend/app/api/auth.py - update redirect URL

# Redeploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/autogmail-backend
gcloud run deploy autogmail-backend --image gcr.io/$PROJECT_ID/autogmail-backend --region $REGION
```

### 5. Deploy Frontend

```bash
cd ../autogmail-landing

# Build with API URL
gcloud builds submit --tag gcr.io/$PROJECT_ID/autogmail-frontend \
    --build-arg=VITE_API_URL=$BACKEND_URL/api/v1

# Deploy
gcloud run deploy autogmail-frontend \
    --image gcr.io/$PROJECT_ID/autogmail-frontend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi

# Get frontend URL
export FRONTEND_URL=$(gcloud run services describe autogmail-frontend --region $REGION --format="value(status.url)")
echo "Frontend URL: $FRONTEND_URL"
```

### 6. Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Edit OAuth 2.0 Client ID
4. Add redirect URI: `$BACKEND_URL/api/v1/auth/callback`
5. Add JavaScript origin: `$FRONTEND_URL`

### 7. Update Backend with Frontend URL

```bash
# Update backend with frontend URL in CORS and auth callback
# Then redeploy backend
```

## Verify Deployment

1. Visit your frontend URL
2. Click "Get Started"
3. Complete OAuth flow
4. Test email generation

## Common Issues

**CORS errors:**
- Verify frontend URL is in `backend/main.py` origins list

**OAuth redirect errors:**
- Check redirect URI matches exactly in Google Console
- Verify callback URL in `backend/app/api/auth.py`

**Service won't start:**
- Check logs: `gcloud run services logs read autogmail-backend --region $REGION`
- Verify secrets are accessible

## Next Steps

- Set up custom domain
- Configure Cloud SQL for production database
- Set up monitoring and alerts
- Configure auto-scaling

For detailed instructions, see `GOOGLE_CLOUD_DEPLOYMENT.md`

