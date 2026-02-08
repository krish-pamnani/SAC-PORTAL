-- SAC Treasurer Portal Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'entity', 'treasury')),
    entity_name VARCHAR(255), -- Only for entities (club/committee name)
    student_name VARCHAR(255), -- Only for students
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- ============================================
-- 2. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    total_prize_pool DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- ============================================
-- 3. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_position INTEGER NOT NULL, -- 1 for 1st place, 2 for 2nd place, etc.
    prize_amount DECIMAL(10, 2) NOT NULL,
    bank_details_submitted BOOLEAN DEFAULT FALSE,
    submitted_by_student_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique position per event
    CONSTRAINT unique_team_position UNIQUE (event_id, team_position)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_event ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_bank_status ON teams(bank_details_submitted);

-- ============================================
-- 4. TEAM_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_team_leader BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure a student can't be added to same team twice
    CONSTRAINT unique_team_student UNIQUE (team_id, student_id)
);

-- Ensure only ONE team leader per team
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_leader_per_team ON team_members(team_id) 
WHERE is_team_leader = TRUE;

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_student ON team_members(student_id);
CREATE INDEX IF NOT EXISTS idx_team_members_leader ON team_members(is_team_leader) WHERE is_team_leader = TRUE;

-- ============================================
-- 5. STUDENT_BANK_PROFILES TABLE (Saved Profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS student_bank_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_ifsc_profile CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_bank_profiles_student ON student_bank_profiles(student_id);

-- ============================================
-- 6. BANK_DETAILS TABLE (Transaction Records)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id),
    entity_id UUID NOT NULL REFERENCES users(id),
    
    -- Bank account information (encrypted)
    account_holder_name VARCHAR(255) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    
    -- Transaction details
    amount DECIMAL(10, 2) NOT NULL,
    submitted_by_student_id UUID NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT NOW(),
    
    -- Payment tracking
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed')),
    payment_date TIMESTAMP,
    payment_reference VARCHAR(100),
    
    -- Metadata
    used_saved_profile BOOLEAN DEFAULT FALSE,
    
    -- Validation
    CONSTRAINT valid_ifsc_details CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_details_submitted_at ON bank_details(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_bank_details_team ON bank_details(team_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_event ON bank_details(event_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_payment_status ON bank_details(payment_status);

-- ============================================
-- 7. EMAIL_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
