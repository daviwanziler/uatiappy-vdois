import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveDevServerHost } from '../scripts/dev-server-config.mjs'

test('development server binds to loopback by default', () => {
  assert.equal(resolveDevServerHost(undefined), '127.0.0.1')
  assert.equal(resolveDevServerHost(''), '127.0.0.1')
  assert.equal(resolveDevServerHost('   '), '127.0.0.1')
})

test('development server can be explicitly exposed on a configured host', () => {
  assert.equal(resolveDevServerHost('0.0.0.0'), '0.0.0.0')
  assert.equal(resolveDevServerHost('  192.168.1.10  '), '192.168.1.10')
})
