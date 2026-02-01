/**
 * Validation Utilities
 * Common validation functions for API inputs
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with details
 */
function validatePassword(password) {
  const result = {
    valid: true,
    errors: [],
  };

  if (!password || password.length < 8) {
    result.errors.push('Password must be at least 8 characters long');
    result.valid = false;
  }

  if (!/[A-Z]/.test(password)) {
    result.errors.push('Password must contain at least one uppercase letter');
    result.valid = false;
  }

  if (!/[a-z]/.test(password)) {
    result.errors.push('Password must contain at least one lowercase letter');
    result.valid = false;
  }

  if (!/[0-9]/.test(password)) {
    result.errors.push('Password must contain at least one number');
    result.valid = false;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    result.errors.push('Password must contain at least one special character (!@#$%^&*)');
    result.valid = false;
  }

  return result;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phone && phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} Is valid date
 */
function validateDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
}

/**
 * Sanitize string input (basic XSS prevention)
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate login credentials
 * @param {Object} credentials - Login credentials
 * @returns {Object} Validation result
 */
function validateLoginCredentials(credentials) {
  const { email, password } = credentials;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate registration data
 * @param {Object} data - Registration data
 * @returns {Object} Validation result
 */
function validateRegistration(data) {
  const { email, password, first_name, last_name } = data;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (!first_name || first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!last_name || last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate patient data
 * @param {Object} data - Patient data
 * @returns {Object} Validation result
 */
function validatePatientData(data) {
  const { mrn, dob, gender, blood_type } = data;
  const errors = [];

  if (mrn && (typeof mrn !== 'string' || mrn.trim().length === 0)) {
    errors.push('Invalid MRN format');
  }

  if (dob && !validateDate(dob)) {
    errors.push('Invalid date of birth format (use YYYY-MM-DD)');
  }

  const validGenders = ['male', 'female', 'other'];
  if (gender && !validGenders.includes(gender.toLowerCase())) {
    errors.push('Invalid gender value');
  }

  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (blood_type && !validBloodTypes.includes(blood_type.toUpperCase())) {
    errors.push('Invalid blood type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateDate,
  sanitizeString,
  validateLoginCredentials,
  validateRegistration,
  validatePatientData,
};
