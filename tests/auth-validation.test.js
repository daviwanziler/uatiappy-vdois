import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateAdminProvisionInput,
  validateEmail,
  validateLoginInput,
} from '../src/features/auth/validation.js'

test('accepts a valid email', () => {
  assert.equal(validateEmail('pessoa@empresa.com'), true)
})

test('rejects malformed email', () => {
  assert.equal(validateEmail('email-invalido'), false)
})

test('login requires email and password', () => {
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: 'senha' }), null)
  assert.equal(validateLoginInput({ email: 'invalido', password: 'senha' }), 'Informe um e-mail válido.')
  assert.equal(validateLoginInput({ email: 'pessoa@empresa.com', password: '' }), 'Informe sua senha.')
})

test('administrator provisioning requires valid email and matching passwords', () => {
  assert.equal(validateAdminProvisionInput({
    email: 'novo@empresa.com', password: 'senha-inicial', confirmPassword: 'senha-inicial',
  }), null)
  assert.equal(validateAdminProvisionInput({
    email: 'novo@empresa.com', password: 'senha-inicial', confirmPassword: 'outra-senha',
  }), 'As senhas não coincidem.')
})
