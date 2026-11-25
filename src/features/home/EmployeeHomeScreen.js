import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthContext'

export default function EmployeeHomeScreen() {
  const { user, signOut } = useAuth()
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>UatiAppy</Text>
        <Text style={styles.title}>Olá!</Text>
        <Text style={styles.description}>Você está autenticado como funcionário.</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.button}>
          <Text style={styles.buttonText}>Encerrar sessão</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f6fb' },
  card: { padding: 26, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  brand: { color: '#2563eb', fontWeight: '800', marginBottom: 24 },
  title: { color: '#172033', fontSize: 28, fontWeight: '800' },
  description: { color: '#64748b', marginTop: 10, lineHeight: 22 },
  email: { color: '#334155', fontWeight: '600', marginTop: 12 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '700' },
})
