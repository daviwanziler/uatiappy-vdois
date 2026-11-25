import { StatusBar } from 'react-native'
import { AuthProvider } from './src/features/auth/AuthContext'
import AppGate from './src/navigation/AppGate'

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <AppGate />
    </AuthProvider>
  )
}
