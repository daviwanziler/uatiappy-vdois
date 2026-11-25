import { AuthProvider } from './features/auth/AuthContext'
import AppGate from './navigation/AppGate'

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}

export default App
