export type EmployeeAccountStatus = 'ACTIVE' | 'BLOCKED' | 'DISABLED'

export type AccountStatusPayload = {
  userId: string
  status: EmployeeAccountStatus
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ALLOWED_STATUSES = new Set<EmployeeAccountStatus>(['ACTIVE', 'BLOCKED', 'DISABLED'])

export function parseAccountStatusPayload(value: unknown): AccountStatusPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const payload = value as Record<string, unknown>
  if (typeof payload.userId !== 'string' || !UUID_PATTERN.test(payload.userId)) return null
  if (typeof payload.status !== 'string' || !ALLOWED_STATUSES.has(payload.status as EmployeeAccountStatus)) return null

  return { userId: payload.userId, status: payload.status as EmployeeAccountStatus }
}
