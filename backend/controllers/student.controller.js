import { supabaseAdmin } from '../config/supabase.js';
import encryptionService from '../services/encryption.service.js';
import { validateBankDetails } from '../utils/validators.js';

/**
 * Get all events for a student
 */
export const getStudentEvents = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { data, error } = await supabaseAdmin
      .rpc('get_student_events', { student_uuid: studentId });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // For each event, get team members
    const eventsWithDetails = await Promise.all(
      data.map(async (event) => {
        const { data: members } = await supabaseAdmin
          .rpc('get_team_members_details', { team_uuid: event.team_id });

        return {
          ...event,
          team_members: members || [],
        };
      })
    );

    res.json({ success: true, events: eventsWithDetails });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's saved bank profile
 */
export const getBankProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('student_bank_profiles')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new Error(`Failed to fetch bank profile: ${error.message}`);
    }

    if (!profile) {
      return res.json({ success: true, profile: null });
    }

    // Decrypt and mask account number
    const maskedAccountNumber = encryptionService.maskEncrypted(profile.account_number_encrypted);

    res.json({
      success: true,
      profile: {
        ...profile,
        account_number_encrypted: undefined,
        account_number_masked: maskedAccountNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save or update bank profile
 */
export const saveBankProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { account_holder_name, account_number, ifsc_code, bank_name, branch_name } = req.body;

    // Validate
    const validation = validateBankDetails({
      account_holder_name,
      account_number,
      ifsc_code,
      bank_name,
      branch_name,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Encrypt account number
    const encryptedAccountNumber = encryptionService.encrypt(account_number);

    // Upsert profile
    const { data: profile, error } = await supabaseAdmin
      .from('student_bank_profiles')
      .upsert({
        student_id: studentId,
        account_holder_name: account_holder_name.trim(),
        account_number_encrypted: encryptedAccountNumber,
        ifsc_code: ifsc_code.toUpperCase().trim(),
        bank_name: bank_name.trim(),
        branch_name: branch_name.trim(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save bank profile: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Bank profile saved successfully',
      profile: {
        ...profile,
        account_number_encrypted: undefined,
        account_number_masked: encryptionService.mask(account_number),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bank profile
 */
export const deleteBankProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { error } = await supabaseAdmin
      .from('student_bank_profiles')
      .delete()
      .eq('student_id', studentId);

    if (error) {
      throw new Error(`Failed to delete bank profile: ${error.message}`);
    }

    res.json({ success: true, message: 'Bank profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit bank details for a team
 */
export const submitBankDetails = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { team_id, account_holder_name, account_number, ifsc_code, bank_name, branch_name, save_profile } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    // Check if user is team leader
    const { data: isLeader } = await supabaseAdmin
      .rpc('is_team_leader', { team_uuid: team_id, student_uuid: studentId });

    if (!isLeader) {
      return res.status(403).json({ error: 'Only team leader can submit bank details' });
    }

    // Check if bank details already submitted
    const { data: existing } = await supabaseAdmin
      .from('bank_details')
      .select('id')
      .eq('team_id', team_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Bank details already submitted for this team' });
    }

    // Validate
    const validation = validateBankDetails({
      account_holder_name,
      account_number,
      ifsc_code,
      bank_name,
      branch_name,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Get team and event details
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('*, events(id, entity_id)')
      .eq('id', team_id)
      .single();

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Encrypt account number
    const encryptedAccountNumber = encryptionService.encrypt(account_number);

    // Insert bank details
    const { error: insertError } = await supabaseAdmin
      .from('bank_details')
      .insert({
        team_id,
        event_id: team.events.id,
        entity_id: team.events.entity_id,
        account_holder_name: account_holder_name.trim(),
        account_number_encrypted: encryptedAccountNumber,
        ifsc_code: ifsc_code.toUpperCase().trim(),
        bank_name: bank_name.trim(),
        branch_name: branch_name.trim(),
        amount: team.prize_amount,
        submitted_by_student_id: studentId,
        used_saved_profile: !!save_profile,
      });

    if (insertError) {
      throw new Error(`Failed to submit bank details: ${insertError.message}`);
    }

    // Update team
    await supabaseAdmin
      .from('teams')
      .update({
        bank_details_submitted: true,
        submitted_by_student_id: studentId,
      })
      .eq('id', team_id);

    // Save to profile if requested
    if (save_profile) {
      await supabaseAdmin
        .from('student_bank_profiles')
        .upsert({
          student_id: studentId,
          account_holder_name: account_holder_name.trim(),
          account_number_encrypted: encryptedAccountNumber,
          ifsc_code: ifsc_code.toUpperCase().trim(),
          bank_name: bank_name.trim(),
          branch_name: branch_name.trim(),
          updated_at: new Date().toISOString(),
        });
    }

    res.json({
      success: true,
      message: 'Bank details submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View bank details for a team (read-only)
 */
export const viewBankDetails = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const studentId = req.user.id;

    // Check if user is member of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('student_id', studentId)
      .single();

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // Get bank details
    const { data: bankDetails, error } = await supabaseAdmin
      .from('bank_details')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch bank details: ${error.message}`);
    }

    if (!bankDetails) {
      return res.json({ success: true, bankDetails: null });
    }

    // Mask account number
    const maskedAccountNumber = encryptionService.maskEncrypted(bankDetails.account_number_encrypted);

    res.json({
      success: true,
      bankDetails: {
        ...bankDetails,
        account_number_encrypted: undefined,
        account_number_masked: maskedAccountNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prize history for student
 */
export const getPrizeHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const { data: history, error } = await supabaseAdmin
      .from('bank_details')
      .select(`
        *,
        events (event_name),
        teams (prize_amount, team_position)
      `)
      .eq('submitted_by_student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch prize history: ${error.message}`);
    }

    const maskedHistory = history.map(item => ({
      ...item,
      account_number_encrypted: undefined,
      account_number_masked: encryptionService.maskEncrypted(item.account_number_encrypted),
    }));

    res.json({ success: true, history: maskedHistory });
  } catch (error) {
    next(error);
  }
};
