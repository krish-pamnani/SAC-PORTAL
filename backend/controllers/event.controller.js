import { supabaseAdmin } from '../config/supabase.js';
import emailService from '../services/email.service.js';
import authService from '../services/auth.service.js';

/**
 * Create new event with teams
 */
export const createEvent = async (req, res, next) => {
  try {
    const { event_name, total_prize_pool, teams } = req.body;
    const entityId = req.user.id;

    // Validation
    if (!event_name || !total_prize_pool || !Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ 
        error: 'Event name, prize pool, and at least one team are required' 
      });
    }

    // Validate teams
    for (const team of teams) {
      if (!team.prize_amount || !Array.isArray(team.members) || team.members.length === 0) {
        return res.status(400).json({ 
          error: 'Each team must have prize amount and at least one member' 
        });
      }

      const teamLeaders = team.members.filter(m => m.is_team_leader);
      if (teamLeaders.length !== 1) {
        return res.status(400).json({ 
          error: 'Each team must have exactly one team leader' 
        });
      }

      // Validate emails
      for (const member of team.members) {
        if (!authService.validateEmailDomain(member.email)) {
          return res.status(400).json({ 
            error: `Invalid email domain: ${member.email}` 
          });
        }
      }
    }

    // Create event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .insert({
        entity_id: entityId,
        event_name,
        total_prize_pool,
      })
      .select()
      .single();

    if (eventError) {
      throw new Error(`Failed to create event: ${eventError.message}`);
    }

    // Create teams and members
    for (let i = 0; i < teams.length; i++) {
      const teamData = teams[i];

      // Create team
      const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .insert({
          event_id: event.id,
          team_position: i + 1,
          prize_amount: teamData.prize_amount,
        })
        .select()
        .single();

      if (teamError) {
        throw new Error(`Failed to create team: ${teamError.message}`);
      }

      // Add team members
      for (const memberData of teamData.members) {
        // Get student ID from email
        const { data: student } = await supabaseAdmin
          .from('users')
          .select('id, email, student_name')
          .eq('email', memberData.email)
          .eq('user_type', 'student')
          .single();

        if (!student) {
          console.warn(`Student not found: ${memberData.email}`);
          continue;
        }

        // Add to team
        await supabaseAdmin.from('team_members').insert({
          team_id: team.id,
          student_id: student.id,
          is_team_leader: memberData.is_team_leader,
        });
      }

      // Send emails to team members
      const teamLeader = teamData.members.find(m => m.is_team_leader);
      const regularMembers = teamData.members.filter(m => !m.is_team_leader);

      // Get entity name
      const { data: entity } = await supabaseAdmin
        .from('users')
        .select('entity_name')
        .eq('id', entityId)
        .single();

      // Get student details and send leader email
      const { data: leaderUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', teamLeader.email)
        .single();

      if (leaderUser) {
        const otherMemberEmails = regularMembers.map(m => m.email);
        
        await emailService.sendTeamLeaderNotification({
          email: leaderUser.email,
          name: leaderUser.student_name,
          eventName: event_name,
          entityName: entity?.entity_name || 'Unknown Entity',
          prizeAmount: teamData.prize_amount,
          password: '(use your existing password)',
          teamMembers: otherMemberEmails,
        });
      }

      // Send emails to regular members
      for (const member of regularMembers) {
        const { data: memberUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', member.email)
          .single();

        if (memberUser) {
          await emailService.sendTeamMemberNotification({
            email: memberUser.email,
            name: memberUser.student_name,
            eventName: event_name,
            entityName: entity?.entity_name || 'Unknown Entity',
            prizeAmount: teamData.prize_amount,
            password: '(use your existing password)',
            teamLeaderEmail: teamLeader.email,
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Event created successfully',
      eventId: event.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events for an entity
 */
export const getEntityEvents = async (req, res, next) => {
  try {
    const entityId = req.user.id;

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        teams (
          *,
          team_members (
            *,
            users:student_id (email, student_name)
          )
        )
      `)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single event details
 */
export const getEventDetails = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        entity:entity_id (entity_name, email),
        teams (
          *,
          team_members (
            *,
            users:student_id (id, email, student_name)
          ),
          bank_details (*)
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    // Check access rights
    if (req.user.userType === 'entity' && event.entity_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};
