# SAC Treasury Portal - Quick Start Guide

Get the portal running locally in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- npm installed
- Supabase account created
- Gmail with app password ready

## 🚀 Quick Setup

### 1. Database (3 minutes)

1. Create Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run these files in order:
   - `database/01_create_tables.sql`
   - `database/02_row_level_security.sql`
   - `database/03_helper_functions.sql`
4. Get credentials from Settings → API

### 2. Backend (3 minutes)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_KEY=<your-service-key>
BANK_ENCRYPTION_KEY=<run-command-below>
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<your-app-password>
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start backend:
```bash
npm run dev
```

Backend runs at http://localhost:5000

### 3. Frontend (2 minutes)

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

Frontend opens at http://localhost:3000

### 4. Create Initial Data (2 minutes)

```bash
cd backend
npm run setup
```

Follow prompts to:
1. Create treasury account
2. Create test student accounts
3. Create test entity accounts

## 🎯 Test the Flow

### As Entity:
1. Login with entity credentials from setup
2. Create a new event
3. Add teams and members
4. Submit

### As Student:
1. Login with student credentials
2. View event in "My Events"
3. Team leader: Click "Provide Bank Details"
4. Fill and submit
5. All members: Click "View Bank Details"

### As Treasury:
1. Login with treasury credentials
2. View all events
3. Send reminders
4. Download Excel file
5. Mark payment as completed

## 📝 Sample Data

Use these test emails (they're in `sample_students.csv`):
- student1@iimidr.ac.in
- student2@iimidr.ac.in
- student3@iimidr.ac.in

And entities (in `sample_entities.csv`):
- cultural@iimidr.ac.in (Cultural Committee)
- sports@iimidr.ac.in (Sports Committee)

## 🆘 Common Issues

**Backend won't start:**
- Check if Supabase credentials are correct
- Ensure encryption key is 64 characters

**Emails not sending:**
- Verify Gmail app password
- Check EMAIL_USER and EMAIL_PASSWORD in .env

**Can't login:**
- Make sure you created users via setup script
- Check backend is running on port 5000

**Database errors:**
- Verify all SQL scripts ran successfully
- Check RLS policies are enabled

## 📚 Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. Review backend API docs in [backend/README.md](backend/README.md)
4. Explore frontend components in [frontend/README.md](frontend/README.md)

## 🎉 You're All Set!

The portal is now running locally. Try creating an event, submitting bank details, and downloading the treasury data.

For production deployment, follow [DEPLOYMENT.md](DEPLOYMENT.md).

---

**Questions?** Check the full documentation or contact the SAC Treasury team.
