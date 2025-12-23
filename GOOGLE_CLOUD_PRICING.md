# Google Cloud Free Tier & Pricing Guide for AutoGmail

## Google Cloud Free Options

Google Cloud offers two types of free usage:

### 1. **Always Free Tier** (Never expires)
- Limited resources that are free forever
- Available to all Google Cloud customers

### 2. **Free Trial** (90 days, $300 credit)
- $300 credit valid for 90 days
- Can use any GCP service
- After 90 days or when credit runs out, you pay for usage

---

## Always Free Tier Limits (What's Free Forever)

### Cloud Run (Backend)
- ✅ **2 million requests per month** (free)
- ✅ **360,000 GB-seconds** of compute time
- ✅ **180,000 vCPU-seconds** of compute time
- ✅ **1 GB egress** (outbound data transfer) per month

**What this means for AutoGmail:**
- ~66,000 requests/day free
- ~5 hours/day of compute time (if using 1 vCPU)
- Enough for small to medium traffic

**After free tier:**
- $0.40 per million requests
- $0.00002400 per GB-second
- $0.00001000 per vCPU-second

### Cloud Storage (Frontend)
- ✅ **5 GB storage** (free)
- ✅ **1 GB egress** per month (free)
- ✅ **5,000 Class A operations** (writes) per month
- ✅ **50,000 Class B operations** (reads) per month

**What this means:**
- Frontend static files: ~5 GB free
- Enough for most small projects

**After free tier:**
- $0.020 per GB storage
- $0.12 per GB egress
- $0.05 per 10,000 Class A operations
- $0.004 per 10,000 Class B operations

### Cloud Build
- ✅ **120 build-minutes per day** (free)
- ✅ **10 concurrent builds**

**What this means:**
- 2 hours of build time per day free
- Enough for multiple deployments

**After free tier:**
- $0.003 per build-minute

### Container Registry
- ✅ **0.5 GB storage** (free)
- ✅ **1 GB egress** per month

**What this means:**
- Can store small Docker images
- May need to clean up old images

**After free tier:**
- $0.026 per GB storage

### Secret Manager
- ✅ **6 secrets** (free)
- ✅ **10,000 secret versions** per month

**What this means:**
- Perfect for your 3-4 secrets (GROQ_API_KEY, GOOGLE_CLIENT_ID, etc.)

**After free tier:**
- $0.06 per secret per month
- $0.03 per 10,000 secret versions

### Cloud SQL (Optional - for production database)
- ❌ **Not included in Always Free**
- But you can use SQLite (free) or Cloud SQL with free trial credit

---

## Free Trial ($300 Credit - 90 Days)

### What You Get
- **$300 credit** to use on any GCP service
- **90 days** to use it
- **12 months** of Always Free tier continues after trial

### What This Covers
With $300, you can run AutoGmail for approximately:

**Conservative estimate:**
- **Cloud Run**: ~$20-50/month (depending on traffic)
- **Cloud Storage**: ~$1-5/month
- **Cloud Build**: ~$5-10/month (if building frequently)
- **Total**: ~$26-65/month

**This means:** ~4-11 months of free usage with $300 credit

---

## Cost Breakdown for AutoGmail

### Backend (Cloud Run)

**Minimal usage (testing):**
- Requests: 1,000/day = 30,000/month = **FREE** (under 2M limit)
- Compute: 1 hour/day = 30 hours/month = **FREE** (under 360K GB-seconds)
- **Cost: $0/month**

**Light usage (small team):**
- Requests: 10,000/day = 300,000/month = **FREE**
- Compute: 2 hours/day = 60 hours/month = **FREE**
- **Cost: $0/month**

**Medium usage (growing):**
- Requests: 100,000/day = 3M/month = **$0.40** (1M over free tier)
- Compute: 4 hours/day = 120 hours/month = **FREE**
- Memory: 2GB, 1 vCPU
- **Cost: ~$0.40-5/month**

**Heavy usage:**
- Requests: 1M/day = 30M/month = **$11.20** (28M over free tier)
- Compute: 8 hours/day = 240 hours/month = **~$2-5**
- **Cost: ~$15-20/month**

### Frontend (Cloud Storage)

**Static hosting:**
- Storage: ~50MB = **FREE** (under 5GB)
- Requests: 10,000/day = **FREE** (under limits)
- Egress: ~1GB/month = **FREE**
- **Cost: $0/month**

### Total Monthly Costs

| Usage Level | Backend | Frontend | Total |
|------------|---------|----------|-------|
| Testing | $0 | $0 | **$0** |
| Light | $0 | $0 | **$0** |
| Medium | $0.40-5 | $0 | **$0.40-5** |
| Heavy | $15-20 | $0 | **$15-20** |

---

## Optimizing for Free Tier

### 1. **Use Cloud Run Efficiently**
```bash
# Deploy with minimal resources
gcloud run deploy autogmail-backend \
    --memory 512Mi \      # Start small
    --cpu 1 \              # 1 vCPU
    --min-instances 0 \    # Scale to zero (saves money)
    --max-instances 5      # Limit max instances
```

### 2. **Use SQLite Instead of Cloud SQL**
- SQLite is free (included in container)
- Cloud SQL costs ~$7-25/month
- For small projects, SQLite is fine

### 3. **Optimize Builds**
- Only build when needed
- Use build caching
- Clean up old images

### 4. **Monitor Usage**
```bash
# Check your usage
gcloud billing accounts list
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID
```

### 5. **Set Budget Alerts**
1. Go to **Billing** → **Budgets & alerts**
2. Create budget: $5-10/month
3. Set alerts at 50%, 90%, 100%

---

## What Happens After Free Tier?

### Option 1: Stay on Always Free
- Continue using free tier limits
- Pay only for overage
- Most small projects stay free

### Option 2: Pay-as-You-Go
- Only pay for what you use
- No upfront costs
- Can set spending limits

### Option 3: Upgrade to Paid Tier
- Better performance guarantees
- More resources
- Support options

---

## Real-World Example: AutoGmail Costs

### Scenario: Small Team (5-10 users)

**Monthly usage:**
- API requests: 50,000/month = **FREE**
- Compute time: 40 hours/month = **FREE**
- Storage: 100MB = **FREE**
- Database: SQLite (included) = **FREE**

**Total: $0/month** ✅

### Scenario: Growing Startup (50-100 users)

**Monthly usage:**
- API requests: 500,000/month = **FREE**
- Compute time: 100 hours/month = **FREE**
- Storage: 500MB = **FREE**
- Database: SQLite = **FREE**

**Total: $0/month** ✅

### Scenario: Production (1000+ users)

**Monthly usage:**
- API requests: 5M/month = **$1.20** (3M over free tier)
- Compute time: 200 hours/month = **~$2-3**
- Storage: 2GB = **FREE**
- Database: Consider Cloud SQL = **$7-15**

**Total: ~$10-20/month**

---

## Free Tier Limitations

### What's NOT Free
- ❌ Cloud SQL (but SQLite works)
- ❌ Cloud CDN (optional, for better performance)
- ❌ Load Balancing (not needed for Cloud Run)
- ❌ Cloud Armor (security, optional)
- ❌ Monitoring beyond basic (basic is free)

### What You Can Do
- ✅ Use SQLite for database (free)
- ✅ Use Cloud Run for backend (free tier covers most use)
- ✅ Use Cloud Storage for frontend (free tier covers it)
- ✅ Use Secret Manager (free for your needs)
- ✅ Use Cloud Build (free tier covers it)

---

## Setting Up Budget Alerts

### Step 1: Create Budget
```bash
# Via Console: Billing → Budgets & alerts → Create Budget
# Or via gcloud:
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="AutoGmail Budget" \
    --budget-amount=10USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

### Step 2: Set Up Alerts
- Email alerts at 50%, 90%, 100% of budget
- Can also set Pub/Sub notifications

---

## Tips to Stay Free

1. **Monitor your usage regularly**
   - Check Cloud Console → Billing
   - Set up budget alerts

2. **Use minimal resources**
   - Start with 512Mi memory, 1 CPU
   - Scale up only if needed

3. **Optimize your code**
   - Reduce response times
   - Cache responses
   - Use efficient algorithms

4. **Clean up unused resources**
   - Delete old Cloud Run revisions
   - Remove unused container images
   - Clean up old Cloud Storage objects

5. **Use SQLite for small projects**
   - No database costs
   - Sufficient for most use cases

---

## Comparison: Free vs Paid

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Cloud Run requests | 2M/month | Unlimited |
| Cloud Run compute | 360K GB-sec | Pay per use |
| Cloud Storage | 5GB | Pay per use |
| Support | Community | Paid support available |
| SLA | None | 99.95% SLA |
| Limits | Yes | Higher limits |

---

## Conclusion

**For AutoGmail:**
- ✅ **Small projects**: Completely free (Always Free tier)
- ✅ **Medium projects**: Mostly free (~$0-5/month)
- ✅ **Large projects**: Low cost (~$10-20/month)

**Recommendation:**
1. Start with Always Free tier
2. Use $300 free trial credit for testing
3. Monitor usage and set budget alerts
4. Optimize to stay within free limits
5. Scale up only when needed

**Most users can run AutoGmail for FREE or under $5/month!** 🎉

---

## Resources

- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Storage Pricing](https://cloud.google.com/storage/pricing)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

