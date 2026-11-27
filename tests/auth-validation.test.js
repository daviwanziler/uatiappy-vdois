import test from 'node:test'
import assert from 'node:assert/strict'
import { PASSWORD_POLICY, validateAdminProvisionInput, validateEmail, validateLoginInput, validatePassword } from '../public/js/validation.js'

test('validates email format', () => {
  assert.equal(validateEmail('pessoa@empresa.com'), true)
  assert.equal(validateEmail('email-invalido'), false)
})
test('validates login without password creation rules', () => {
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: 'senha-antiga' }), null)
  assert.equal(validateLoginInput({ email: 'invalido', password: 'senha' }), 'Informe um e-mail válido.')
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: '' }), 'Informe sua senha.')
})
test('password policy accepts compliant password', () => {
  assert.equal(PASSWORD_POLICY.minLength, 12)
  assert.equal(validatePassword('UatiAppy#2026'), null)
})
test('password policy rejects short, long and low-complexity passwords', () => {
  assert.match(validatePassword('Ab1!curta'), /12 caracteres/)
  assert.match(validatePassword('a'.repeat(129)), /128 caracteres/)
  assert.match(validatePassword('uatiappy2026!'), /maiúscula/)
  assert.match(validatePassword('UATIAPPY2026!'), /minúscula/)
  assert.match(validatePassword('UatiAppySenha!'), /número/)
  assert.match(validatePassword('UatiAppySenha2026'), /símbolo/)
})
test('validates administrator provisioning and confirmation', () => {
  assert.equal(validateAdminProvisionInput({ email: 'novo@empresa.com', password: 'UatiAppy#2026', confirmPassword: 'UatiAppy#2026' }), null)
  assert.match(validateAdminProvisionInput({ email: 'novo@empresa.com', password: '123', confirmPassword: '123' }), /12 caracteres/)
  assert.equal(validateAdminProvisionInput({ email: 'novo@empresa.com', password: 'UatiAppy#2026', confirmPassword: 'outraSenha#2026' }), 'As senhas não coincidem.')
})
