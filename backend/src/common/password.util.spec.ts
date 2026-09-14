import {
  isPasswordHashed,
  validatePasswordStrength,
  PASSWORD_MIN_LENGTH,
} from './password.util';

describe('password.util', () => {
  describe('isPasswordHashed', () => {
    it('returns true for a bcrypt hash', () => {
      const hash =
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      expect(isPasswordHashed(hash)).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(isPasswordHashed('Test@1234')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('accepts a strong password', () => {
      const result = validatePasswordStrength('Test@1234');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects a short password', () => {
      const result = validatePasswordStrength('Ab1@');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes(String(PASSWORD_MIN_LENGTH)))).toBe(
        true,
      );
    });

    it('requires uppercase, lowercase, digit and special char', () => {
      expect(validatePasswordStrength('abcdefgh').valid).toBe(false);
      expect(validatePasswordStrength('ABCDEFGH').valid).toBe(false);
      expect(validatePasswordStrength('Abcdefgh').valid).toBe(false);
      expect(validatePasswordStrength('Abcdefg1').valid).toBe(false);
    });
  });
});
