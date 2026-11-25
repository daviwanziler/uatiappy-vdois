import { useState } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import LoginScreen from '../features/auth/LoginScreen'
import CreateEmployeeScreen from '../features/admin/CreateEmployeeScreen'
import EmployeeHomeScreen from '../features/home/EmployeeHomeScreen'

export default function AppGate() {
  const { loading, user, isConfigured, signOut } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setLogoutError('')
    setSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        setLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
        return
      }
      // A navegação para o login ocorre quando o Supabase notifica a sessão nula.
    } catch {
      setLogoutError('Não foi possível encerrar sua sessão. Tente novamente.')
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) return <main className="auth-shell"><p>Verificando sessão…</p></main>
  if (!isConfigured || !user) return <LoginScreen />

  const role = user.app_metadata?.role
  if (role === 'ADMINISTRADOR') return <CreateEmployeeScreen />
  if (role === 'FUNCIONARIO') return <EmployeeHomeScreen />

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Acesso não autorizado</h1>
        <p>Seu perfil não possui permissão. Procure a administração.</p>
        {logoutError && <p className="message message-error" role="alert">{logoutError}</p>}
        <button className="secondary-button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Saindo…' : 'Sair'}
        </button>
      </section>
    </main>
  )
}
