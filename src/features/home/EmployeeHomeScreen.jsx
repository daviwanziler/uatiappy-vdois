import { useAuth } from '../auth/AuthContext'

export default function EmployeeHomeScreen() {
  const { user, signOut } = useAuth()
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div><p className="eyebrow">Área do funcionário</p><h1>UatiAppy</h1></div>
        <button className="secondary-button" onClick={signOut}>Sair</button>
      </header>
      <section className="auth-card">
        <h2>Bem-vindo!</h2>
        <p className="auth-description">Você está autenticado como funcionário.</p>
        <p>{user?.email}</p>
      </section>
    </main>
  )
}
