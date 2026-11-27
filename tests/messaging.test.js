import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidMessageBody, mergeMessages } from '../public/js/messaging.js'

test('rejects empty and whitespace-only messages', () => {
  assert.equal(isValidMessageBody(''), false)
  assert.equal(isValidMessageBody('   \n  '), false)
})

test('accepts trimmed text up to the database limit', () => {
  assert.equal(isValidMessageBody(' Olá '), true)
  assert.equal(isValidMessageBody('a'.repeat(10000)), true)
  assert.equal(isValidMessageBody('a'.repeat(10001)), false)
})

test('merges pages without duplicate message ids and keeps chronological order', () => {
  const older = { id: 'a', created_at: '2026-11-27T10:00:00.000Z', body: 'antiga' }
  const newer = { id: 'b', created_at: '2026-11-27T10:01:00.000Z', body: 'nova' }
  const updated = { ...newer, body: 'nova atualizada' }
  const result = mergeMessages([newer], [older, updated])
  assert.deepEqual(result.map(item => item.id), ['a', 'b'])
  assert.equal(result[1].body, 'nova atualizada')
})
