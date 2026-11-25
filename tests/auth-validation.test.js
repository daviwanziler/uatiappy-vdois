import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAdminProvisionInput, validateEmail, validateLoginInput } from '../src/features/auth/validation.js'

test('validates email format', () => {
  assert.equal(validateEmail('pessoa@empresa.com'), true)
  assert.equal(validateEmail('email-invalido'), false)
})

test('validates login fields', () => {
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: 'senha' }), null)
  assert.equal(validateLoginInput({ email: 'invalido', password: 'senha' }), 'Informe um e-mail válido.')
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: '' }), 'Informe sua senha.')
})

test('validates administrator provisioning', () => {
  assert.equal(validateAdminProvisionInput({ email: 'novo@empresa.com', password: 'senha1234', confirmPassword: 'senha1234' }), null)
  assert.equal(validateAdminProvisionInput({ email: 'novo@empresa.com', password: '123', confirmPassword: '123' }), 'A senha inicial deve ter pelo menos 8 caracteres.')
  assert.equal(validateAdminProvisionInput({ email: 'novo@empresa.com', password: 'senha1234', confirmPassword: 'outra1234' }), 'As senhas não coincidem.')
})
