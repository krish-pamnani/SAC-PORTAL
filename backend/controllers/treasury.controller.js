import { supabaseAdmin } from '../config/supabase.js';
import encryptionService from '../services/encryption.service.js';
import emailService from '../services/email.service.js';
import ExcelJS from 'exceljs';

/**
 * Get all events with bank submission status
 */
export const getAllEvents = async (req, res, next) => {
  try {
    const { data: events, error } = await supabaseAdmin
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
          bank_details (id, payment_status, submitted_at)
        )
      `)
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
 * Get all pending bank details
 */
export const getPendingBankDetails = async (req, res, next) => {
  try {
    const { data: pending, error } = await supabaseAdmin
      .rpc('get_pending_bank_details');

    if (error) {
      throw new Error(`Failed to fetch pending details: ${error.message}`);
    }

    res.json({ success: true, pending });
  } catch (error) {
    next(error);
  }
};

/**
 * Send reminder emails to all pending teams
 */
export const sendReminders = async (req, res, next) => {
  try {
    const { data: pending, error } = await supabaseAdmin
      .rpc('get_pending_bank_details');

    if (error) {
      throw new Error(`Failed to fetch pending details: ${error.message}`);
    }

    let sent = 0;
    let failed = 0;

    for (const item of pending) {
      // Get all team members
      const { data: members } = await supabaseAdmin
        .rpc('get_team_members_details', { team_uuid: item.team_id });

      const teamMemberEmails = members
        ? members.filter(m => !m.is_team_leader).map(m => m.student_email)
        : [];

      const success = await emailService.sendReminderEmail({
        email: item.team_leader_email,
        name: item.team_leader_name,
        eventName: item.event_name,
        prizeAmount: item.prize_amount,
        teamMembers: teamMemberEmails,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    res.json({
      success: true,
      message: `Reminders sent to ${sent} team leaders`,
      sent,
      failed,
      total: pending.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download all bank details as Excel
 */
export const downloadTreasuryData = async (req, res, next) => {
  try {
    // Fetch all bank details with related data
    const { data: bankDetails, error } = await supabaseAdmin
      .from('bank_details')
      .select(`
        *,
        events (event_name, created_at),
        entity:entity_id (entity_name),
        teams (team_position),
        submitter:submitted_by_student_id (email, student_name)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bank details: ${error.message}`);
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Treasury Data');

    // Define columns
    worksheet.columns = [
      { header: 'Sr No', key: 'sr_no', width: 8 },
      { header: 'Event Name', key: 'event_name', width: 30 },
      { header: 'Entity Name', key: 'entity_name', width: 25 },
      { header: 'Team Position', key: 'team_position', width: 15 },
      { header: 'Account Holder', key: 'account_holder', width: 25 },
      { header: 'Account Number', key: 'account_number', width: 20 },
      { header: 'IFSC Code', key: 'ifsc_code', width: 15 },
      { header: 'Bank Name', key: 'bank_name', width: 25 },
      { header: 'Branch Name', key: 'branch_name', width: 25 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Payment Status', key: 'payment_status', width: 15 },
      { header: 'Submitted By', key: 'submitted_by', width: 30 },
      { header: 'Submitted Date', key: 'submitted_date', width: 20 },
      { header: 'Payment Date', key: 'payment_date', width: 20 },
      { header: 'UTR/Reference', key: 'payment_reference', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667eea' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    bankDetails.forEach((item, index) => {
      // Decrypt account number
      const accountNumber = encryptionService.decrypt(item.account_number_encrypted);

      worksheet.addRow({
        sr_no: index + 1,
        event_name: item.events?.event_name || 'N/A',
        entity_name: item.entity?.entity_name || 'N/A',
        team_position: `${item.teams?.team_position}${getOrdinalSuffix(item.teams?.team_position)} Place`,
        account_holder: item.account_holder_name,
        account_number: accountNumber,
        ifsc_code: item.ifsc_code,
        bank_name: item.bank_name,
        branch_name: item.branch_name,
        amount: item.amount,
        payment_status: item.payment_status.toUpperCase(),
        submitted_by: `${item.submitter?.student_name || ''} (${item.submitter?.email || ''})`,
        submitted_date: new Date(item.submitted_at).toLocaleString('en-IN'),
        payment_date: item.payment_date ? new Date(item.payment_date).toLocaleString('en-IN') : '-',
        payment_reference: item.payment_reference || '-',
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    const filename = `treasury_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark payment as completed
 */
export const markPaymentCompleted = async (req, res, next) => {
  try {
    const { bankDetailsId } = req.params;
    const { payment_date, payment_reference } = req.body;

    if (!payment_date || !payment_reference) {
      return res.status(400).json({ 
        error: 'Payment date and reference number are required' 
      });
    }

    const { error } = await supabaseAdmin
      .from('bank_details')
      .update({
        payment_status: 'completed',
        payment_date: new Date(payment_date).toISOString(),
        payment_reference,
      })
      .eq('id', bankDetailsId);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Payment marked as completed',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get treasury statistics
 */
export const getStatistics = async (req, res, next) => {
  try {
    // Total events
    const { count: totalEvents } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Total prize pool
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('total_prize_pool');
    
    const totalPrizePool = events?.reduce((sum, e) => sum + parseFloat(e.total_prize_pool), 0) || 0;

    // Pending bank details
    const { count: pendingCount } = await supabaseAdmin
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('bank_details_submitted', false);

    // Completed payments
    const { count: completedPayments } = await supabaseAdmin
      .from('bank_details')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'completed');

    // Pending payments
    const { count: pendingPayments } = await supabaseAdmin
      .from('bank_details')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    // Total amount paid
    const { data: completedBankDetails } = await supabaseAdmin
      .from('bank_details')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalPaid = completedBankDetails?.reduce((sum, b) => sum + parseFloat(b.amount), 0) || 0;

    // Total amount pending
    const { data: pendingBankDetails } = await supabaseAdmin
      .from('bank_details')
      .select('amount')
      .eq('payment_status', 'pending');

    const totalPending = pendingBankDetails?.reduce((sum, b) => sum + parseFloat(b.amount), 0) || 0;

    res.json({
      success: true,
      statistics: {
        totalEvents,
        totalPrizePool,
        pendingBankSubmissions: pendingCount,
        completedPayments,
        pendingPayments,
        totalAmountPaid: totalPaid,
        totalAmountPending: totalPending,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get ordinal suffix
 */
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
