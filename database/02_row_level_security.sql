-- Row Level Security Policies for SAC Treasurer Portal
-- Run this AFTER creating tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_bank_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Students can only read their own data
CREATE POLICY student_read_own ON users
FOR SELECT USING (
    auth.uid() = id AND user_type = 'student'
);

-- Entities can read student emails for team member selection
CREATE POLICY entity_read_students ON users
FOR SELECT USING (
    user_type = 'student' 
    OR (auth.uid() = id AND user_type = 'entity')
);

-- Treasury can read all users
CREATE POLICY treasury_read_all_users ON users
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Entities can create events
CREATE POLICY entity_create_events ON events
FOR INSERT WITH CHECK (
    entity_id = auth.uid()
);

-- Entities can read and update their own events
CREATE POLICY entity_manage_own_events ON events
FOR ALL USING (
    entity_id = auth.uid()
);

-- Students can read events they're part of
CREATE POLICY student_read_own_events ON events
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM teams t
        JOIN team_members tm ON tm.team_id = t.id
        WHERE t.event_id = events.id AND tm.student_id = auth.uid()
    )
);

-- Treasury can read all events
CREATE POLICY treasury_read_all_events ON events
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- ============================================
-- TEAMS TABLE POLICIES
-- ============================================

-- Entities can manage teams for their own events
CREATE POLICY entity_manage_teams ON teams
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM events e
        WHERE e.id = teams.event_id AND e.entity_id = auth.uid()
    )
);

-- Students can read teams they're part of
CREATE POLICY student_read_own_teams ON teams
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = teams.id AND tm.student_id = auth.uid()
    )
);

-- Treasury can read all teams
CREATE POLICY treasury_read_all_teams ON teams
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- Team leaders can update bank submission status
CREATE POLICY team_leader_update_teams ON teams
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = teams.id 
        AND tm.student_id = auth.uid() 
        AND tm.is_team_leader = TRUE
    )
);

-- ============================================
-- TEAM_MEMBERS TABLE POLICIES
-- ============================================

-- Entities can manage team members for their events
CREATE POLICY entity_manage_team_members ON team_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM teams t
        JOIN events e ON e.id = t.event_id
        WHERE t.id = team_members.team_id AND e.entity_id = auth.uid()
    )
);

-- Students can read their own team memberships
CREATE POLICY student_read_own_memberships ON team_members
FOR SELECT USING (
    student_id = auth.uid()
);

-- Treasury can read all team members
CREATE POLICY treasury_read_all_team_members ON team_members
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- ============================================
-- STUDENT_BANK_PROFILES TABLE POLICIES
-- ============================================

-- Students can manage only their own bank profile
CREATE POLICY student_manage_own_bank_profile ON student_bank_profiles
FOR ALL USING (
    student_id = auth.uid()
);

-- ============================================
-- BANK_DETAILS TABLE POLICIES
-- ============================================

-- Only team leaders can submit bank details for their team
CREATE POLICY team_leader_submit_bank_details ON bank_details
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = bank_details.team_id
        AND tm.student_id = auth.uid()
        AND tm.is_team_leader = TRUE
    )
);

-- All team members can view bank details once submitted
CREATE POLICY team_members_view_bank_details ON bank_details
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = bank_details.team_id
        AND tm.student_id = auth.uid()
    )
);

-- Treasury can view and update all bank details
CREATE POLICY treasury_manage_all_bank_details ON bank_details
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- ============================================
-- EMAIL_LOGS TABLE POLICIES
-- ============================================

-- Only treasury can view email logs
CREATE POLICY treasury_view_email_logs ON email_logs
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'treasury')
);

-- System can insert email logs (no auth required for backend service)
CREATE POLICY system_insert_email_logs ON email_logs
FOR INSERT WITH CHECK (true);
