import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function EmployeeHomeScreen() {
  const { user, signOut } = useAuth()
  const [logoutError, setLogoutError] = useState('')
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

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div><p className="eyebrow">Área do funcionário</p><h1>UatiAppy</h1></div>
        <button className="secondary-button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Saindo…' : 'Sair'}
        </button>
      </header>
      {logoutError && <p className="message message-error" role="alert">{logoutError}</p>}
      <section className="auth-card">
        <h2>Bem-vindo!</h2>
        <p className="auth-description">Você está autenticado como funcionário.</p>
        <p>{user?.email}</p>
      </section>
    </main>
  )
}
