// Common validation functions for waitlist forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Personal email domains that should be blocked for work email validation
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com',
  'msn.com',
  'ymail.com',
  'rocketmail.com',
  'mail.com',
  'protonmail.com',
  'tutanota.com',
  'fastmail.com',
  'zoho.com',
  'rediffmail.com',
  'inbox.com'
];

/**
 * Validates that a full name contains at least first and last name
 */
export const validateFullName = (fullName: string): ValidationResult => {
  const trimmedName = fullName.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Please enter your full name' };
  }
  
  // Split by spaces and filter out empty strings
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  
  if (nameParts.length < 2) {
    return { 
      isValid: false, 
      error: 'Please enter your first and last name (e.g., "John Smith")'
    };
  }
  
  // Check if each name part has at least 2 characters
  const hasValidParts = nameParts.every(part => part.length >= 2);
  if (!hasValidParts) {
    return { 
      isValid: false, 
      error: 'Please enter your complete first and last name'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates that an email is a work email (not personal)
 */
export const validateWorkEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!trimmedEmail) {
    return { isValid: false, error: 'Please enter your email address' };
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Extract domain
  const domain = trimmedEmail.split('@')[1];
  
  // Check if it's a personal email domain
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Please use your work email address (personal emails like Gmail, Yahoo, etc. are not allowed)'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates email based on variant (work email for enterprise, any email for personal)
 */
export const validateEmailByVariant = (email: string, variant: 'enterprise' | 'personal'): ValidationResult => {
  if (variant === 'personal') {
    // For personal variant, just validate email format
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      return { isValid: false, error: 'Please enter your email address' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  } else {
    // For enterprise variant, validate work email
    return validateWorkEmail(email);
  }
};

/**
 * Validates both full name and email based on variant
 */
export const validateWaitlistForm = (fullName: string, email: string, variant: 'enterprise' | 'personal' = 'enterprise'): {
  nameValidation: ValidationResult;
  emailValidation: ValidationResult;
  isFormValid: boolean;
} => {
  const nameValidation = validateFullName(fullName);
  const emailValidation = validateEmailByVariant(email, variant);
  
  return {
    nameValidation,
    emailValidation,
    isFormValid: nameValidation.isValid && emailValidation.isValid
  };
};