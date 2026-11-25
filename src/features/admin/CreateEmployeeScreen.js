import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { createEmployeeAccount } from '../auth/authService'
import { validateAdminProvisionInput } from '../auth/validation'
import { useAuth } from '../auth/AuthContext'

export default function CreateEmployeeScreen() {
  const { signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    const validationError = validateAdminProvisionInput({ email, password, confirmPassword })
    if (validationError) {
      setErrorMessage(validationError)
      setFeedback('')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    setFeedback('')
    try {
      const { data, error } = await createEmployeeAccount({ email, password })
      if (error) {
        setErrorMessage('Não foi possível criar a conta. Verifique os dados e as permissões da administração.')
      } else {
        setFeedback('Conta criada para ' + data.email + '. Entregue as credenciais ao funcionário por um canal seguro.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch {
      setErrorMessage('O serviço está indisponível no momento. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ÁREA ADMINISTRATIVA</Text>
          <Text style={styles.title}>Cadastrar funcionário</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={signOut}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.description}>
          Crie a conta e defina a senha inicial. O funcionário receberá as credenciais da administração.
        </Text>
        <Text style={styles.label}>E-mail de acesso</Text>
        <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail}
          placeholder="funcionario@empresa.com" style={styles.input} value={email} />
        <Text style={styles.label}>Senha inicial</Text>
        <TextInput onChangeText={setPassword} placeholder="Defina a senha inicial"
          secureTextEntry style={styles.input} value={password} />
        <Text style={styles.label}>Confirmar senha inicial</Text>
        <TextInput onChangeText={setConfirmPassword} placeholder="Repita a senha"
          secureTextEntry style={styles.input} value={confirmPassword} />
        {!!errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}
        {!!feedback && <Text accessibilityRole="status" style={styles.success}>{feedback}</Text>}
        <Pressable accessibilityRole="button" disabled={submitting} onPress={handleCreate}
          style={[styles.button, submitting && styles.disabled]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64, backgroundColor: '#f3f6fb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  eyebrow: { color: '#2563eb', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#172033', fontSize: 25, fontWeight: '800', marginTop: 6 },
  logout: { color: '#1d4ed8', fontWeight: '700' },
  card: { backgroundColor: '#fff', padding: 22, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  description: { color: '#64748b', fontSize: 14, lineHeight: 21, marginBottom: 14 },
  label: { color: '#334155', fontSize: 13, fontWeight: '700', marginTop: 13, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 11, padding: 13, color: '#172033' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 22 },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b91c1c', marginTop: 12, fontSize: 13 },
  success: { color: '#166534', marginTop: 12, fontSize: 13, lineHeight: 19 },
})
