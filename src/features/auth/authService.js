import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export async function createEmployeeAccount({ email, password }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Configure o Supabase antes de cadastrar contas.') }
  }

  // A Edge Function valida o JWT e o perfil Administrador no servidor.
  // A chave service_role nunca é enviada nem armazenada no aplicativo.
  return supabase.functions.invoke('admin-create-user', {
    body: { email: email.trim().toLowerCase(), password },
  })
}
