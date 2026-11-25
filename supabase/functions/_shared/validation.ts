const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/

export function validateEmployeeProvision(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return 'Informe um e-mail válido.'
  if (password.length < 12) return 'A senha deve ter pelo menos 12 caracteres.'
  if (password.length > 128) return 'A senha deve ter no máximo 128 caracteres.'
  if (!/[A-Z]/.test(password)) return 'A senha deve conter ao menos uma letra maiúscula.'
  if (!/[a-z]/.test(password)) return 'A senha deve conter ao menos uma letra minúscula.'
  if (!/[0-9]/.test(password)) return 'A senha deve conter ao menos um número.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'A senha deve conter ao menos um símbolo.'
  return null
}
