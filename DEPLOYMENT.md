# Budgetly Deployment Guide

Complete step-by-step guide to deploy Budgetly to production using free-tier services.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (MongoDB Atlas)](#database-setup)
3. [Backend Deployment (Railway)](#backend-deployment)
4. [Telegram Bot Configuration](#telegram-bot-configuration)
5. [Frontend Deployment (Vercel)](#frontend-deployment)
6. [Environment Variables](#environment-variables)
7. [Testing Deployment](#testing-deployment)
8. [Custom Domain Setup](#custom-domain-setup)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Accounts Needed (All Free)
- ✅ GitHub account
- ✅ MongoDB Atlas account ([mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))
- ✅ Railway account ([railway.app](https://railway.app))
- ✅ Vercel account ([vercel.com](https://vercel.com)) - for frontend
- ✅ Telegram account

### Tools Required
- Git installed locally
- Node.js 16+ installed
- Code editor (VS Code recommended)

### Secrets to Generate
- JWT_SECRET (64-character random string)
- Telegram Bot Token (from BotFather)

---

## Database Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with email or Google
4. Complete verification

### Step 2: Create Cluster

1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select cloud provider: **AWS**
4. Choose region closest to you (or your users)
5. Cluster name: `budgetly-cluster`
6. Click "Create"

⏱️ Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `budgetly-admin`
5. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 4: Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to Railway's IPs later
4. Click "Confirm"

### Step 5: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://budgetly-admin:<password>@budgetly-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `budgettracker`
   ```
   mongodb+srv://budgetly-admin:YOUR_PASSWORD@budgetly-cluster.xxxxx.mongodb.net/budgettracker?retryWrites=true&w=majority
   ```

✅ **Save this connection string** - you'll need it for Railway!

---

## Backend Deployment

### Step 1: Prepare Code for Deployment

#### Generate JWT Secret

Open terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save the output (64-character string).

#### Update package.json

Ensure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### Step 2: Push to GitHub

```bash
cd d:\Budgetly
git init
git add .
git commit -m "Initial commit - Budgetly backend"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/budgetly.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your `budgetly` repository
6. Railway will auto-detect Node.js

### Step 4: Configure Environment Variables

1. In Railway dashboard, click your project
2. Click "Variables" tab
3. Add the following variables:

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb+srv://budgetly-admin:YOUR_PASSWORD@budgetly-cluster.xxxxx.mongodb.net/budgettracker?retryWrites=true&w=majority
JWT_SECRET=your-64-char-secret-from-step-1
FRONTEND_URL=https://budgetly.vercel.app
TELEGRAM_BOT_TOKEN=will-add-later
```

4. Click "Deploy" or wait for auto-deployment

### Step 5: Get Railway URL

1. Go to "Settings" tab
2. Under "Domains", click "Generate Domain"
3. You'll get: `your-app-name.up.railway.app`
4. **Save this URL** - this is your backend API URL!

### Step 6: Test Backend

Open browser or use curl:
```bash
curl https://your-app-name.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T...",
  "database": "connected"
}
```

✅ Backend deployed successfully!

---

## Telegram Bot Configuration

### Step 1: Create Bot with BotFather

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Bot name: `Budgetly Bot` (or your choice)
5. Bot username: `YourBudgetlyBot` (must end with 'bot')
6. **Save the bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Configure Bot Commands

Send to BotFather:
```
/setcommands
```

Select your bot, then paste:
```
start - Start the bot
link - Link Telegram to your account
add - Add a new expense
today - View today's expenses
week - View this week's expenses
budget - Check budget status
help - Show all commands
```

### Step 3: Add Bot Token to Railway

1. Go back to Railway dashboard
2. Click "Variables"
3. Update `TELEGRAM_BOT_TOKEN` with your bot token
4. Railway will auto-redeploy

### Step 4: Set Webhook

The backend will automatically set the webhook when it starts. To verify:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

You should see:
```json
{
  "url": "https://your-app-name.up.railway.app/api/telegram/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

### Step 5: Test Bot

1. Open Telegram
2. Search for your bot: `@YourBudgetlyBot`
3. Send `/start`
4. Bot should respond with welcome message

✅ Telegram bot configured!

---

## Frontend Deployment

> **Note**: If frontend is in a separate repository or conversation, adjust paths accordingly.

### Step 1: Prepare Frontend

Ensure `frontend/.env` or `frontend/.env.production` has:
```bash
VITE_API_URL=https://your-app-name.up.railway.app/api
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Framework Preset: **Vite** (or auto-detected)
5. Root Directory: `frontend` (if monorepo)
6. Build Command: `npm run build`
7. Output Directory: `dist`

### Step 3: Add Environment Variable

1. In Vercel project settings
2. Go to "Environment Variables"
3. Add:
   - Name: `VITE_API_URL`
   - Value: `https://your-app-name.up.railway.app/api`
   - Environment: Production, Preview, Development
4. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. You'll get: `https://budgetly.vercel.app`

### Step 5: Update Backend CORS

Go back to Railway and update `FRONTEND_URL`:
```bash
FRONTEND_URL=https://budgetly.vercel.app
```

✅ Frontend deployed!

---

## Environment Variables

### Complete Backend .env (Railway)

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=mongodb+srv://budgetly-admin:YOUR_PASSWORD@budgetly-cluster.xxxxx.mongodb.net/budgettracker?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-64-character-random-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=https://budgetly.vercel.app

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Railway auto-sets this
RAILWAY_PUBLIC_DOMAIN=your-app-name.up.railway.app
```

### Complete Frontend .env (Vercel)

```bash
VITE_API_URL=https://your-app-name.up.railway.app/api
```

---

## Testing Deployment

### Backend API Tests

```bash
# Health check
curl https://your-app-name.up.railway.app/api/health

# Signup
curl -X POST https://your-app-name.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST https://your-app-name.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Frontend Tests

1. Open `https://budgetly.vercel.app`
2. Test signup/login
3. Add an expense
4. Check if it appears in the list

### Telegram Bot Tests

1. Open your bot in Telegram
2. Send `/start`
3. Create account on web app
4. Link Telegram account
5. Send `/add 50 Coffee`
6. Check if expense appears on web app

### Integration Test

1. Add expense via Telegram
2. Refresh web app → should appear
3. Add expense via web app
4. Send `/today` in Telegram → should show new expense

✅ All systems working!

---

## Custom Domain Setup

### For Frontend (Vercel)

1. Buy domain from Namecheap, Google Domains, etc.
2. In Vercel project settings → "Domains"
3. Add your domain: `budgetly.com`
4. Vercel provides DNS records
5. Add records to your domain provider:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
6. Wait for DNS propagation (up to 48 hours)
7. SSL certificate auto-generated

### For Backend (Railway)

1. In Railway project → "Settings" → "Domains"
2. Click "Custom Domain"
3. Enter: `api.budgetly.com`
4. Add CNAME record to your DNS:
   - Type: `CNAME`, Name: `api`, Value: `your-app-name.up.railway.app`
5. SSL certificate auto-generated

### Update Environment Variables

**Railway:**
```bash
FRONTEND_URL=https://budgetly.com
```

**Vercel:**
```bash
VITE_API_URL=https://api.budgetly.com/api
```

---

## Monitoring & Maintenance

### Railway Monitoring

1. **View Logs**: Railway dashboard → "Deployments" → Click deployment → "View Logs"
2. **Metrics**: See CPU, Memory, Network usage
3. **Alerts**: Set up email alerts for crashes

### MongoDB Atlas Monitoring

1. **Metrics**: Atlas dashboard → "Metrics"
2. **Alerts**: Set up alerts for:
   - High connection count
   - Storage usage > 80%
   - Query performance issues

### Error Tracking (Optional)

**Sentry Integration:**

1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Add to backend:
   ```bash
   npm install @sentry/node
   ```
4. Add DSN to Railway environment variables
5. Initialize in `server.js`

### Database Backups

**MongoDB Atlas:**
- Free tier: 7-day retention
- Enable in Atlas dashboard → "Backup"
- Manual snapshots available

**Manual Backup Script:**
```bash
mongodump --uri="YOUR_DATABASE_URL" --out=backup
```

---

## Troubleshooting

### Backend Won't Start

**Check Railway logs:**
```
Railway Dashboard → Deployments → View Logs
```

**Common issues:**
- ❌ Missing environment variables
- ❌ Database connection string incorrect
- ❌ Port configuration wrong (should be 3000)

**Fix:**
1. Verify all environment variables are set
2. Test database connection string locally
3. Check `package.json` has correct start script

### Telegram Bot Not Responding

**Check webhook:**
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

**Common issues:**
- ❌ Webhook URL not set
- ❌ Bot token incorrect
- ❌ Backend not receiving webhook calls

**Fix:**
1. Verify `TELEGRAM_BOT_TOKEN` in Railway
2. Check backend logs for webhook errors
3. Manually set webhook:
   ```bash
   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
     -d "url=https://your-app-name.up.railway.app/api/telegram/webhook"
   ```

### CORS Errors

**Symptoms:**
- Frontend can't call backend API
- Browser console shows CORS error

**Fix:**
1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. No trailing slash in URL
3. Check backend CORS configuration allows your frontend domain

### Database Connection Fails

**Check:**
1. MongoDB Atlas cluster is running
2. Network access allows 0.0.0.0/0
3. Database user password is correct
4. Connection string has correct database name

**Test connection:**
```bash
# Install MongoDB tools
npm install -g mongodb

# Test connection
mongo "YOUR_DATABASE_URL"
```

### High Memory Usage

**Railway free tier: 512MB RAM**

**Optimize:**
1. Add connection pooling
2. Limit concurrent requests
3. Enable compression
4. Clear logs regularly

### Rate Limiting Issues

**If users hit rate limits:**

1. Adjust in backend:
   ```javascript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 200 // increase from 100
   });
   ```

2. Redeploy to Railway

---

## Deployment Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database connected and tested
- [ ] Backend health check responds
- [ ] Telegram bot responds to commands
- [ ] Frontend loads and connects to API
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic)

### Security
- [ ] JWT_SECRET is strong and random
- [ ] No secrets in code or GitHub
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] Error messages don't leak info

### Testing
- [ ] Can signup/login
- [ ] Can add/view/delete expenses
- [ ] Budget calculations correct
- [ ] Telegram bot creates expenses
- [ ] Cross-platform sync works

### Documentation
- [ ] README.md updated with live URLs
- [ ] API documentation complete
- [ ] User guide created
- [ ] Support contact added

---

## Cost Summary

| Service | Plan | Monthly Cost | Limits |
|---------|------|--------------|--------|
| Railway | Hobby | **$0** | $5 credit/month, 512MB RAM |
| MongoDB Atlas | M0 Free | **$0** | 512MB storage, shared CPU |
| Vercel | Free | **$0** | 100GB bandwidth |
| Telegram | Free | **$0** | Unlimited messages |
| **Total** | | **$0/month** | |

### When to Upgrade

**Railway ($5/month Hobby):**
- More than 100 concurrent users
- Need more than 512MB RAM
- Exceed $5 credit

**MongoDB Atlas ($9/month M10):**
- Need more than 512MB storage
- Need dedicated CPU
- Need automated backups

**Vercel ($20/month Pro):**
- Need more than 100GB bandwidth
- Need team collaboration
- Need advanced analytics

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Configure MongoDB Atlas
3. ✅ Set up Telegram bot
4. ✅ Deploy frontend to Vercel
5. ✅ Test all integrations
6. 🎉 Share with users!

## Support

**Issues?**
- Check Railway logs
- Check MongoDB Atlas metrics
- Review this guide's troubleshooting section
- Open GitHub issue

**Questions?**
- Email: your.email@example.com
- Telegram: @yourusername

---

**🎉 Congratulations! Your Budgetly app is now live!**
