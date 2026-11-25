export function validateEmail(email) {
  const normalizedEmail = String(email ?? '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
}

export function validateLoginInput({ email, password }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  if (!String(password ?? '').length) return 'Informe sua senha.'
  return null
}

export function validateAdminProvisionInput({ email, password, confirmPassword }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  if (!String(password ?? '').length) return 'Informe a senha inicial.'
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}
