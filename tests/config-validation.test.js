import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicSupabaseConfig } from '../scripts/config-validation.mjs'

const jwt = payload => `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`

test('accepts hosted HTTPS Supabase URLs and public anon keys', () => {
  const result = validatePublicSupabaseConfig('https://project.supabase.co', 'sb_publishable_example')
  assert.equal(result.supabaseUrl, 'https://project.supabase.co')
  assert.equal(result.supabaseAnonKey, 'sb_publishable_example')
})
test('accepts local Supabase HTTP URL for development', () => {
  const result = validatePublicSupabaseConfig('http://127.0.0.1:54321', 'local-anon-key')
  assert.equal(result.supabaseUrl, 'http://127.0.0.1:54321')
})
test('rejects non-local HTTP and secret key formats', () => {
  assert.throws(() => validatePublicSupabaseConfig('http://project.supabase.co', 'anon'), /HTTPS/)
  assert.throws(() => validatePublicSupabaseConfig('https://project.supabase.co', 'sb_secret_private'), /secreta/)
})
test('rejects legacy JWT service_role and supabase_admin keys', () => {
  assert.throws(() => validatePublicSupabaseConfig('https://project.supabase.co', jwt({ role: 'service_role' })), /privilegiada/)
  assert.throws(() => validatePublicSupabaseConfig('https://project.supabase.co', jwt({ role: 'supabase_admin' })), /privilegiada/)
})
test('requires URL and key together', () => {
  assert.throws(() => validatePublicSupabaseConfig('https://project.supabase.co', ''), /juntas/)
})
