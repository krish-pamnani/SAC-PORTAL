# SAC Treasury Portal - Implementation Checklist

Use this checklist to track your implementation and deployment progress.

## 📋 Pre-Implementation

- [ ] Read PROJECT_SUMMARY.md for complete overview
- [ ] Review QUICKSTART.md for local setup steps
- [ ] Review DEPLOYMENT.md for production deployment
- [ ] Prepare list of 500 student emails (@iimidr.ac.in)
- [ ] Prepare list of entities (clubs/committees) with emails
- [ ] Set up Gmail account for sending emails
- [ ] Create Supabase account
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Create GitHub account (if not already)

## 🗄️ Database Setup

- [ ] Create Supabase project
- [ ] Run `01_create_tables.sql` in SQL Editor
- [ ] Run `02_row_level_security.sql` in SQL Editor
- [ ] Run `03_helper_functions.sql` in SQL Editor
- [ ] Verify all tables created successfully
- [ ] Verify RLS policies are enabled
- [ ] Copy Supabase URL
- [ ] Copy Supabase Anon Key
- [ ] Copy Supabase Service Role Key (keep secret!)
- [ ] Disable public sign-ups in Authentication settings

## 🔧 Backend Setup (Local)

- [ ] Navigate to backend folder
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Add Supabase URL to `.env`
- [ ] Add Supabase keys to `.env`
- [ ] Generate JWT secret (any random string)
- [ ] Generate bank encryption key (64 hex characters)
- [ ] Add Gmail credentials to `.env`
- [ ] Add Gmail app password to `.env`
- [ ] Test backend with `npm run dev`
- [ ] Verify backend runs on http://localhost:5000
- [ ] Test health endpoint: `curl http://localhost:5000/health`

## 🎨 Frontend Setup (Local)

- [ ] Navigate to frontend folder
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Add backend URL (http://localhost:5000)
- [ ] Add Supabase URL
- [ ] Add Supabase Anon Key
- [ ] Run `npm start`
- [ ] Verify frontend opens at http://localhost:3000
- [ ] Check no console errors

## 👥 Initial Data Setup

### Treasury Account
- [ ] Run setup script: `cd backend && npm run setup`
- [ ] Create treasury account (option 1)
- [ ] Save treasury credentials securely
- [ ] Test treasury login on frontend

### Student Accounts
- [ ] Prepare student emails CSV file
- [ ] Run setup script (option 2)
- [ ] Provide CSV file path or enter emails
- [ ] Verify success count
- [ ] Save generated credentials file
- [ ] Test random student login

### Entity Accounts
- [ ] Prepare entities list (email, name)
- [ ] Run setup script (option 3)
- [ ] Provide CSV file or enter manually
- [ ] Verify success count
- [ ] Save generated credentials file
- [ ] Test random entity login

## 🧪 Local Testing

### Entity Workflow
- [ ] Login as entity
- [ ] Navigate to "New Event"
- [ ] Create test event with 2 teams
- [ ] Add 3 members to team 1
- [ ] Add 2 members to team 2
- [ ] Select team leaders for both teams
- [ ] Submit event
- [ ] Verify success message
- [ ] Check emails were sent
- [ ] View event in "Past Events"

### Student Workflow
- [ ] Login as team leader from team 1
- [ ] View event in "My Events"
- [ ] Click "Provide Bank Details"
- [ ] Fill bank details form
- [ ] Check "Save these details for future use"
- [ ] Submit form
- [ ] Verify success
- [ ] Logout
- [ ] Login as another team member
- [ ] Verify "View Bank Details" button appears
- [ ] Click and verify all details shown
- [ ] Login as team leader from team 2
- [ ] Verify form auto-fills from saved profile
- [ ] Submit

### Treasury Workflow
- [ ] Login as treasury
- [ ] View "All Events"
- [ ] Verify both teams and submission status
- [ ] Click "Send Reminder" (should skip submitted teams)
- [ ] Navigate to "Download Data"
- [ ] Download Excel file
- [ ] Open and verify decrypted account numbers
- [ ] Mark team 1 payment as completed
- [ ] Enter payment date and UTR
- [ ] Verify payment status updates

## 🌐 Production Deployment

### GitHub
- [ ] Create new private repository
- [ ] Push code to GitHub
- [ ] Verify all files pushed

### Backend (Render)
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables (copy from local .env)
- [ ] Deploy
- [ ] Wait for deployment (~5 min)
- [ ] Copy deployment URL
- [ ] Test health endpoint
- [ ] Check logs for errors

### Frontend (Vercel)
- [ ] Create new project on Vercel
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Set framework preset: Create React App
- [ ] Add environment variables
- [ ] Set REACT_APP_API_URL to Render URL
- [ ] Deploy
- [ ] Wait for deployment (~3 min)
- [ ] Copy deployment URL
- [ ] Test by opening in browser

### Post-Deployment
- [ ] Update backend FRONTEND_URL to Vercel URL
- [ ] Redeploy backend on Render
- [ ] Test full workflow on production:
  - [ ] Login works
  - [ ] Event creation works
  - [ ] Emails are sent
  - [ ] Bank details submission works
  - [ ] Excel download works
  - [ ] Payment marking works

## 📧 Email Configuration

- [ ] Enable 2FA on Gmail account
- [ ] Generate app password for Mail
- [ ] Add app password to backend .env
- [ ] Test email by creating treasury account
- [ ] Verify email received
- [ ] Test winner notification emails
- [ ] Test reminder emails
- [ ] Check email_logs table in Supabase

## 🔒 Security Verification

- [ ] Verify HTTPS is enabled (automatic on Vercel/Render)
- [ ] Check service role key is not in frontend code
- [ ] Verify CORS is configured correctly
- [ ] Test that students can't access entity routes
- [ ] Test that entities can't access treasury routes
- [ ] Verify bank account numbers are encrypted in database
- [ ] Test that only team leaders can submit bank details
- [ ] Verify RLS policies block unauthorized access

## 📊 Data Verification

- [ ] Check users table has all accounts
- [ ] Verify student emails are @iimidr.ac.in
- [ ] Check events table for test event
- [ ] Verify teams and team_members tables
- [ ] Check bank_details table for encrypted account numbers
- [ ] Verify email_logs table has entries
- [ ] Test Excel export has decrypted numbers

## 📚 Documentation

- [ ] Share treasury credentials with SAC team
- [ ] Distribute student credentials (via setup script CSV)
- [ ] Share entity credentials with club coordinators
- [ ] Create user guide for students (optional)
- [ ] Create user guide for entities (optional)
- [ ] Document any customizations made

## 🎉 Launch

- [ ] Announce portal to students via email
- [ ] Share login instructions
- [ ] Monitor first few event creations
- [ ] Monitor first few bank submissions
- [ ] Check for any errors in logs
- [ ] Respond to user queries
- [ ] Gather feedback
- [ ] Make improvements as needed

## 🔄 Ongoing Maintenance

- [ ] Set up weekly database backups (Supabase auto-backups)
- [ ] Monitor Render/Vercel usage
- [ ] Check email delivery regularly
- [ ] Review and archive old data annually
- [ ] Update credentials periodically
- [ ] Monitor for security updates
- [ ] Keep dependencies updated

## 🆘 Troubleshooting

If you encounter issues:

- [ ] Check backend logs in Render dashboard
- [ ] Check frontend errors in browser console
- [ ] Check database logs in Supabase
- [ ] Check email_logs table for email failures
- [ ] Review DEPLOYMENT.md troubleshooting section
- [ ] Test API endpoints with curl
- [ ] Verify environment variables are set correctly

## ✅ Final Checklist

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Production deployed
- [ ] Email working
- [ ] Data populated
- [ ] Security verified
- [ ] Users trained
- [ ] Backup plan in place
- [ ] Support process defined

---

## 📝 Notes Section

Use this space to write down:
- Deployment URLs
- Admin credentials locations
- Common issues encountered
- Custom modifications made
- Future enhancement ideas

**Backend URL**: _______________________________________________

**Frontend URL**: ______________________________________________

**Supabase Project**: __________________________________________

**Treasury Email**: _____________________________________________

**Support Contact**: ___________________________________________

---

**🎉 Once all checkboxes are ticked, your SAC Treasury Portal is live!**

Good luck! 🚀
