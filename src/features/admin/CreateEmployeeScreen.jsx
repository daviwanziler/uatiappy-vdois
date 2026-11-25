import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createEmployeeAccount } from '../auth/authService'
import EmployeeAccountManagement from './EmployeeAccountManagement'
import { validateAdminProvisionInput } from '../auth/validation'

export default function CreateEmployeeScreen() {
  const { user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [logoutError, setLogoutError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setLogoutError('')
    setSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) setLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
    } catch {
      setLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
    } finally {
      setSigningOut(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateAdminProvisionInput({ email, password, confirmPassword })
    if (validationError) {
      setErrorMessage(validationError)
      setFeedback('')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    setFeedback('')
    try {
      const { data, error } = await createEmployeeAccount({ email, password })
      if (error) setErrorMessage(error.message || 'Não foi possível criar a conta.')
      else if (data?.auditStatus === 'PENDING_RECONCILIATION') {
        setErrorMessage('')
        setFeedback('A conta foi criada, mas a auditoria está sendo reconciliada. NÃO tente cadastrar novamente. A rotina automática verificará o registro.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        setFeedback(data?.recovered
          ? 'A conta já existia e a auditoria foi reconciliada. Nenhuma conta duplicada foi criada.'
          : 'Conta criada para ' + data.email + '. Entregue as credenciais por um canal seguro.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch {
      setErrorMessage('Serviço indisponível no momento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div><p className="eyebrow">Área administrativa</p><h1>UatiAppy</h1></div>
        <button className="secondary-button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Saindo…' : 'Sair'}
        </button>
      </header>
      {logoutError && <p className="message message-error" role="alert">{logoutError}</p>}
      <section className="auth-card admin-card">
        <h2>Cadastrar funcionário</h2>
        <p className="auth-description">Administrador: {user?.email}. Crie a conta. A senha deve ter de 12 a 128 caracteres, com maiúscula, minúscula, número e símbolo.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="employee-email">E-mail de acesso</label>
          <input id="employee-email" type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} required />
          <label htmlFor="initial-password">Senha inicial</label>
          <input id="initial-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required />
          <label htmlFor="confirm-password">Confirmar senha</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          {errorMessage && <p className="message message-error" role="alert">{errorMessage}</p>}
          {feedback && <p className="message message-success" role="status">{feedback}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Criando…' : 'Criar conta'}</button>
        </form>
      </section>
      <EmployeeAccountManagement />
    </main>
  )
}
