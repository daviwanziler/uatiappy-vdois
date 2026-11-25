import { useState } from 'react'
import { useAuth } from './AuthContext'
import { validateLoginInput } from './validation'

export default function LoginScreen() {
  const { signIn, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateLoginInput({ email, password })
    if (validationError) return setErrorMessage(validationError)

    setSubmitting(true)
    setErrorMessage('')
    try {
      const { error } = await signIn({ email, password })
      if (error) setErrorMessage('Não foi possível entrar. Verifique suas credenciais e tente novamente.')
    } catch {
      setErrorMessage('Serviço indisponível no momento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <span className="brand-mark" aria-hidden="true">U</span>
        <p className="eyebrow">Comunicação institucional</p>
        <h1 id="login-title">Entrar no UatiAppy</h1>
        <p className="auth-description">Acesse com as credenciais fornecidas pela administração.</p>
        {!isConfigured && <p className="message message-warning">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
          {errorMessage && <p className="message message-error" role="alert">{errorMessage}</p>}
          <button className="primary-button" type="submit" disabled={submitting || !isConfigured}>{submitting ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="auth-footnote">Não existe autocadastro. Solicite seu acesso à administração.</p>
      </section>
    </main>
  )
}
