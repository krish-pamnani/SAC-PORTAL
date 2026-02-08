# SAC Treasury Portal 🏦

A comprehensive prize money distribution portal for the Student Activity Council (SAC) at IIM Indore. This system manages the entire workflow from event creation to prize money disbursement with bank account encryption and automated notifications.

## 🎯 Overview

The SAC Treasury Portal streamlines prize money distribution for IPM students at IIM Indore by providing three separate dashboards for:

1. **Students**: View won events and submit bank details
2. **Entities (Clubs/Committees)**: Create events and track submissions
3. **Treasury**: Monitor all transactions and process payments

## ✨ Key Features

- ✅ **Role-Based Dashboards**: Separate portals for students, entities, and treasury
- ✅ **Team Leader System**: One designated leader per team submits bank details
- ✅ **Bank Profile Saving**: Students can save bank details for future reuse
- ✅ **AES-256 Encryption**: Bank account numbers encrypted at rest
- ✅ **Automated Emails**: Winner notifications and reminders via NodeMailer
- ✅ **Excel Export**: Treasury can download complete encrypted data
- ✅ **Payment Tracking**: Mark payments as completed with UTR numbers
- ✅ **Audit Trail**: Permanent transaction history for accounting

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React - Vercel)                   │
│  • Student Dashboard                                 │
│  • Entity Dashboard                                  │
│  • Treasury Dashboard                                │
└─────────────────────────────────────────────────────┘
                       ↓ HTTPS/REST
┌─────────────────────────────────────────────────────┐
│      Backend API (Node.js/Express - Render)         │
│  • Authentication (JWT)                              │
│  • Business Logic                                    │
│  • Email Service                                     │
│  • Encryption Service                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│         Database (Supabase PostgreSQL)               │
│  • Row-Level Security                                │
│  • Auto-generated REST API                           │
│  • Real-time capabilities                            │
└─────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Core Tables

1. **users**: All stakeholders (students, entities, treasury)
2. **events**: Events created by entities
3. **teams**: Prize-winning teams per event
4. **team_members**: Individual members with team leader flag
5. **student_bank_profiles**: Saved bank accounts (encrypted, reusable)
6. **bank_details**: Transaction records (permanent audit trail)
7. **email_logs**: Email delivery tracking

See `database/README.md` for detailed schema and setup instructions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Gmail account (for email service)

### 1. Database Setup

```bash
cd database
# Run SQL scripts in Supabase SQL Editor:
# 1. 01_create_tables.sql
# 2. 02_row_level_security.sql
# 3. 03_helper_functions.sql
```

See [database/README.md](database/README.md)

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to BANK_ENCRYPTION_KEY in .env
npm run dev
```

See [backend/README.md](backend/README.md)

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

See [frontend/README.md](frontend/README.md)

### 4. Initial Data Setup

Create treasury account:
```bash
curl -X POST http://localhost:5000/api/auth/setup/treasury \
  -H "Content-Type: application/json" \
  -d '{"email": "treasury@iimidr.ac.in", "password": "SecurePassword123"}'
```

Bulk create students (provide your 500 emails):
```bash
curl -X POST http://localhost:5000/api/auth/setup/students \
  -H "Content-Type: application/json" \
  -d '{"emails": ["student1@iimidr.ac.in", "student2@iimidr.ac.in", ...]}'
```

Create entities:
```bash
curl -X POST http://localhost:5000/api/auth/setup/entities \
  -H "Content-Type: application/json" \
  -d '{"entities": [
    {"email": "cultural@iimidr.ac.in", "entityName": "Cultural Committee"},
    {"email": "sports@iimidr.ac.in", "entityName": "Sports Committee"}
  ]}'
```

## 📖 User Workflows

### Entity (Club/Committee) Workflow

1. Login to entity dashboard
2. Click "New Event"
3. Enter event name and total prize pool
4. Add teams:
   - Enter prize amount for team
   - Add team member emails (@iimidr.ac.in)
   - Select team leader from dropdown
5. Submit event
6. Emails sent automatically to all team members
7. Monitor submission status in "Past Events"

### Student Workflow

1. Receive winner notification email
2. Login with provided credentials
3. View events in "My Events"
4. Team leader sees "Provide Bank Details" button
5. Fill bank details form:
   - Auto-fills from saved profile (if exists)
   - Option to save for future use
   - Amount shown automatically
6. Submit → All team members can now view details
7. Track payment status

### Treasury Workflow

1. Login to treasury dashboard
2. View all events and submission status
3. Send reminders to pending teams
4. Download Excel with all bank details
5. Make payments via bank
6. Mark each payment as completed with UTR
7. Students see "Paid ✓" status

## 🔐 Security Features

### Encryption
- **Algorithm**: AES-256-GCM
- **Scope**: Bank account numbers
- **Storage**: Encrypted in database
- **Decryption**: Only for treasury export

### Authentication
- **Method**: JWT tokens
- **Expiry**: 7 days
- **Storage**: localStorage (frontend)
- **Validation**: Every API request

### Row-Level Security
- Students: Only see their own events
- Entities: Only see their own events
- Treasury: Full access to all data
- Enforced at database level

### Data Protection
- HTTPS required in production
- CORS configured for specific origins
- Email domain validation (@iimidr.ac.in)
- SQL injection prevention (parameterized queries)

## 🌐 Deployment

### Backend (Render)

1. Create Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env.example`
6. Deploy

### Frontend (Vercel)

1. Connect GitHub repository
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variables
6. Deploy

### Post-Deployment

1. Update `FRONTEND_URL` in backend env to Vercel URL
2. Update `REACT_APP_API_URL` in frontend env to Render URL
3. Configure custom domains (optional)

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` env variable

### Email Templates

The system sends three types of emails:
1. **Team Leader Notification**: Highlights responsibility
2. **Team Member Notification**: Informs about team leader
3. **Reminder Email**: Sent by treasury to pending teams

## 📦 Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- Supabase JS Client
- bcrypt (password hashing)
- jsonwebtoken (JWT)
- nodemailer (emails)
- exceljs (Excel export)

### Database
- PostgreSQL (Supabase)
- Row-Level Security
- Auto-generated REST API

## 📂 Project Structure

```
sac-treasury-portal/
├── database/
│   ├── 01_create_tables.sql
│   ├── 02_row_level_security.sql
│   ├── 03_helper_functions.sql
│   └── README.md
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.css
│   └── README.md
└── README.md (this file)
```

## 🐛 Troubleshooting

### Database Issues
- Verify all SQL scripts ran successfully
- Check RLS policies are enabled
- Ensure Supabase credentials are correct

### Email Issues
- Confirm Gmail app password is correct
- Check 2FA is enabled on Gmail
- Verify EMAIL_USER and EMAIL_PASSWORD

### Deployment Issues
- Ensure all environment variables are set
- Check build logs for errors
- Verify CORS configuration

## 📝 Development Notes

### Adding New Entities
Use the bulk create endpoint or manually insert into `users` table with `user_type='entity'`

### Adding New Students
Bulk upload via API or import CSV to `users` table

### Changing Encryption Key
⚠️ Never change BANK_ENCRYPTION_KEY after data is encrypted! All existing data will become unreadable.

## 🤝 Support

For issues, questions, or feature requests:
- Contact: SAC Treasury Team, IIM Indore
- Email: treasury@iimidr.ac.in

## 📜 License

This project is developed for IIM Indore Student Activity Council. Internal use only.

---

**Built with ❤️ for IIM Indore IPM Students**
