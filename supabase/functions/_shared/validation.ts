const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type AccountStatusPayload = {
  userId: string
  status: 'ACTIVE' | 'BLOCKED' | 'DISABLED'
}

export function authBanDurationForStatus(status: 'ACTIVE' | 'BLOCKED' | 'DISABLED'): string {
  return status === 'ACTIVE' ? 'none' : '876000h'
}

export function parseAccountStatusPayload(value: unknown): AccountStatusPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const payload = value as Record<string, unknown>
  if (typeof payload.userId !== 'string' || !UUID_PATTERN.test(payload.userId)) return null
  if (typeof payload.status !== 'string' || !['ACTIVE', 'BLOCKED', 'DISABLED'].includes(payload.status)) return null
  return { userId: payload.userId, status: payload.status as AccountStatusPayload['status'] }
}

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
