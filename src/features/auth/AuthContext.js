import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return undefined
    }

    let active = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) console.warn('Não foi possível recuperar a sessão.')
        setSession(data?.session ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setSession(null)
          setLoading(false)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) setSession(nextSession)
      },
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) return { error: new Error('Configure as variáveis do Supabase.') }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (!error) setSession(data.session)
    return { data, error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return { error: new Error('Supabase não está configurado.') }
    const { error } = await supabase.auth.signOut()
    if (!error) setSession(null)
    return { error }
  }

  const value = useMemo(() => ({
    session, user: session?.user ?? null, loading,
    isConfigured: isSupabaseConfigured, signIn, signOut,
  }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}
