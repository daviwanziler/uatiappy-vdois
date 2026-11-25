import { useAuth } from '../features/auth/AuthContext'
import LoginScreen from '../features/auth/LoginScreen'
import CreateEmployeeScreen from '../features/admin/CreateEmployeeScreen'
import EmployeeHomeScreen from '../features/home/EmployeeHomeScreen'

export default function AppGate() {
  const { loading, user, isConfigured } = useAuth()

  if (loading) return <main className="auth-shell"><p>Verificando sessão…</p></main>
  if (!isConfigured || !user) return <LoginScreen />

  const role = user.app_metadata?.role
  if (role === 'ADMINISTRADOR') return <CreateEmployeeScreen />
  if (role === 'FUNCIONARIO') return <EmployeeHomeScreen />

  return <main className="auth-shell"><section className="auth-card"><h1>Acesso não autorizado</h1><p>Seu perfil não possui permissão. Procure a administração.</p></section></main>
}
