import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'

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

  let payload: { userId?: string; status?: string }
  try { payload = await request.json() } catch { return json({ error: 'Requisição inválida.' }, headers, 400) }
  const userId = String(payload.userId ?? '')
  const status = String(payload.status ?? '')
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return json({ error: 'Identificador de usuário inválido.' }, headers, 400)
  }
  if (!['ACTIVE', 'BLOCKED', 'DISABLED'].includes(status)) {
    return json({ error: 'Status deve ser ACTIVE, BLOCKED ou DISABLED.' }, headers, 400)
  }
  if (userId === caller.user.id) return json({ error: 'Não é permitido alterar o próprio status por esta operação.' }, headers, 400)

  const { data: target, error: targetError } = await admin.from('employee_profiles')
    .select('user_id, role').eq('user_id', userId).maybeSingle()
  if (targetError || !target) return json({ error: 'Funcionário não encontrado.' }, headers, 404)
  if (target.role === 'ADMINISTRADOR') return json({ error: 'O bloqueio de administradores exige procedimento administrativo separado.' }, headers, 403)

  if (status === 'ACTIVE') {
    const { error: unbanError } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
    if (unbanError) return json({ error: 'Não foi possível reativar a autenticação.' }, headers, 502)
    const { error: profileError } = await admin.from('employee_profiles')
      .update({ account_status: 'ACTIVE', updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (profileError) {
      await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
      return json({ error: 'Não foi possível atualizar o status da conta.' }, headers, 500)
    }
  } else {
    const { error: profileError } = await admin.from('employee_profiles')
      .update({ account_status: status, updated_at: new Date().toISOString() }).eq('user_id', userId)
    if (profileError) return json({ error: 'Não foi possível atualizar o status da conta.' }, headers, 500)
    const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
    if (banError) {
      await admin.from('employee_profiles').update({ account_status: 'ACTIVE', updated_at: new Date().toISOString() }).eq('user_id', userId)
      return json({ error: 'O status foi revertido porque não foi possível revogar a autenticação.' }, headers, 502)
    }
  }

  return json({ userId, status, message: 'Status atualizado. As políticas RLS também bloqueiam sessões antigas.' }, headers)
})
