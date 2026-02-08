# SAC Treasury Portal - Deployment Guide

Complete step-by-step guide to deploy the SAC Treasury Portal to production.

## 📋 Prerequisites Checklist

- [ ] GitHub account
- [ ] Supabase account (free tier works)
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)
- [ ] Gmail account with app password

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `sac-treasury-portal`
   - Database password: (generate strong password)
   - Region: Choose closest to India
4. Wait for project creation (~2 minutes)

### 1.2 Run Database Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Create new query and run `database/01_create_tables.sql`
3. Create another query and run `database/02_row_level_security.sql`
4. Create another query and run `database/03_helper_functions.sql`

### 1.3 Get Supabase Credentials

Go to **Settings** → **API**:
- Copy `Project URL`
- Copy `anon/public` key
- Copy `service_role` key (keep secret!)

Save these for later steps.

### 1.4 Disable Public Sign-ups

Go to **Authentication** → **Providers**:
- Disable "Enable email sign-up"
- We'll create users via API only

---

## 🚀 Step 2: Backend Deployment (Render)

### 2.1 Push Code to GitHub

```bash
cd "Krish SACT"
git init
git add .
git commit -m "Initial commit: SAC Treasury Portal"
gh repo create sac-treasury-portal --private --source=. --remote=origin --push
```

Or manually:
1. Create new private repository on GitHub
2. Push your code

### 2.2 Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: `sac-treasury-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for better performance)

### 2.3 Add Environment Variables

Click "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-role-key>
JWT_SECRET=<generate-using-command-below>
BANK_ENCRYPTION_KEY=<generate-using-command-below>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<your-gmail-app-password>
EMAIL_FROM=SAC Treasury <your-gmail>
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_EMAIL_DOMAIN=iimidr.ac.in
```

**Generate secrets:**
```bash
# JWT Secret (any random string)
openssl rand -base64 32

# Bank Encryption Key (exactly 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

Click "Create Web Service"

Wait for deployment (~5 minutes). You'll get a URL like:
`https://sac-treasury-backend.onrender.com`

### 2.5 Test Backend

```bash
curl https://sac-treasury-backend.onrender.com/health
```

Should return: `{"status":"healthy"}`

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.2 Add Environment Variables

Click "Environment Variables" and add:

```
REACT_APP_API_URL=https://sac-treasury-backend.onrender.com
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3.3 Deploy

Click "Deploy"

You'll get a URL like: `https://sac-treasury.vercel.app`

### 3.4 Update Backend Environment

Go back to Render dashboard:
1. Edit `FRONTEND_URL` environment variable
2. Set it to your Vercel URL: `https://sac-treasury.vercel.app`
3. Redeploy backend

---

## 📧 Step 4: Gmail Setup

### 4.1 Enable 2-Factor Authentication

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 4.2 Generate App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: "SAC Treasury Portal"
5. Click "Generate"
6. Copy the 16-character password
7. Use this in backend `EMAIL_PASSWORD` env variable

### 4.3 Test Email

Send a test email using your backend:
```bash
curl -X POST https://sac-treasury-backend.onrender.com/api/auth/setup/treasury \
  -H "Content-Type: application/json" \
  -d '{"email": "test@iimidr.ac.in", "password": "TestPassword123"}'
```

Check if email was received.

---

## 👥 Step 5: Initial Data Setup

### 5.1 Create Treasury Account

```bash
cd backend
npm run setup
```

Or via API:
```bash
curl -X POST https://sac-treasury-backend.onrender.com/api/auth/setup/treasury \
  -H "Content-Type: application/json" \
  -d '{"email": "treasury@iimidr.ac.in", "password": "YourSecurePassword123"}'
```

Save these credentials!

### 5.2 Bulk Create Students

Option 1: Using setup script
```bash
cd backend
npm run setup
# Choose option 2
# Provide CSV file path
```

Option 2: Via API
```bash
curl -X POST https://sac-treasury-backend.onrender.com/api/auth/setup/students \
  -H "Content-Type: application/json" \
  -d @student_emails.json
```

Where `student_emails.json`:
```json
{
  "emails": [
    "student1@iimidr.ac.in",
    "student2@iimidr.ac.in",
    ...
  ]
}
```

### 5.3 Bulk Create Entities

```bash
cd backend
npm run setup
# Choose option 3
```

Or via API:
```bash
curl -X POST https://sac-treasury-backend.onrender.com/api/auth/setup/entities \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {"email": "cultural@iimidr.ac.in", "entityName": "Cultural Committee"},
      {"email": "sports@iimidr.ac.in", "entityName": "Sports Committee"}
    ]
  }'
```

---

## ✅ Step 6: Verification

### 6.1 Test Login

1. Open your Vercel URL
2. Login as treasury: `treasury@iimidr.ac.in`
3. Verify dashboard loads

### 6.2 Create Test Event

1. Login as entity (e.g., `cultural@iimidr.ac.in`)
2. Create a new event with test data
3. Check if emails are sent to students

### 6.3 Submit Bank Details

1. Login as a test student
2. View events
3. Team leader submits bank details
4. Verify all team members can view details

### 6.4 Treasury Operations

1. Login as treasury
2. View all events
3. Send test reminder
4. Download Excel file
5. Mark payment as completed

---

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] Service role key is kept secret (not in frontend)
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] CORS is configured for specific domains only
- [ ] Email domain validation is working
- [ ] RLS policies are enabled on all tables
- [ ] Bank encryption key is saved securely
- [ ] Database backups are enabled (Supabase auto-backups)

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs
- Verify all environment variables are set
- Ensure build completed successfully

### Emails not sending
- Verify Gmail app password
- Check EMAIL_USER and EMAIL_PASSWORD
- Test with a simple curl request

### Database errors
- Check if all SQL scripts ran successfully
- Verify RLS policies are enabled
- Check Supabase logs

### Frontend shows errors
- Check browser console
- Verify API_URL is correct
- Check CORS configuration in backend

### Login fails
- Verify credentials are correct
- Check backend logs in Render
- Test API directly with curl

---

## 📊 Monitoring

### Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### Database
- Monitor via Supabase Dashboard
- Check Table Editor for data
- View logs in Supabase

### Email Logs
Check `email_logs` table in Supabase for email delivery status

---

## 🔄 Updates and Maintenance

### Update Backend
1. Push changes to GitHub
2. Render auto-deploys from `main` branch
3. Or manually deploy from Render dashboard

### Update Frontend
1. Push changes to GitHub
2. Vercel auto-deploys from `main` branch

### Database Schema Changes
1. Create new migration SQL file
2. Run in Supabase SQL Editor
3. Test thoroughly before deploying

---

## 📝 Post-Deployment Tasks

- [ ] Share treasury credentials with SAC team
- [ ] Distribute student credentials via email
- [ ] Share entity credentials with club coordinators
- [ ] Create user documentation/guide
- [ ] Set up monitoring/alerts
- [ ] Schedule regular backups
- [ ] Plan for data archival policy

---

## 🆘 Support

For deployment issues:
1. Check logs in Render/Vercel dashboards
2. Review Supabase logs
3. Test API endpoints with curl
4. Contact development team

---

**Deployment completed! 🎉**

Your SAC Treasury Portal is now live and ready to use!
