# Vercel Deployment Checklist

Before deploying, ensure ALL of these are complete:

## ✅ Environment Variables (Set in Vercel Dashboard)

Copy these EXACTLY to your Vercel project settings → Environment Variables:

```bash
DATABASE_URL=<your_neon_postgres_url>
OPENAI_API_KEY=<your_gemini_or_openai_api_key>
OPENAI_API_BASE=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL=gemini-flash-latest
JWT_SECRET=<generate_with_openssl_rand_hex_32>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
ENVIRONMENT=production
```

### How to Set Environment Variables in Vercel:
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable name and value
4. Click "Add" for each one
5. Redeploy after adding all variables

## Deployment Configuration

### Root Directory: `backend`
**CRITICAL**: In Vercel project settings, set Root Directory to `backend`

### Framework: Other
Select "Other" as the framework preset

## Post-Deployment Verification

### 1. Check Health Endpoint
Visit: `https://your-backend.vercel.app/health`

Expected response:
```json
{"status": "healthy"}
```

### 2. Check API Docs
Visit: `https://your-backend.vercel.app/docs`

Should show FastAPI Swagger UI

### 3. Check Error Logs
If deployment fails, check Vercel Function logs:
- Dashboard → Deployments → Click on deployment → Functions tab
- Look for error messages

## Common Errors & Solutions

### "Missing environment variables"
- The index.py will show exactly which variables are missing
- Go to Settings → Environment Variables and add them
- Redeploy

### "Database connection failed"
- Verify DATABASE_URL is correct
- Make sure your Neon database allows connections
- Check if connection string includes `?sslmode=require`

### "Import errors"
- Check requirements.txt includes all dependencies
- Verify there are no circular imports in your code

### "Function timeout"
- AI agent queries may take 30-60 seconds
- Consider using shorter prompts
- Or upgrade to Vercel Pro for 60-second timeout

## Final Steps

1. Deploy backend to Vercel
2. Copy backend URL (e.g., `https://your-backend.vercel.app`)
3. Update frontend's `NEXT_PUBLIC_API_URL` with backend URL
4. Update backend's `CORS_ORIGINS` to include frontend URL
5. Redeploy both frontend and backend
6. Test end-to-end functionality

## If Still Having Issues

Check Vercel function logs for specific error messages and share them with me for detailed troubleshooting.
