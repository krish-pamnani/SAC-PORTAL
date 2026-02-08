/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate IFSC code format
 */
export const isValidIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

/**
 * Validate account number (9-18 digits)
 */
export const isValidAccountNumber = (accountNumber) => {
  const accountRegex = /^\d{9,18}$/;
  return accountRegex.test(accountNumber);
};

/**
 * Validate bank details
 */
export const validateBankDetails = (details) => {
  const errors = [];

  if (!details.account_holder_name || details.account_holder_name.trim().length < 2) {
    errors.push('Account holder name must be at least 2 characters');
  }

  if (!isValidAccountNumber(details.account_number)) {
    errors.push('Account number must be 9-18 digits');
  }

  if (!isValidIFSC(details.ifsc_code)) {
    errors.push('Invalid IFSC code format');
  }

  if (!details.bank_name || details.bank_name.trim().length < 2) {
    errors.push('Bank name is required');
  }

  if (!details.branch_name || details.branch_name.trim().length < 2) {
    errors.push('Branch name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string (remove dangerous characters)
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};
