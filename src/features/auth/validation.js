export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim())
}

export function validateLoginInput({ email, password }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  if (!String(password ?? '').length) return 'Informe sua senha.'
  return null
}

export function validateAdminProvisionInput({ email, password, confirmPassword }) {
  if (!validateEmail(email)) return 'Informe um e-mail válido.'
  if (String(password ?? '').length < 8) return 'A senha inicial deve ter pelo menos 8 caracteres.'
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}
