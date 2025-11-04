# 🚀 Quick Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up with GitHub at vercel.com)
- Railway account (sign up with GitHub at railway.app)

---

## Step 1: Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Name it: onyx-social

# Then run these commands:
git remote add origin https://github.com/YOUR_USERNAME/onyx-social.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `onyx-social` repository
4. Click "Add variables" and add these environment variables:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars
FRONTEND_URL=https://your-app.vercel.app
```

5. Click "Add PostgreSQL" database
6. Railway will auto-set `DATABASE_URL`
7. Click "Settings" → "Generate Domain" to get your backend URL
8. Copy the backend URL (e.g., `https://onyx-production.up.railway.app`)

9. **Run database setup:**
   - Go to your Railway project
   - Open the backend service
   - Click on "Variables" tab
   - Add these additional variables from the PostgreSQL database:
     - `DB_HOST` (from DATABASE_URL)
     - `DB_PORT` (usually 5432)
     - `DB_NAME` (from DATABASE_URL)
     - `DB_USER` (from DATABASE_URL)
     - `DB_PASSWORD` (from DATABASE_URL)

   - Or simply add in the "Settings" → "Start Command":
   ```
   npm run db:setup && npm start
   ```

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your `onyx-social` repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend.railway.app/api` (your Railway URL from Step 2)

6. Click "Deploy"

7. Once deployed, copy your Vercel URL (e.g., `https://onyx-social.vercel.app`)

8. **Update backend environment:**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy the backend

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Try creating a story with camera
4. Add a friend
5. Send a snap
6. Like some stories!

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Redeploy backend after changing environment variables

### Database Connection Failed
- Check that all database environment variables are set in Railway
- Make sure `npm run db:setup` was executed successfully
- Check Railway logs for errors

### 404 on Routes (Frontend)
- Make sure `vercel.json` exists in the frontend folder (it does!)
- Vercel should auto-detect it

### File Upload Issues
- For production, consider using Cloudinary or AWS S3 instead of local storage
- Railway's file system is ephemeral (files are deleted on redeploy)

---

## Production Considerations

### File Storage (Important!)
Railway's filesystem is ephemeral. For persistent file storage, you should use a cloud storage service:

**Option 1: Cloudinary (Recommended)**
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Add to Railway environment:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
3. Update `backend/middleware/upload.js` to use Cloudinary

**Option 2: AWS S3**
- More setup required but very reliable
- Add AWS credentials to Railway environment

---

## Environment Variables Summary

### Backend (Railway)
```
PORT=3000
NODE_ENV=production
DB_HOST=<from-railway-postgres>
DB_PORT=5432
DB_NAME=<from-railway-postgres>
DB_USER=<from-railway-postgres>
DB_PASSWORD=<from-railway-postgres>
JWT_SECRET=<your-random-secret-min-32-chars>
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 🎉 You're Done!

Your Onyx app is now live in production!

**Free Tier Limits:**
- Vercel: Unlimited for personal projects
- Railway: $5 credit/month (should be enough for small projects)
- Database: 512MB storage on Railway free tier

**Cost Estimate:** ~$0-5/month depending on usage

---

Need help? Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
