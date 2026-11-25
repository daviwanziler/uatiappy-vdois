import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/features/auth/AuthContext'
import AppGate from './src/navigation/AppGate'

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppGate />
    </AuthProvider>
  )
}
