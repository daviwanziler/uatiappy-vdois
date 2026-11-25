import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'
import { validateEmployeeProvision } from '../_shared/validation.ts'

const json = (body: Record<string, unknown>, headers: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
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

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // Reserve a per-user attempt before authorization checks or any audit write.
  // The actor ID comes only from the verified JWT, never from request payload.
  const actorHash = await sha256(`uatiappy-admin-create:${caller.user.id}`)
  const { data: reservation, error: rateError } = await adminClient.rpc('reserve_employee_creation_attempt', {
    p_actor_id: caller.user.id,
    p_email_sha256: actorHash,
    p_max_attempts: 5,
  }).single()

  if (rateError || !reservation) return json({ error: 'Não foi possível validar o limite de tentativas.' }, headers, 503)
  if (!reservation.allowed) {
    return json({ error: 'Limite de 5 tentativas por hora atingido. Tente novamente mais tarde.' }, {
      ...headers, 'Retry-After': String(reservation.retry_after_seconds),
    }, 429)
  }

  if (caller.user.app_metadata?.role !== 'ADMINISTRADOR') {
    await adminClient.rpc('finish_employee_creation_attempt', {
      p_attempt_id: reservation.attempt_id,
      p_outcome: 'UNAUTHORIZED',
      p_detail_code: 'ROLE_REQUIRED',
    })
    return json({ error: 'Somente Administradores podem cadastrar funcionários.' }, headers, 403)
  }

  const { data: adminProfile, error: profileError } = await adminClient
    .from('employee_profiles')
    .select('role, account_status')
    .eq('user_id', caller.user.id)
    .maybeSingle()
  if (profileError || adminProfile?.role !== 'ADMINISTRADOR' || adminProfile.account_status !== 'ACTIVE') {
    await adminClient.rpc('finish_employee_creation_attempt', {
      p_attempt_id: reservation.attempt_id,
      p_outcome: 'UNAUTHORIZED',
      p_detail_code: 'ADMIN_PROFILE_INACTIVE',
    })
    return json({ error: 'Conta administrativa inativa ou não provisionada.' }, headers, 403)
  }

  let payload: { email?: string; password?: string }
  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Requisição inválida.' }, headers, 400)
  }

  const email = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '')
  const validationError = validateEmployeeProvision(email, password)
  if (validationError) return json({ error: validationError }, headers, 400)

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'FUNCIONARIO', provisioned_by_admin: true },
  })

  await adminClient.rpc('finish_employee_creation_attempt', {
    p_attempt_id: reservation.attempt_id,
    p_outcome: error ? 'FAILURE' : 'SUCCESS',
    p_detail_code: error ? 'AUTH_CREATE_FAILED' : 'ACCOUNT_CREATED',
  })

  if (error) return json({ error: 'Não foi possível criar a conta. Verifique se o e-mail já está em uso.' }, headers, 400)
  return json({ id: data.user.id, email: data.user.email }, headers, 201)
})
