import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  /**
   * Generate random password
   * @param {number} length - Password length
   * @returns {string} - Random password
   */
  generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }
    
    return password;
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - Match result
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} - JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User object and token
   */
  async login(email, password) {
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      userType: user.user_type,
      entityName: user.entity_name,
    });

    // Remove password hash from response
    delete user.password_hash;

    return {
      user,
      token,
    };
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user and password
   */
  async createUser({ email, userType, entityName = null, studentName = null, customPassword = null }) {
    // Generate or use custom password
    const password = customPassword || this.generatePassword();
    const passwordHash = await this.hashPassword(password);

    // Insert user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        user_type: userType,
        entity_name: entityName,
        student_name: studentName,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return {
      user,
      password, // Return plain password for sending via email
    };
  }

  /**
   * Bulk create students
   * @param {Array} studentEmails - Array of student email addresses
   * @returns {Promise<Array>} - Array of created users with passwords
   */
  async bulkCreateStudents(studentEmails) {
    const results = [];

    for (const email of studentEmails) {
      try {
        const password = this.generatePassword();
        const passwordHash = await this.hashPassword(password);

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .insert({
            email,
            password_hash: passwordHash,
            user_type: 'student',
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create student ${email}:`, error.message);
          results.push({ email, success: false, error: error.message });
        } else {
          results.push({ email, success: true, password, userId: user.id });
        }
      } catch (error) {
        console.error(`Error creating student ${email}:`, error.message);
        results.push({ email, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Bulk create entities
   * @param {Array} entities - Array of {email, entityName}
   * @returns {Promise<Array>} - Array of created users with passwords
   */
  async bulkCreateEntities(entities) {
    const results = [];

    for (const { email, entityName } of entities) {
      try {
        const password = this.generatePassword();
        const passwordHash = await this.hashPassword(password);

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .insert({
            email,
            password_hash: passwordHash,
            user_type: 'entity',
            entity_name: entityName,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create entity ${email}:`, error.message);
          results.push({ email, entityName, success: false, error: error.message });
        } else {
          results.push({ email, entityName, success: true, password, userId: user.id });
        }
      } catch (error) {
        console.error(`Error creating entity ${email}:`, error.message);
        results.push({ email, entityName, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async changePassword(userId, oldPassword, newPassword) {
    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValid = await this.verifyPassword(oldPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newHash = await this.hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }

    return true;
  }

  /**
   * Validate email domain
   * @param {string} email - Email address
   * @returns {boolean} - Valid or not
   */
  validateEmailDomain(email) {
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'iimidr.ac.in';
    return email.endsWith(`@${allowedDomain}`);
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(userId) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type, entity_name, student_name, created_at, last_login')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();
