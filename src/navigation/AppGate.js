import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../features/auth/AuthContext'
import LoginScreen from '../features/auth/LoginScreen'
import CreateEmployeeScreen from '../features/admin/CreateEmployeeScreen'
import EmployeeHomeScreen from '../features/home/EmployeeHomeScreen'

export default function AppGate() {
  const { loading, user, isConfigured } = useAuth()
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.message}>Verificando sessão...</Text>
      </View>
    )
  }
  if (!isConfigured || !user) return <LoginScreen />

  const role = user.app_metadata?.role
  if (role === 'ADMINISTRADOR') return <CreateEmployeeScreen />
  if (role === 'FUNCIONARIO') return <EmployeeHomeScreen />

  return (
    <View style={styles.center}>
      <Text style={styles.message}>Seu perfil ainda não possui permissão de acesso. Procure a administração.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#f3f6fb' },
  message: { color: '#475569', textAlign: 'center', marginTop: 12, lineHeight: 22 },
})
