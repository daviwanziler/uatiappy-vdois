import { StatusBar, StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f6fb" />
      <View style={styles.card}>
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>U</Text>
        </View>
        <Text style={styles.eyebrow}>COMUNICAÇÃO INSTITUCIONAL</Text>
        <Text style={styles.title}>Bem-vindo ao UatiAppy</Text>
        <Text style={styles.description}>
          Um espaço para conectar pessoas por meio de conversas individuais
          e mensagens de texto.
        </Text>
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Aplicativo mobile em desenvolvimento</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f6fb' },
  card: { padding: 28, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  brandMark: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#2563eb' },
  brandLetter: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  eyebrow: { marginTop: 28, marginBottom: 8, color: '#2563eb', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: '#172033', fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  description: { marginTop: 16, marginBottom: 24, color: '#526078', fontSize: 16, lineHeight: 25 },
  status: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 9, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#eff6ff' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  statusText: { color: '#1d4ed8', fontSize: 13, fontWeight: '600' }
})
