# SAC Treasury Portal - Backend API

Node.js/Express backend for the SAC Treasurer Portal with Supabase integration.

## Features

- ✅ JWT-based authentication
- ✅ AES-256-GCM encryption for bank account numbers
- ✅ Role-based access control (Student, Entity, Treasury)
- ✅ Automated email notifications (NodeMailer)
- ✅ Excel export for treasury data
- ✅ RESTful API design
- ✅ Row-level security with Supabase

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Email**: NodeMailer (Gmail SMTP)
- **Excel**: ExcelJS
- **Encryption**: Node.js Crypto (AES-256-GCM)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Encryption Key (generate using command below)
BANK_ENCRYPTION_KEY=generate-this-using-command-below

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=SAC Treasury <your-email@gmail.com>

# Frontend
FRONTEND_URL=http://localhost:3000

# Allowed Domain
ALLOWED_EMAIL_DOMAIN=iimidr.ac.in
```

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `BANK_ENCRYPTION_KEY` in `.env`.

### 4. Set Up Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password and use it as `EMAIL_PASSWORD` in `.env`

### 5. Set Up Supabase Database

1. Create a Supabase project at https://supabase.com
2. Run the SQL migration scripts from `../database/` folder in order:
   - `01_create_tables.sql`
   - `02_row_level_security.sql`
   - `03_helper_functions.sql`
3. Copy your Supabase credentials to `.env`

### 6. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 7. Initial Data Setup

Create treasury account:

```bash
curl -X POST http://localhost:5000/api/auth/setup/treasury \
  -H "Content-Type: application/json" \
  -d '{"email": "treasury@iimidr.ac.in", "password": "YourSecurePassword123"}'
```

Create student accounts (provide 500 emails):

```bash
curl -X POST http://localhost:5000/api/auth/setup/students \
  -H "Content-Type: application/json" \
  -d '{"emails": ["student1@iimidr.ac.in", "student2@iimidr.ac.in", ...]}'
```

Create entity accounts:

```bash
curl -X POST http://localhost:5000/api/auth/setup/entities \
  -H "Content-Type: application/json" \
  -d '{"entities": [
    {"email": "cultural@iimidr.ac.in", "entityName": "Cultural Committee"},
    {"email": "sports@iimidr.ac.in", "entityName": "Sports Committee"}
  ]}'
```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login for all user types
```json
{
  "email": "student@iimidr.ac.in",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user info (requires authentication)

#### POST `/api/auth/change-password`
Change password (requires authentication)
```json
{
  "oldPassword": "current",
  "newPassword": "newpassword123"
}
```

### Student Endpoints

All require authentication with `Authorization: Bearer <token>` header.

#### GET `/api/student/events`
Get all events the student has won

#### GET `/api/student/bank-profile`
Get saved bank profile

#### POST `/api/student/bank-profile`
Save/update bank profile
```json
{
  "account_holder_name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Indore Main Branch"
}
```

#### POST `/api/student/bank-details`
Submit bank details for a team
```json
{
  "team_id": "uuid",
  "account_holder_name": "John Doe",
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch_name": "Indore Main Branch",
  "save_profile": true
}
```

#### GET `/api/student/bank-details/:teamId`
View bank details for a team (read-only)

### Entity Endpoints

#### POST `/api/events`
Create new event with teams
```json
{
  "event_name": "Annual Fest",
  "total_prize_pool": 50000,
  "teams": [
    {
      "prize_amount": 30000,
      "members": [
        {"email": "student1@iimidr.ac.in", "is_team_leader": true},
        {"email": "student2@iimidr.ac.in", "is_team_leader": false}
      ]
    }
  ]
}
```

#### GET `/api/events/my-events`
Get all events created by the entity

#### GET `/api/events/:eventId`
Get single event details

### Treasury Endpoints

#### GET `/api/treasury/events`
Get all events with bank submission status

#### GET `/api/treasury/pending`
Get all pending bank detail submissions

#### GET `/api/treasury/statistics`
Get treasury statistics (total events, payments, etc.)

#### POST `/api/treasury/send-reminders`
Send reminder emails to all pending team leaders

#### GET `/api/treasury/download-data`
Download all bank details as Excel file

#### POST `/api/treasury/mark-paid/:bankDetailsId`
Mark a payment as completed
```json
{
  "payment_date": "2024-01-20",
  "payment_reference": "UTR123456789"
}
```

## Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   ├── event.controller.js  # Event management
│   ├── student.controller.js # Student operations
│   └── treasury.controller.js # Treasury operations
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   └── error.middleware.js  # Error handling
├── routes/
│   ├── auth.routes.js       # Auth routes
│   ├── event.routes.js      # Event routes
│   ├── student.routes.js    # Student routes
│   └── treasury.routes.js   # Treasury routes
├── services/
│   ├── auth.service.js      # Auth business logic
│   ├── email.service.js     # Email sending
│   └── encryption.service.js # Encryption/decryption
├── utils/
│   └── validators.js        # Validation functions
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main application file
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 7-day expiration
3. **Account Encryption**: AES-256-GCM for bank account numbers
4. **Row-Level Security**: Supabase RLS policies
5. **Email Domain Validation**: Only `@iimidr.ac.in` emails allowed
6. **CORS Protection**: Configured for specific frontend origin

## Deployment

### Deploy to Render

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all from `.env`
5. Deploy

### Environment Variables for Production

Make sure to set these in Render dashboard:
- `NODE_ENV=production`
- All other variables from `.env.example`
- Update `FRONTEND_URL` to your Vercel deployment URL

## Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account
- Ensure EMAIL_USER and EMAIL_PASSWORD are set correctly

### Database Errors
- Verify Supabase credentials
- Check if RLS policies are enabled
- Ensure all migration scripts have been run

### Encryption Errors
- Verify BANK_ENCRYPTION_KEY is exactly 64 hex characters
- Don't change the encryption key after data is encrypted

## Support

For issues or questions, contact the SAC Treasury team.
