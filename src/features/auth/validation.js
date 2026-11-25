export const PASSWORD_POLICY = Object.freeze({
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
})

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
}

export function validatePassword(password) {
  const value = String(password ?? '')
  if (value.length < PASSWORD_POLICY.minLength) return 'A senha deve ter pelo menos 12 caracteres.'
  if (value.length > PASSWORD_POLICY.maxLength) return 'A senha deve ter no máximo 128 caracteres.'
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(value)) return 'A senha deve conter ao menos uma letra maiúscula.'
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(value)) return 'A senha deve conter ao menos uma letra minúscula.'
  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(value)) return 'A senha deve conter ao menos um número.'
  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(value)) return 'A senha deve conter ao menos um símbolo.'
  return null
}

export function validateLoginInput({ email, password }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  if (!String(password ?? '').length) return 'Informe sua senha.'
  return null
}

export function validateAdminProvisionInput({ email, password, confirmPassword }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  const passwordError = validatePassword(password)
  if (passwordError) return passwordError
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}
