import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createEmployeeAccount } from '../auth/authService'
import { validateAdminProvisionInput } from '../auth/validation'

export default function CreateEmployeeScreen() {
  const { user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      else {
        setFeedback('Conta criada para ' + data.email + '. Entregue as credenciais por um canal seguro.')
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
        <button className="secondary-button" onClick={signOut}>Sair</button>
      </header>
      <section className="auth-card admin-card">
        <h2>Cadastrar funcionário</h2>
        <p className="auth-description">Administrador: {user?.email}. Crie a conta e defina a senha inicial do funcionário.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="employee-email">E-mail de acesso</label>
          <input id="employee-email" type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} required />
          <label htmlFor="initial-password">Senha inicial</label>
          <input id="initial-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required />
          <label htmlFor="confirm-password">Confirmar senha</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          {errorMessage && <p className="message message-error" role="alert">{errorMessage}</p>}
          {feedback && <p className="message message-success" role="status">{feedback}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Criando…' : 'Criar conta'}</button>
        </form>
      </section>
    </main>
  )
}
