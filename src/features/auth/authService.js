import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export async function createEmployeeAccount({ email, password }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Configure o Supabase antes de cadastrar contas.') }
  }
  // A Edge Function valida sessão, status e papel administrativo no servidor.
  // A chave service_role nunca é enviada ao navegador.
  return supabase.functions.invoke('admin-create-user', {
    body: { email: email.trim().toLowerCase(), password },
  })
}

export async function setEmployeeAccountStatus({ userId, status }) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Configure o Supabase antes de alterar contas.') }
  }
  if (!['ACTIVE', 'BLOCKED', 'DISABLED'].includes(status)) {
    return { data: null, error: new Error('Status de conta inválido.') }
  }
  return supabase.functions.invoke('admin-set-account-status', {
    body: { userId, status },
  })
}
