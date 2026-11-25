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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setSession(null)
      else setSession(data.session)
      setLoading(false)
    }).catch(() => {
      if (active) {
        setSession(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn({ email, password }) {
    if (!isSupabaseConfigured) return { error: new Error('Supabase não configurado.') }
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
  }

  async function signOut() {
    if (!isSupabaseConfigured) return { error: new Error('Supabase não configurado.') }
    return supabase.auth.signOut()
  }

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signOut,
  }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}
