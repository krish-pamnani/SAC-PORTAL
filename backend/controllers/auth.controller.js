import authService from '../services/auth.service.js';
import emailService from '../services/email.service.js';

/**
 * Login controller
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create students (Admin/Setup only)
 */
export const bulkCreateStudents = async (req, res, next) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    // Validate all emails
    const invalidEmails = emails.filter(email => !authService.validateEmailDomain(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid email domains', 
        invalidEmails 
      });
    }

    const results = await authService.bulkCreateStudents(emails);

    // Send emails to all successfully created students
    for (const result of results) {
      if (result.success) {
        await emailService.sendInitialCredentials({
          email: result.email,
          password: result.password,
          userType: 'student',
        });
      }
    }

    res.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create entities (Admin/Setup only)
 */
export const bulkCreateEntities = async (req, res, next) => {
  try {
    const { entities } = req.body; // [{email, entityName}]

    if (!Array.isArray(entities) || entities.length === 0) {
      return res.status(400).json({ error: 'Entities array is required' });
    }

    const results = await authService.bulkCreateEntities(entities);

    // Send emails to all successfully created entities
    for (const result of results) {
      if (result.success) {
        await emailService.sendInitialCredentials({
          email: result.email,
          password: result.password,
          userType: 'entity',
          name: result.entityName,
        });
      }
    }

    res.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create treasury account (Admin/Setup only)
 */
export const createTreasury = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await authService.createUser({
      email,
      userType: 'treasury',
      customPassword: password, // Allow custom password for treasury
    });

    // Send credentials email
    await emailService.sendInitialCredentials({
      email: result.user.email,
      password: result.password,
      userType: 'treasury',
      name: 'Treasury Team',
    });

    res.json({
      success: true,
      message: 'Treasury account created',
      email: result.user.email,
      password: result.password,
    });
  } catch (error) {
    next(error);
  }
};
