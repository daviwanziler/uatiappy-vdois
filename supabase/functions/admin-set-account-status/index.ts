import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'
import { authBanDurationForStatus, parseAccountStatusPayload } from '../_shared/validation.ts'

const json = (body: Record<string, unknown>, headers: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })

const logRollbackFailure = (context: Record<string, unknown>) => {
  console.error('admin_account_status_rollback_failed', {
    event: 'ACCOUNT_STATUS_ROLLBACK_FAILED',
    ...context,
  })
}

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

  const { data: actorProfile, error: actorError } = await admin.from('employee_profiles')
    .select('role, account_status').eq('user_id', caller.user.id).maybeSingle()
  if (actorError || actorProfile?.role !== 'ADMINISTRADOR' || actorProfile.account_status !== 'ACTIVE') {
    return json({ error: 'Conta administrativa inativa.' }, headers, 403)
  }

  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    return json({ error: 'Requisição inválida.' }, headers, 400)
  }
  const payload = parseAccountStatusPayload(parsed)
  if (!payload) return json({ error: 'Informe userId válido e status ACTIVE, BLOCKED ou DISABLED.' }, headers, 400)
  const { userId, status } = payload
  if (userId === caller.user.id) return json({ error: 'Não é permitido alterar o próprio status por esta operação.' }, headers, 400)

  const { data: target, error: targetError } = await admin.from('employee_profiles')
    .select('user_id, role, account_status').eq('user_id', userId).maybeSingle()
  if (targetError || !target) return json({ error: 'Funcionário não encontrado.' }, headers, 404)
  if (target.role === 'ADMINISTRADOR') return json({ error: 'O bloqueio de administradores exige procedimento administrativo separado.' }, headers, 403)

  const previousStatus = target.account_status as 'ACTIVE' | 'BLOCKED' | 'DISABLED'
  if (previousStatus === status) {
    return json({ userId, status, message: 'A conta já possui o status solicitado.' }, headers)
  }

  // Change Auth first. If the database update fails, restore the Auth ban state
  // implied by the exact previous profile status instead of assuming ACTIVE.
  if (status === 'ACTIVE') {
    const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
    if (authError) return json({ error: 'Não foi possível reativar a autenticação.' }, headers, 502)
  } else {
    const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
    if (authError) return json({ error: 'Não foi possível bloquear a autenticação.' }, headers, 502)
  }

  const { error: profileError } = await admin.from('employee_profiles')
    .update({ account_status: status, updated_at: new Date().toISOString() }).eq('user_id', userId)

  if (profileError) {
    const restoreBan = authBanDurationForStatus(previousStatus)
    const { error: rollbackError } = await admin.auth.admin.updateUserById(userId, { ban_duration: restoreBan })
    if (rollbackError) {
      logRollbackFailure({
        userId,
        previousStatus,
        requestedStatus: status,
        profileErrorCode: profileError.code ?? 'UNKNOWN',
        rollbackErrorCode: rollbackError.code ?? 'UNKNOWN',
      })
      return json({
        error: 'Não foi possível confirmar o estado final da conta. A operação exige reconciliação administrativa.',
        reconciliationRequired: true,
      }, headers, 500)
    }
    return json({ error: 'A alteração do status falhou; a autenticação foi restaurada ao estado anterior.' }, headers, 500)
  }

  return json({ userId, status, message: 'Status atualizado. As políticas RLS também bloqueiam sessões antigas.' }, headers)
})
