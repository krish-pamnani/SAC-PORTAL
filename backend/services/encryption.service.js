import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.BANK_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('BANK_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

class EncryptionService {
  /**
   * Encrypt sensitive text (bank account numbers)
   * @param {string} text - Plain text to encrypt
   * @returns {string} - Encrypted text in format: iv:authTag:encryptedData
   */
  encrypt(text) {
    if (!text) {
      throw new Error('Cannot encrypt empty text');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt encrypted text
   * @param {string} encryptedData - Encrypted text in format: iv:authTag:encryptedData
   * @returns {string} - Decrypted plain text
   */
  decrypt(encryptedData) {
    if (!encryptedData) {
      throw new Error('Cannot decrypt empty data');
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Mask account number (show only last 4 digits)
   * @param {string} accountNumber - Plain text account number
   * @returns {string} - Masked account number
   */
  mask(accountNumber) {
    if (!accountNumber || accountNumber.length < 4) {
      return '****';
    }
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  }

  /**
   * Mask encrypted account number (decrypt then mask)
   * @param {string} encryptedAccountNumber - Encrypted account number
   * @returns {string} - Masked account number
   */
  maskEncrypted(encryptedAccountNumber) {
    try {
      const decrypted = this.decrypt(encryptedAccountNumber);
      return this.mask(decrypted);
    } catch (error) {
      return '****';
    }
  }
}

export default new EncryptionService();
