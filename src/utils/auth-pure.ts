/**
 * Check password strength
 * Weak (red): Less than 8 characters or only letters/numbers
 * Medium (yellow): 8+ characters with letters and numbers
 * Strong (green): 12+ characters with uppercase, lowercase, numbers, and special characters
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function checkPasswordStrength(password: string): PasswordStrength {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);

  if (password.length >= 12 && hasUpper && hasLower && hasNumber && hasSpecial) {
    return 'strong';
  }

  if (password.length >= 8 && hasLetter && hasNumber) {
    return 'medium';
  }

  return 'weak';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
