import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAuth } from './AuthContext'
import { validateLoginInput } from './validation'

export default function LoginScreen() {
  const { signIn, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin() {
    const validationError = validateLoginInput({ email, password })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      const { error } = await signIn({ email, password })
      if (error) setErrorMessage('Não foi possível entrar. Verifique suas credenciais ou tente novamente.')
    } catch {
      setErrorMessage('O serviço está indisponível no momento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>UatiAppy</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.description}>Use as credenciais fornecidas pela administração.</Text>
        {!isConfigured && (
          <Text style={styles.warning}>
            Supabase ainda não configurado. Crie o arquivo .env com as variáveis indicadas em .env.example.
          </Text>
        )}
        <Text style={styles.label}>E-mail</Text>
        <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address"
          onChangeText={setEmail} placeholder="seu.email@empresa.com" style={styles.input} value={email} />
        <Text style={styles.label}>Senha</Text>
        <TextInput autoCapitalize="none" onChangeText={setPassword} placeholder="Sua senha"
          secureTextEntry style={styles.input} value={password} />
        {!!errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}
        <Pressable accessibilityRole="button" disabled={submitting || !isConfigured}
          onPress={handleLogin} style={[styles.button, (submitting || !isConfigured) && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
        <Text style={styles.footer}>Não existe autocadastro. Solicite suas credenciais à administração.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f6fb' },
  card: { padding: 26, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  brand: { color: '#2563eb', fontSize: 15, fontWeight: '800', marginBottom: 24 },
  title: { color: '#172033', fontSize: 28, fontWeight: '800' },
  description: { color: '#64748b', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  label: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, color: '#172033', fontSize: 15 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 22 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { color: '#b91c1c', marginTop: 12, fontSize: 13 },
  warning: { color: '#92400e', backgroundColor: '#fffbeb', padding: 12, borderRadius: 10, fontSize: 12, marginBottom: 10 },
  footer: { color: '#64748b', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
})
