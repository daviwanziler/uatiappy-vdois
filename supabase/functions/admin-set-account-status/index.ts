import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'
import { parseAccountStatusPayload } from '../_shared/account-status.ts'

const json = (body: Record<string, unknown>, headers: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })

Deno.serve(async (request) => {
  const { headers, allowed } = corsHeadersFor(request)
  if (!allowed) return new Response('Origem não permitida.', { status: 403, headers: { Vary: 'Origin' } })
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, headers, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Não autenticado.' }, headers, 401)

  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anonKey || !serviceRoleKey) return json({ error: 'Serviço não configurado.' }, headers, 500)

  const callerClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: caller, error: authError } = await callerClient.auth.getUser(authorization.slice(7))
  if (authError || !caller.user) return json({ error: 'Sessão inválida.' }, headers, 401)

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  if (caller.user.app_metadata?.role !== 'ADMINISTRADOR') return json({ error: 'Ação exclusiva de Administradores.' }, headers, 403)

  const { data: actorProfile } = await admin.from('employee_profiles')
    .select('role, account_status').eq('user_id', caller.user.id).maybeSingle()
  if (actorProfile?.role !== 'ADMINISTRADOR' || actorProfile.account_status !== 'ACTIVE') {
    return json({ error: 'Conta administrativa inativa.' }, headers, 403)
  }

  let rawPayload: unknown
  try {
    rawPayload = await request.json()
  } catch {
    return json({ error: 'Requisição inválida.' }, headers, 400)
  }
  const payload = parseAccountStatusPayload(rawPayload)
  if (!payload) return json({ error: 'Informe um userId válido e um status permitido.' }, headers, 400)
  const { userId, status } = payload

  if (userId === caller.user.id) return json({ error: 'Não é permitido alterar o próprio status por esta operação.' }, headers, 400)

  const { data: target, error: targetError } = await admin.from('employee_profiles')
    .select('user_id, role, account_status').eq('user_id', userId).maybeSingle()
  if (targetError || !target) return json({ error: 'Funcionário não encontrado.' }, headers, 404)
  if (target.role === 'ADMINISTRADOR') return json({ error: 'O bloqueio de administradores exige procedimento administrativo separado.' }, headers, 403)

  if (status === 'ACTIVE') {
    const { error: unbanError } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
    if (unbanError) return json({ error: 'Não foi possível reativar a autenticação.' }, headers, 502)
    const { error: profileError } = await admin.from('employee_profiles')
      .update({ account_status: 'ACTIVE', updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (profileError) {
      const { error: rollbackAuthError } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
      if (rollbackAuthError) {
        console.error('account_status_auth_rollback_failed', { userId, code: rollbackAuthError.code })
        return json({ error: 'Falha ao atualizar e ao restaurar o bloqueio no Auth. A conta exige reconciliação administrativa.' }, headers, 500)
      }
      return json({ error: 'Não foi possível atualizar o status da conta; o bloqueio de autenticação foi restaurado.' }, headers, 500)
    }
  } else {
    const { error: profileError } = await admin.from('employee_profiles')
      .update({ account_status: status, updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (profileError) return json({ error: 'Não foi possível atualizar o status da conta.' }, headers, 500)
    const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
    if (banError) {
      const { error: rollbackProfileError } = await admin.from('employee_profiles')
        .update({ account_status: target.account_status, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      if (rollbackProfileError) {
        console.error('account_status_profile_rollback_failed', {
          userId,
          previousStatus: target.account_status,
          code: rollbackProfileError.code,
        })
        return json({ error: 'Falha ao bloquear no Auth e ao restaurar o status anterior no banco. A conta exige reconciliação administrativa.' }, headers, 500)
      }
      return json({ error: 'O status anterior foi restaurado porque não foi possível revogar a autenticação.' }, headers, 502)
    }
  }

  return json({ userId, status, message: 'Status atualizado. As políticas RLS também bloqueiam sessões antigas.' }, headers)
})
