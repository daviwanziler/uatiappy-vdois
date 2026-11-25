import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export async function createEmployeeAccount({ email, password }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Configure o Supabase antes de cadastrar contas.') }
  }

  // A Edge Function valida a sessão e o papel administrativo no servidor.
  // A chave service_role nunca é enviada ao navegador.
  return supabase.functions.invoke('admin-create-user', {
    body: { email: email.trim().toLowerCase(), password },
  })
}
