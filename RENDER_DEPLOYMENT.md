# Deploying Onyx to Render.com

This guide will help you deploy the Onyx social media app to Render.com.

## Prerequisites

- A [Render.com](https://render.com) account (free tier works)
- Your code pushed to a GitHub/GitLab repository
- Git installed locally

## Deployment Steps

### 1. Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

### 2. Deploy Using Render Blueprint

1. **Log in to Render.com**
   - Go to [https://render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create New Blueprint**
   - Click "New +" button
   - Select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Review Services**

   Render will create three services:
   - **onyx-db**: PostgreSQL database (free tier)
   - **onyx-backend**: Node.js backend API (free tier)
   - **onyx-frontend**: Static site for React app (free tier)

4. **Configure Environment Variables**

   After deployment starts, you need to set two environment variables manually:

   **For `onyx-backend` service:**
   - Go to the backend service dashboard
   - Navigate to "Environment"
   - Set `FRONTEND_URL` to your frontend URL:
     ```
     https://onyx-frontend.onrender.com
     ```
     (Replace with your actual frontend URL)

   **For `onyx-frontend` service:**
   - Go to the frontend service dashboard
   - Navigate to "Environment"
   - Set `VITE_API_URL` to your backend API URL:
     ```
     https://onyx-backend.onrender.com/api
     ```
     (Replace with your actual backend URL and include `/api`)

5. **Trigger Redeploy**

   After setting the environment variables:
   - Redeploy the backend service (Settings → Manual Deploy → Deploy latest commit)
   - Redeploy the frontend service (Settings → Manual Deploy → Deploy latest commit)

### 3. Verify Deployment

1. **Check Backend Health**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend**
   - Visit: `https://your-frontend-url.onrender.com`
   - You should see the Onyx login page

3. **Test Registration**
   - Create a new account
   - Login and test the app functionality

## Important Notes

### Free Tier Limitations

- **Spin down**: Free tier services spin down after 15 minutes of inactivity
- **Spin up time**: First request after spin down takes 30-60 seconds
- **Database**: 90-day expiration for free PostgreSQL databases
- **Build minutes**: 500 build minutes per month

### Database Setup

The database schema is automatically created during the first build via the `npm run db:setup` command in the backend build process.

### CORS Configuration

The backend is already configured to accept requests from your frontend URL via the `FRONTEND_URL` environment variable. Make sure this is set correctly.

### Environment Variables Reference

**Backend (`onyx-backend`):**
- `PORT`: 10000 (set automatically by Render)
- `DB_HOST`: Auto-populated from database
- `DB_PORT`: Auto-populated from database
- `DB_NAME`: Auto-populated from database
- `DB_USER`: Auto-populated from database
- `DB_PASSWORD`: Auto-populated from database
- `JWT_SECRET`: Auto-generated secure value
- `NODE_ENV`: production
- `FRONTEND_URL`: **Set manually** (e.g., `https://onyx-frontend.onrender.com`)

**Frontend (`onyx-frontend`):**
- `VITE_API_URL`: **Set manually** (e.g., `https://onyx-backend.onrender.com/api`)

## Troubleshooting

### Backend won't start
- Check the logs in Render dashboard
- Verify database connection environment variables
- Ensure `db:setup` script ran successfully during build

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly with `/api` path
- Check browser console for CORS errors
- Ensure backend `FRONTEND_URL` matches your frontend domain

### CORS errors
- Double-check that `FRONTEND_URL` in backend matches your frontend URL exactly
- Make sure to include `https://` protocol
- Redeploy backend after changing `FRONTEND_URL`

### Database connection errors
- Check that the database service is running
- Verify the database environment variables are set correctly
- Check database logs for any errors

## Updating Your App

To deploy updates:

1. Push changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin master
   ```

2. Render will automatically detect the changes and redeploy your services

## Alternative: Manual Service Creation

If you prefer not to use the Blueprint, you can create services manually:

1. **Create PostgreSQL Database**
   - New + → PostgreSQL
   - Name: `onyx-db`
   - Choose free tier

2. **Create Backend Web Service**
   - New + → Web Service
   - Connect your repository
   - Root directory: Leave blank
   - Build command: `cd backend && npm install && npm run db:setup`
   - Start command: `cd backend && npm start`
   - Add environment variables (link to database)

3. **Create Frontend Static Site**
   - New + → Static Site
   - Connect your repository
   - Root directory: Leave blank
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Add environment variable `VITE_API_URL`

## Support

For issues with Render deployment, check:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Your service logs in the Render dashboard
