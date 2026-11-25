export function normalizeAuditEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function sha256Email(email: string): Promise<string> {
  return sha256Hex(normalizeAuditEmail(email))
}
