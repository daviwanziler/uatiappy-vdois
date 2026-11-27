import { readFile } from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'

test('development server defaults to loopback and requires explicit opt-in for external binding', async () => {
  const source = await readFile(new URL('../scripts/dev-server.mjs', import.meta.url), 'utf8')
  assert.match(source, /process\.env\.HOST\s*\?\?\s*'127\.0\.0\.1'/)
  assert.match(source, /ALLOW_EXTERNAL_DEV_HOST !== 'true'/)
  assert.match(source, /server\.listen\(port, host/)
})
