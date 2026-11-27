import { corsHeadersFor } from '../_shared/cors.ts'
import { validateEmployeeProvision } from '../_shared/validation.ts'
import { normalizeAuditEmail, sha256Email } from '../_shared/audit.ts'
import { finalizeCreatedAccount } from '../_shared/provisioning.ts'
import { parseAccountStatusPayload } from '../_shared/account-status.ts'

Deno.test('CORS allows only explicitly configured production origins', () => {
  Deno.env.set('SUPABASE_URL', 'https://project.supabase.co')
  Deno.env.set('ALLOWED_ORIGINS', 'https://app.example.com, https://admin.example.com')
  const allowed = corsHeadersFor(new Request('https://function.example.com', { headers: { Origin: 'https://app.example.com' } }))
  const denied = corsHeadersFor(new Request('https://function.example.com', { headers: { Origin: 'https://attacker.example' } }))
  if (!allowed.allowed || allowed.headers['Access-Control-Allow-Origin'] !== 'https://app.example.com') throw new Error('Configured origin should be allowed.')
  if (denied.allowed || denied.headers['Access-Control-Allow-Origin']) throw new Error('Unconfigured origin must be rejected.')
})

Deno.test('CORS fails closed in hosted environments without an allowlist', () => {
  Deno.env.set('SUPABASE_URL', 'https://project.supabase.co')
  Deno.env.delete('ALLOWED_ORIGINS')
  const result = corsHeadersFor(new Request('https://function.example.com', { method: 'OPTIONS', headers: { Origin: 'https://unknown.example' } }))
  if (result.allowed) throw new Error('Production CORS must fail closed.')
})

Deno.test('CORS answers preflight with required headers for an allowed origin', () => {
  Deno.env.set('ALLOWED_ORIGINS', 'https://app.example.com')
  const result = corsHeadersFor(new Request('https://function.example.com', { method: 'OPTIONS', headers: { Origin: 'https://app.example.com' } }))
  if (result.headers['Access-Control-Allow-Methods'] !== 'POST, OPTIONS') throw new Error('Preflight methods are missing.')
  if (!result.headers['Access-Control-Allow-Headers'].includes('authorization')) throw new Error('Authorization header must be allowed.')
})

Deno.test('server-side employee provisioning enforces the same password policy', () => {
  if (validateEmployeeProvision('employee@example.com', 'UatiAppy#2026') !== null) throw new Error('A compliant email/password pair should be accepted.')
  if (!validateEmployeeProvision('employee@example.com', 'short')) throw new Error('A short password must be rejected.')
  if (!validateEmployeeProvision('not-an-email', 'UatiAppy#2026')) throw new Error('An invalid email must be rejected.')
  if (!validateEmployeeProvision('employee@example.com', 'uatiappy#2026')) throw new Error('A password without uppercase must be rejected.')
})

Deno.test('audit email hash normalizes trim and lowercase before SHA-256', async () => {
  const normalized = normalizeAuditEmail('  Employee@Example.COM  ')
  if (normalized !== 'employee@example.com') throw new Error('Email normalization is incorrect.')
  const hashWithWhitespace = await sha256Email('  Employee@Example.COM  ')
  const hashNormalized = await sha256Email('employee@example.com')
  if (hashWithWhitespace !== hashNormalized) throw new Error('Equivalent normalized emails must have the same hash.')
  if (!/^[0-9a-f]{64}$/.test(hashWithWhitespace)) throw new Error('Audit hash must be a SHA-256 hex digest.')
})

Deno.test('successful Auth creation with failed audit finalization remains explicitly recoverable', async () => {
  const result = await finalizeCreatedAccount(async () => ({ error: new Error('database unavailable') }))
  if (result.auditStatus !== 'PENDING_RECONCILIATION') throw new Error('The created account must be reported as pending reconciliation, not failed.')
})

Deno.test('successful audit finalization returns success', async () => {
  const result = await finalizeCreatedAccount(async () => ({}))
  if (result.auditStatus !== 'SUCCESS') throw new Error('Expected successful audit finalization.')
})

Deno.test('thrown audit finalization error is recoverable and does not imply account creation failed', async () => {
  const result = await finalizeCreatedAccount(async () => { throw new Error('network timeout') })
  if (result.auditStatus !== 'PENDING_RECONCILIATION') throw new Error('Thrown audit error must be reconciled later.')
})

Deno.test('account status payload rejects null, arrays, invalid UUIDs and unsupported statuses', () => {
  if (parseAccountStatusPayload(null) !== null) throw new Error('JSON null must be rejected.')
  if (parseAccountStatusPayload([]) !== null) throw new Error('JSON arrays must be rejected.')
  if (parseAccountStatusPayload('text') !== null) throw new Error('JSON primitives must be rejected.')
  if (parseAccountStatusPayload({ userId: 'not-a-uuid', status: 'ACTIVE' }) !== null) throw new Error('Invalid UUID must be rejected.')
  if (parseAccountStatusPayload({ userId: '11111111-1111-4111-8111-111111111111', status: 'ROOT' }) !== null) throw new Error('Unsupported status must be rejected.')
  const valid = parseAccountStatusPayload({ userId: '11111111-1111-4111-8111-111111111111', status: 'BLOCKED' })
  if (valid?.status !== 'BLOCKED') throw new Error('A valid account status payload must be accepted.')
})
