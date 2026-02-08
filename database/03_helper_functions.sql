-- Helper functions for the SAC Treasurer Portal
-- Run this AFTER creating tables and RLS policies

-- ============================================
-- Function to get all events for a student
-- ============================================
CREATE OR REPLACE FUNCTION get_student_events(student_uuid UUID)
RETURNS TABLE (
    event_id UUID,
    event_name VARCHAR,
    entity_name VARCHAR,
    team_id UUID,
    team_position INTEGER,
    prize_amount DECIMAL,
    is_team_leader BOOLEAN,
    bank_details_submitted BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as event_id,
        e.event_name,
        u.entity_name,
        t.id as team_id,
        t.team_position,
        t.prize_amount,
        tm.is_team_leader,
        t.bank_details_submitted,
        e.created_at
    FROM events e
    JOIN users u ON u.id = e.entity_id
    JOIN teams t ON t.event_id = e.id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.student_id = student_uuid
    ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to get all team members for a team
-- ============================================
CREATE OR REPLACE FUNCTION get_team_members_details(team_uuid UUID)
RETURNS TABLE (
    student_id UUID,
    student_email VARCHAR,
    student_name VARCHAR,
    is_team_leader BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as student_id,
        u.email as student_email,
        u.student_name,
        tm.is_team_leader
    FROM team_members tm
    JOIN users u ON u.id = tm.student_id
    WHERE tm.team_id = team_uuid
    ORDER BY tm.is_team_leader DESC, u.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to get pending bank detail teams
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_bank_details()
RETURNS TABLE (
    event_id UUID,
    event_name VARCHAR,
    entity_name VARCHAR,
    team_id UUID,
    team_position INTEGER,
    prize_amount DECIMAL,
    team_leader_email VARCHAR,
    team_leader_name VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as event_id,
        e.event_name,
        u.entity_name,
        t.id as team_id,
        t.team_position,
        t.prize_amount,
        leader.email as team_leader_email,
        leader.student_name as team_leader_name,
        e.created_at
    FROM events e
    JOIN users u ON u.id = e.entity_id
    JOIN teams t ON t.event_id = e.id
    JOIN team_members tm ON tm.team_id = t.id AND tm.is_team_leader = TRUE
    JOIN users leader ON leader.id = tm.student_id
    WHERE t.bank_details_submitted = FALSE
    ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to check if user is team leader
-- ============================================
CREATE OR REPLACE FUNCTION is_team_leader(team_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM team_members
        WHERE team_id = team_uuid 
        AND student_id = student_uuid 
        AND is_team_leader = TRUE
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
