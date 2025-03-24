# Athena Deployment Guide

This guide provides step-by-step instructions for deploying the Athena application with:
- Backend API server on Render
- Frontend Next.js application on Vercel

## Prerequisites

- GitHub account with your Athena repository
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (or other MongoDB provider)

## Part 1: Deploy Backend API on Render

1. **Sign in to Render** and go to your dashboard.

2. **Create a new Web Service**:
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your Athena project

3. **Configure the Web Service**:
   - Name: `athena-api` (or your preferred name)
   - Root Directory: Leave empty (uses the project root)
   - Environment: `Node`
   - Region: Choose the closest to your target users
   - Branch: `main` (or your default branch)
   - Build Command: `npm install`
   - Start Command: `node server/server.js`
   - Instance Type: Free (or higher tier if needed)

4. **Set Environment Variables**:
   Click "Environment" and add the following variables:
   
   ```
   NODE_ENV=production
   PORT=10000  (Render will override this, but include it anyway)
   MONGO_URI=mongodb+srv://your_mongo_connection_string
   JWT_SECRET=your_secure_jwt_secret_for_production
   JWT_EXPIRE=30d
   COOKIE_EXPIRE=30
   CORS_ORIGIN=https://your-frontend-domain.vercel.app  (Update after Vercel deployment)
   ```

5. **Deploy the Service**:
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

6. **Verify the Deployment**:
   - Once deployed, visit the provided Render URL
   - You should see the message "API is running..."
   - Note down the URL for your backend (e.g., `https://athena-api.onrender.com`)

## Part 2: Deploy Frontend on Vercel

1. **Sign in to Vercel** and go to your dashboard.

2. **Import your repository**:
   - Click "Add New..." > "Project"
   - Select your Athena repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: Leave empty (uses the project root)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com/api
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build and deployment to complete

6. **Verify Frontend Deployment**:
   - Once deployed, visit your Vercel-provided URL
   - Test login functionality and ensure API connections work

## Part 3: Update CORS on Render After Vercel Deployment

1. **Update CORS_ORIGIN on Render**:
   - Go to your Render dashboard
   - Select your backend web service
   - Go to "Environment"
   - Update the CORS_ORIGIN variable to match your Vercel frontend URL exactly
   - Click "Save Changes"
   - Your service will automatically redeploy

## Part 4: Custom Domain Setup (Optional)

### For Vercel:
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain and follow the verification process

### For Render:
1. Go to your web service settings
2. Click on "Custom Domains"
3. Add your domain and follow verification instructions

## Troubleshooting

### CORS Issues:
- Ensure the CORS_ORIGIN on your backend exactly matches your frontend URL
- Includes https:// or http:// and no trailing slash
- Check your browser console for CORS error messages

### Authentication Problems:
- Verify JWT_SECRET is set correctly on Render
- Ensure cookies are being properly sent and received

### Database Connection Issues:
- Verify MONGO_URI is correct
- Ensure IP access is enabled in MongoDB Atlas

## Maintenance

### Updating Your Application:
1. Push changes to your GitHub repository
2. Vercel and Render will automatically rebuild and deploy

### Monitoring:
- Use Render's logging feature to monitor your backend
- Use Vercel's analytics to monitor frontend performance 