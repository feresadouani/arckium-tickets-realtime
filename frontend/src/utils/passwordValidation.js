export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'digit',
    label: 'One digit (0-9)',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'One special character (@$!%*?&)',
    test: (password) => /[@$!%*?&]/.test(password),
  },
]

export function getPasswordRuleStatus(password) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    valid: rule.test(password),
  }))
}

export function validatePassword(password) {
  const rules = getPasswordRuleStatus(password)
  const errors = rules.filter((r) => !r.valid).map((r) => r.label)
  return {
    valid: errors.length === 0,
    errors,
    rules,
  }
}
