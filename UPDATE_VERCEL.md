# Vercel Environment Variable Update Instructions

## Update NEXT_PUBLIC_API_URL on Vercel

Your backend is now live at: **https://evolution-todo-backend-d1l1.onrender.com**

### Method 1: Via Vercel Dashboard (Easiest)
1. Go to: https://vercel.com/dashboard
2. Click your project: **hackathon-2-todo-pi**
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Find **NEXT_PUBLIC_API_URL**
6. Click the **Edit** (pencil) icon
7. Change the value to:
   ```
   https://evolution-todo-backend-d1l1.onrender.com
   ```
8. Click **Save**
9. Go to **Deployments** tab
10. Click **⋮** (three dots) next to your latest deployment
11. Click **Redeploy**
12. Wait for deployment to complete (~2 minutes)

### Method 2: Via Vercel CLI
```bash
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://evolution-todo-backend-d1l1.onrender.com

# Redeploy
vercel --prod
```

## Testing
After redeployment, visit: https://hackathon-2-todo-pi.vercel.app

1. Sign up for an account
2. Create a task
3. Test the AI chatbot
4. Verify everything works!

## ✅ What's Updated
- ✅ frontend/.env → Now points to Render backend
- ✅ Backend is live on Render
- ⏳ Vercel needs the environment variable update (you'll do this now)

## 🎉 You're Almost Done!
After updating Vercel and redeploying, your ENTIRE application will be live and accessible worldwide! 🌍
