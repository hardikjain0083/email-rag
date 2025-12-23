# Google Cloud Deployment Guide

This guide will help you deploy AutoGmail to Google Cloud Platform (GCP) using Cloud Run for the backend and Cloud Storage/CDN for the frontend.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed: https://cloud.google.com/sdk/docs/install
3. **Docker** installed (for local testing)
4. **Git** installed

## Part 1: Initial GCP Setup

### Step 1: Create a GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `autogmail` (or your choice)
4. Click **"Create"**
5. Note your **Project ID** (you'll need this)

### Step 2: Enable Required APIs

Run these commands in your terminal:

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    storage-api.googleapis.com \
    storage-component.googleapis.com
```

Or enable via Console:
- Go to **APIs & Services** → **Library**
- Enable: Cloud Build, Cloud Run, Container Registry, Cloud SQL, Cloud Storage

### Step 3: Authenticate

```bash
gcloud auth login
gcloud auth configure-docker
```

---

## Part 2: Backend Deployment (Cloud Run)

### Step 1: Prepare Backend Code

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Verify Dockerfile exists** (already created)

3. **Update CORS in `main.py`** to allow your frontend domain:
   ```python
   origins = [
       "https://hardikjain0083-email-rag.hf.space",
       "https://your-frontend-domain.com",  # Add your frontend URL
   ]
   ```

### Step 2: Build and Push Docker Image

```bash
# Set variables
export PROJECT_ID=your-project-id
export SERVICE_NAME=autogmail-backend
export REGION=us-central1  # Change to your preferred region

# Build the Docker image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Or build locally and push
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
```

### Step 3: Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-env-vars="SECRET_KEY=your-secret-key-here" \
    --set-secrets="GROQ_API_KEY=groq-api-key:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest"
```

**Note:** For secrets, you'll need to create them first (see Step 4).

### Step 4: Create Secrets in Secret Manager

```bash
# Create secrets
echo -n "your-groq-api-key" | gcloud secrets create groq-api-key --data-file=-
echo -n "your-google-client-id" | gcloud secrets create google-client-id --data-file=-
echo -n "your-google-client-secret" | gcloud secrets create google-client-secret --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding groq-api-key \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-id \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding google-client-secret \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

**Get PROJECT_NUMBER:**
```bash
gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
```

### Step 5: Update Environment Variables

After deployment, update the service with all environment variables:

```bash
gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --update-env-vars="SECRET_KEY=your-secret-key,DATABASE_URL=sqlite:///./autogmail.db,GOOGLE_REDIRECT_URI=https://YOUR-SERVICE-URL.run.app/api/v1/auth/callback" \
    --update-secrets="GROQ_API_KEY=groq-api-key:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest"
```

### Step 6: Get Your Backend URL

```bash
# Get the service URL
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
```

Save this URL - you'll need it for the frontend configuration.

---

## Part 3: Database Setup (Optional - For Production)

For production, use Cloud SQL instead of SQLite:

### Option A: Cloud SQL (PostgreSQL) - Recommended

```bash
# Create Cloud SQL instance
gcloud sql instances create autogmail-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=$REGION

# Create database
gcloud sql databases create autogmail --instance=autogmail-db

# Create user
gcloud sql users create autogmail-user \
    --instance=autogmail-db \
    --password=your-secure-password

# Get connection name
gcloud sql instances describe autogmail-db --format="value(connectionName)"
```

Update `DATABASE_URL` in Cloud Run:
```
postgresql://autogmail-user:password@/autogmail?host=/cloudsql/CONNECTION_NAME
```

Connect Cloud Run to Cloud SQL:
```bash
gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --add-cloudsql-instances=CONNECTION_NAME
```

### Option B: Keep SQLite (Not Recommended for Production)

SQLite will work but data won't persist between container restarts. Use Cloud Storage for persistence.

---

## Part 4: Frontend Deployment

### Option A: Deploy to Cloud Run (Recommended)

1. **Create Dockerfile for frontend:**

Create `autogmail-landing/Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `autogmail-landing/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

2. **Build and deploy:**

```bash
cd autogmail-landing

# Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/autogmail-frontend \
    --build-arg=VITE_API_URL=https://YOUR-BACKEND-URL.run.app/api/v1

# Deploy
gcloud run deploy autogmail-frontend \
    --image gcr.io/$PROJECT_ID/autogmail-frontend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi
```

### Option B: Deploy to Cloud Storage + Cloud CDN

1. **Build frontend locally:**

```bash
cd autogmail-landing

# Set API URL
export VITE_API_URL=https://YOUR-BACKEND-URL.run.app/api/v1

# Install and build
npm install
npm run build
```

2. **Create Cloud Storage bucket:**

```bash
export BUCKET_NAME=autogmail-frontend

# Create bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME

# Enable static website hosting
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Upload files
gsutil -m cp -r dist/* gs://$BUCKET_NAME/

# Make files publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

3. **Set up Cloud CDN (Optional):**

```bash
# Create load balancer and CDN
# This requires more setup - see Cloud Load Balancing docs
```

---

## Part 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://YOUR-BACKEND-URL.run.app/api/v1/auth/callback`
   - `https://YOUR-FRONTEND-URL.run.app/auth/callback` (if using Cloud Run)
5. Add authorized JavaScript origins:
   - `https://YOUR-FRONTEND-URL.run.app`
   - `https://YOUR-BUCKET-NAME.storage.googleapis.com` (if using Cloud Storage)

---

## Part 6: Update Backend Code

### Update Auth Callback Redirect

Edit `backend/app/api/auth.py`:

```python
return RedirectResponse(
    url=f"https://YOUR-FRONTEND-URL.run.app/auth/callback?token={access_token}&email={user.email}"
)
```

Or if using Cloud Storage:
```python
return RedirectResponse(
    url=f"https://YOUR-BUCKET-NAME.storage.googleapis.com/auth/callback?token={access_token}&email={user.email}"
)
```

### Update CORS

Edit `backend/main.py`:

```python
origins = [
    "https://YOUR-FRONTEND-URL.run.app",
    "https://YOUR-BUCKET-NAME.storage.googleapis.com",
]
```

---

## Part 7: Continuous Deployment (Optional)

### Set up Cloud Build Triggers

1. **Connect repository to Cloud Build:**
   - Go to **Cloud Build** → **Triggers**
   - Click **"Create Trigger"**
   - Connect your GitHub/GitLab repository
   - Set build configuration to use `backend/cloudbuild.yaml`

2. **Create `backend/cloudbuild.yaml`:**

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/autogmail-backend', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/autogmail-backend']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'autogmail-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/autogmail-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/autogmail-backend'
```

---

## Part 8: Monitoring and Logging

### View Logs

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=autogmail-backend" --limit 50
```

Or use Cloud Console:
- Go to **Cloud Run** → Select service → **Logs**

### Set up Monitoring

1. Go to **Monitoring** → **Dashboards**
2. Create custom dashboard for your service
3. Set up alerts for errors and high latency

---

## Part 9: Cost Optimization

### Cloud Run Settings

- **Min instances**: 0 (scale to zero when not in use)
- **Max instances**: 10 (adjust based on traffic)
- **CPU**: 1-2 vCPU (adjust based on ML workload)
- **Memory**: 2Gi (adjust based on ChromaDB usage)

### Estimated Costs (Monthly)

- **Cloud Run**: ~$10-50 (depending on traffic)
- **Cloud Storage**: ~$1-5 (for frontend)
- **Cloud SQL**: ~$7-25 (if using)
- **Secret Manager**: Free tier covers most use cases

---

## Troubleshooting

### Backend Issues

1. **Service won't start:**
   - Check logs: `gcloud run services logs read autogmail-backend`
   - Verify environment variables are set
   - Check secrets are accessible

2. **CORS errors:**
   - Verify frontend URL is in CORS origins
   - Check browser console for exact error

3. **Database errors:**
   - If using SQLite, ensure Cloud Storage is mounted
   - Consider migrating to Cloud SQL

### Frontend Issues

1. **API calls failing:**
   - Verify `VITE_API_URL` is set correctly
   - Check backend CORS settings
   - Verify backend is accessible

2. **OAuth redirect errors:**
   - Check redirect URI matches exactly in Google Console
   - Verify callback URL is correct

---

## Quick Reference Commands

```bash
# Set project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Deploy backend
gcloud run deploy autogmail-backend \
    --image gcr.io/$PROJECT_ID/autogmail-backend \
    --region us-central1 \
    --allow-unauthenticated

# View logs
gcloud run services logs read autogmail-backend --region us-central1

# Update environment variables
gcloud run services update autogmail-backend \
    --region us-central1 \
    --update-env-vars="KEY=value"

# Get service URL
gcloud run services describe autogmail-backend \
    --region us-central1 \
    --format="value(status.url)"
```

---

## Next Steps

1. Set up custom domain (optional)
2. Configure Cloud Armor for DDoS protection
3. Set up Cloud CDN for better performance
4. Implement monitoring and alerting
5. Set up backup strategy for database
6. Configure auto-scaling policies

---

## Support

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

