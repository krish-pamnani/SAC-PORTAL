import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';

dotenv.config();

class EmailService {
  constructor() {
    // Create reusable transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send email and log to database
   * @param {Object} options - Email options
   * @returns {Promise<boolean>} - Success status
   */
  async sendEmail({ to, subject, html, eventId = null, emailType }) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      // Log email
      await this.logEmail({
        recipient: to,
        emailType,
        eventId,
        status: 'sent',
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);

      // Log failed email
      await this.logEmail({
        recipient: to,
        emailType,
        eventId,
        status: 'failed',
        errorMessage: error.message,
      });

      return false;
    }
  }

  /**
   * Log email to database
   */
  async logEmail({ recipient, emailType, eventId, status, errorMessage = null }) {
    try {
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: recipient,
        email_type: emailType,
        event_id: eventId,
        status,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  /**
   * Send winner notification to team leader
   */
  async sendTeamLeaderNotification({ email, name, eventName, entityName, prizeAmount, password, teamMembers }) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const teamMembersList = teamMembers.map(m => `<li>${m}</li>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .prize { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .important { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
          ul { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Congratulations Team Leader!</h1>
          </div>
          <div class="content">
            <p>Dear ${name || 'Student'},</p>
            
            <p>Congratulations! Your team has won at <strong>${eventName}</strong> organized by <strong>${entityName}</strong>!</p>
            
            <div class="prize">Prize Amount: ₹${prizeAmount.toLocaleString('en-IN')}</div>
            
            <div class="important">
              <strong>⚠️ YOU HAVE BEEN DESIGNATED AS THE TEAM LEADER</strong>
              <p>As the team leader, you are responsible for submitting the bank account details for your team's prize money. Please login to the SAC Treasury Portal and complete the bank details form at your earliest convenience.</p>
            </div>
            
            <p><strong>Your Team Members:</strong></p>
            <ul>
              ${teamMembersList}
            </ul>
            
            <div class="credentials">
              <strong>Login Credentials:</strong><br>
              Email: <strong>${email}</strong><br>
              Password: <strong>${password}</strong><br>
              <em>(Please change your password after first login)</em>
            </div>
            
            <a href="${loginUrl}" class="button">Login to Portal</a>
            
            <p>If you have any questions, please contact the SAC Treasury team.</p>
            
            <p>Best regards,<br><strong>SAC Treasury Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `🏆 Congratulations Team Leader! Action Required - ${eventName}`,
      html,
      emailType: 'team_leader_notification',
    });
  }

  /**
   * Send winner notification to regular team member
   */
  async sendTeamMemberNotification({ email, name, eventName, entityName, prizeAmount, password, teamLeaderEmail }) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .prize { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .credentials { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <p>Dear ${name || 'Student'},</p>
            
            <p>Congratulations! Your team has won at <strong>${eventName}</strong> organized by <strong>${entityName}</strong>!</p>
            
            <div class="prize">Prize Amount: ₹${prizeAmount.toLocaleString('en-IN')}</div>
            
            <div class="info">
              <strong>ℹ️ Team Leader Information</strong>
              <p>Your Team Leader: <strong>${teamLeaderEmail}</strong></p>
              <p>The team leader will submit the bank account details for the prize money. You can track the status by logging into the SAC Treasury Portal.</p>
            </div>
            
            <div class="credentials">
              <strong>Login Credentials:</strong><br>
              Email: <strong>${email}</strong><br>
              Password: <strong>${password}</strong><br>
              <em>(Please change your password after first login)</em>
            </div>
            
            <a href="${loginUrl}" class="button">Login to Portal</a>
            
            <p>If you have any questions, please contact the SAC Treasury team or your team leader.</p>
            
            <p>Best regards,<br><strong>SAC Treasury Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `🎉 Congratulations! You've won at ${eventName}`,
      html,
      emailType: 'team_member_notification',
    });
  }

  /**
   * Send reminder to team leader
   */
  async sendReminderEmail({ email, name, eventName, prizeAmount, teamMembers }) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const teamMembersList = teamMembers.map(m => `<li>${m}</li>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          ul { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ REMINDER: Submit Bank Details</h1>
          </div>
          <div class="content">
            <p>Dear Team Leader ${name || ''},</p>
            
            <div class="urgent">
              <strong>⚠️ ACTION REQUIRED</strong>
              <p>This is a reminder to submit your team's bank details for the following event:</p>
            </div>
            
            <p><strong>Event:</strong> ${eventName}<br>
            <strong>Prize Amount:</strong> ₹${prizeAmount.toLocaleString('en-IN')}</p>
            
            <p>As the designated team leader, it is your responsibility to complete the bank details form so your team can receive the prize money.</p>
            
            <p><strong>Your Team Members:</strong></p>
            <ul>
              ${teamMembersList}
            </ul>
            
            <a href="${loginUrl}" class="button">Login & Submit Details</a>
            
            <p>Please complete this at your earliest convenience. If you have any issues, contact the SAC Treasury team.</p>
            
            <p>Best regards,<br><strong>SAC Treasury Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `⏰ REMINDER: Submit Bank Details - ${eventName}`,
      html,
      emailType: 'reminder',
    });
  }

  /**
   * Send initial credentials to user
   */
  async sendInitialCredentials({ email, password, userType, name }) {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const userTypeLabel = userType === 'entity' ? 'Entity/Club' : userType === 'treasury' ? 'Treasury' : 'Student';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SAC Treasury Portal</h1>
          </div>
          <div class="content">
            <p>Dear ${name || userTypeLabel},</p>
            
            <p>Your account has been created for the SAC Treasury Portal. Use the following credentials to login:</p>
            
            <div class="credentials">
              <strong>Your Login Credentials</strong><br><br>
              <strong>Email:</strong> ${email}<br>
              <strong>Password:</strong> ${password}<br>
              <strong>Account Type:</strong> ${userTypeLabel}
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              Please change your password after your first login. Do not share your credentials with anyone.
            </div>
            
            <a href="${loginUrl}" class="button">Login Now</a>
            
            <p>If you have any questions or did not expect this email, please contact the SAC Treasury team.</p>
            
            <p>Best regards,<br><strong>SAC Treasury Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'SAC Treasury Portal - Your Account Credentials',
      html,
      emailType: 'initial_credentials',
    });
  }
}

export default new EmailService();
