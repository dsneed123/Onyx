# Onyx Deployment Guide

## Deploying to Production

Onyx consists of two parts that need to be deployed separately:
1. **Frontend** (React + Vite) → Deploy to Vercel
2. **Backend** (Node.js + Express) → Deploy to Railway/Render/Heroku

---

## Frontend Deployment (Vercel)

### 1. Prerequisites
- GitHub account
- Vercel account (free tier works)
- Push your code to GitHub

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
cd onyx/frontend
npm install -g vercel
vercel login
vercel
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Framework preset: **Vite**
6. Add environment variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app/api`)
7. Click "Deploy"

### 3. Frontend Environment Variables
```
VITE_API_URL=https://your-backend-url.com/api
```

---

## Backend Deployment (Railway)

### 1. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Railway will auto-detect Node.js

### 2. Add Environment Variables in Railway Dashboard

```
PORT=3000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=onyx
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key-change-this
NODE_ENV=production
```

### 3. Add PostgreSQL Database

1. In Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set DATABASE_URL
3. Update your backend to use DATABASE_URL or individual variables

### 4. Run Database Setup

```bash
npm run db:setup
```

---

## Alternative: Deploy Backend to Render

### 1. Create New Web Service
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `npm start`

### 2. Add Environment Variables
Same as Railway (see above)

### 3. Add PostgreSQL
1. Click "New" → "PostgreSQL"
2. Copy the connection string
3. Add to environment variables

---

## Environment Variables Summary

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (.env)
```
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=onyx
DB_USER=postgres
DB_PASSWORD=your-db-password
JWT_SECRET=super-secret-key-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Post-Deployment

### 1. Update CORS in Backend
Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 2. Test Your Deployment
1. Visit your Vercel URL
2. Create an account
3. Upload a story
4. Send a snap to a friend

### 3. Custom Domain (Optional)
- **Vercel**: Project Settings → Domains
- **Railway**: Project Settings → Custom Domains

---

## Quick Deploy Commands

### Frontend
```bash
cd frontend
vercel --prod
```

### Backend (if using Railway CLI)
```bash
cd backend
railway login
railway link
railway up
```

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` is set in backend
- Check CORS configuration in `server.js`

### Database Connection Failed
- Verify all DB environment variables
- Run `npm run db:setup` after deployment
- Check if database allows external connections

### 404 on Routes
- Frontend: Check `vercel.json` has proper rewrites
- Backend: Verify API routes are correct

### File Upload Issues
- Make sure `uploads` directory is writable
- Consider using cloud storage (Cloudinary, AWS S3) for production

---

## Recommended Production Setup

1. **Frontend**: Vercel (Free)
2. **Backend**: Railway (Free tier available)
3. **Database**: Railway PostgreSQL (Free tier)
4. **File Storage**: Cloudinary (Free tier)

**Total Cost**: $0/month for personal projects!

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
