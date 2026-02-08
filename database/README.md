# SAC Treasurer Portal - Database Setup Guide

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project
3. Note down your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (secret)

## Database Setup Instructions

### Step 1: Run SQL Migrations

Go to your Supabase Dashboard → SQL Editor and run the following scripts **in order**:

1. **Create Tables** (`01_create_tables.sql`)
   - Creates all database tables (users, events, teams, etc.)
   - Sets up indexes for performance
   - Adds validation constraints

2. **Row Level Security** (`02_row_level_security.sql`)
   - Enables RLS on all tables
   - Creates security policies for students, entities, and treasury
   - Ensures data isolation between user types

3. **Helper Functions** (`03_helper_functions.sql`)
   - Creates PostgreSQL functions for complex queries
   - Useful for fetching related data efficiently

### Step 2: Configure Supabase Auth

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Email** authentication
3. Configure email templates (optional) for password reset, etc.
4. Disable **Sign-ups** (we'll use backend API for controlled user creation)

### Step 3: Get API Credentials

From your Supabase Dashboard → Settings → API:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Add these to your backend `.env` file.

### Step 4: Database Schema Overview

```
users
├── students (user_type='student')
├── entities (user_type='entity')
└── treasury (user_type='treasury')

events
├── created by entities
└── contains teams

teams
├── belongs to event
├── has prize_amount
└── has team_members

team_members
├── links students to teams
└── marks one as team_leader

student_bank_profiles (saved bank accounts)
└── one per student (encrypted)

bank_details (transaction records)
├── one per team (when submitted)
├── encrypted account numbers
└── permanent audit trail
```

### Step 5: Verify Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- bank_details
- email_logs
- events
- student_bank_profiles
- team_members
- teams
- users

## Security Notes

1. **Never expose Service Role Key** in frontend code
2. Use **Anon Key** for frontend (Supabase client)
3. Use **Service Role Key** only in backend for admin operations
4. RLS policies ensure data isolation even if keys are compromised
5. Account numbers are encrypted at application level (additional security)

## Next Steps

After database setup:
1. Configure backend with Supabase credentials
2. Generate encryption key for bank account numbers
3. Set up initial users (students, entities, treasury)
