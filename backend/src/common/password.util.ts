import * as bcrypt from 'bcrypt';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function isPasswordHashed(password: string): boolean {
  return BCRYPT_HASH_REGEX.test(password);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

export function validatePasswordStrength(
  password: string,
): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('At least one digit');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('At least one special character (@$!%*?&)');
  }

  return { valid: errors.length === 0, errors };
}

export function assertPasswordStrength(password: string): void {
  const { valid, errors } = validatePasswordStrength(password);
  if (!valid) {
    throw new Error(errors.join(', '));
  }
}
