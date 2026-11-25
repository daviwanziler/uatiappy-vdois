import { corsHeadersFor } from '../_shared/cors.ts'
import { validateEmployeeProvision } from '../_shared/validation.ts'
import { normalizeAuditEmail, sha256Email } from '../_shared/audit.ts'

Deno.test('CORS allows only explicitly configured production origins', () => {
  Deno.env.set('SUPABASE_URL', 'https://project.supabase.co')
  Deno.env.set('ALLOWED_ORIGINS', 'https://app.example.com, https://admin.example.com')

  const allowed = corsHeadersFor(new Request('https://function.example.com', {
    headers: { Origin: 'https://app.example.com' },
  }))
  const denied = corsHeadersFor(new Request('https://function.example.com', {
    headers: { Origin: 'https://attacker.example' },
  }))

  if (!allowed.allowed || allowed.headers['Access-Control-Allow-Origin'] !== 'https://app.example.com') {
    throw new Error('Configured origin should be allowed.')
  }
  if (denied.allowed || denied.headers['Access-Control-Allow-Origin']) {
    throw new Error('Unconfigured origin must be rejected.')
  }
})

Deno.test('CORS fails closed in hosted environments without an allowlist', () => {
  Deno.env.set('SUPABASE_URL', 'https://project.supabase.co')
  Deno.env.delete('ALLOWED_ORIGINS')
  const result = corsHeadersFor(new Request('https://function.example.com', {
    method: 'OPTIONS',
    headers: { Origin: 'https://unknown.example' },
  }))
  if (result.allowed) throw new Error('Production CORS must fail closed.')
})

Deno.test('CORS answers preflight with required headers for an allowed origin', () => {
  Deno.env.set('ALLOWED_ORIGINS', 'https://app.example.com')
  const result = corsHeadersFor(new Request('https://function.example.com', {
    method: 'OPTIONS',
    headers: { Origin: 'https://app.example.com' },
  }))
  if (result.headers['Access-Control-Allow-Methods'] !== 'POST, OPTIONS') {
    throw new Error('Preflight methods are missing.')
  }
  if (!result.headers['Access-Control-Allow-Headers'].includes('authorization')) {
    throw new Error('Authorization header must be allowed.')
  }
})

Deno.test('server-side employee provisioning enforces the same password policy', () => {
  if (validateEmployeeProvision('employee@example.com', 'UatiAppy#2026') !== null) {
    throw new Error('A compliant email/password pair should be accepted.')
  }
  if (!validateEmployeeProvision('employee@example.com', 'short')) {
    throw new Error('A short password must be rejected.')
  }
  if (!validateEmployeeProvision('not-an-email', 'UatiAppy#2026')) {
    throw new Error('An invalid email must be rejected.')
  }
  if (!validateEmployeeProvision('employee@example.com', 'uatiappy#2026')) {
    throw new Error('A password without uppercase must be rejected.')
  }
})

Deno.test('audit email hash normalizes trim and lowercase before SHA-256', async () => {
  const normalized = normalizeAuditEmail('  Employee@Example.COM  ')
  if (normalized !== 'employee@example.com') throw new Error('Email normalization is incorrect.')
  const hashWithWhitespace = await sha256Email('  Employee@Example.COM  ')
  const hashNormalized = await sha256Email('employee@example.com')
  if (hashWithWhitespace !== hashNormalized) throw new Error('Equivalent normalized emails must have the same hash.')
  if (!/^[0-9a-f]{64}$/.test(hashWithWhitespace)) throw new Error('Audit hash must be a SHA-256 hex digest.')
})
