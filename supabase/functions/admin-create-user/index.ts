import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'
import { validateEmployeeProvision } from '../_shared/validation.ts'
import { sha256Email } from '../_shared/audit.ts'

const json = (body: Record<string, unknown>, headers: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })

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

  // The reservation is made before role checks so unauthorized attempts are rate-limited.
  // The email hash is filled after parsing; the actor identity remains in actor_id.
  const { data: reservation, error: rateError } = await adminClient.rpc('reserve_employee_creation_attempt', {
    p_actor_id: caller.user.id,
    p_email_sha256: null,
    p_max_attempts: 5,
  }).single()

  if (rateError || !reservation) {
    console.error('employee_creation_rate_limit_reservation_failed', { actorId: caller.user.id, code: rateError?.code })
    return json({ error: 'Não foi possível validar o limite de tentativas.' }, headers, 503)
  }
  if (!reservation.allowed) {
    return json({ error: 'Limite de 5 tentativas por hora atingido. Tente novamente mais tarde.' }, {
      ...headers, 'Retry-After': String(reservation.retry_after_seconds),
    }, 429)
  }

  let attemptFinished = false
  const finishAttempt = async (outcome: 'UNAUTHORIZED' | 'VALIDATION_FAILURE' | 'FAILURE' | 'SUCCESS', detailCode: string) => {
    if (attemptFinished) return
    const { error } = await adminClient.rpc('finish_employee_creation_attempt', {
      p_attempt_id: reservation.attempt_id,
      p_outcome: outcome,
      p_detail_code: detailCode,
    })
    if (error) {
      console.error('employee_creation_attempt_finalize_failed', {
        attemptId: reservation.attempt_id,
        outcome,
        code: error.code,
      })
      throw new Error('Não foi possível finalizar o registro de auditoria.')
    }
    attemptFinished = true
  }

  try {
    if (caller.user.app_metadata?.role !== 'ADMINISTRADOR') {
      await finishAttempt('UNAUTHORIZED', 'ROLE_REQUIRED')
      return json({ error: 'Somente Administradores podem cadastrar funcionários.' }, headers, 403)
    }

    const { data: adminProfile, error: profileError } = await adminClient
      .from('employee_profiles')
      .select('role, account_status')
      .eq('user_id', caller.user.id)
      .maybeSingle()
    if (profileError || adminProfile?.role !== 'ADMINISTRADOR' || adminProfile.account_status !== 'ACTIVE') {
      await finishAttempt('UNAUTHORIZED', 'ADMIN_PROFILE_INACTIVE')
      return json({ error: 'Conta administrativa inativa ou não provisionada.' }, headers, 403)
    }

    let payload: { email?: string; password?: string }
    try {
      const parsed: unknown = await request.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_json_shape')
      payload = parsed as { email?: string; password?: string }
    } catch {
      await finishAttempt('VALIDATION_FAILURE', 'INVALID_JSON')
      return json({ error: 'Requisição inválida.' }, headers, 400)
    }

    const email = String(payload.email ?? '').trim().toLowerCase()
    const password = String(payload.password ?? '')
    const validationError = validateEmployeeProvision(email, password)
    if (validationError) {
      await finishAttempt('VALIDATION_FAILURE', 'INVALID_EMPLOYEE_DATA')
      return json({ error: validationError }, headers, 400)
    }

    // Hash the normalized target email; never persist the raw email in the audit table.
    const emailHash = await sha256Email(email)
    const { error: hashError } = await adminClient.rpc('set_employee_creation_email_hash', {
      p_attempt_id: reservation.attempt_id,
      p_email_sha256: emailHash,
    })
    if (hashError) {
      console.error('employee_creation_email_hash_update_failed', {
        attemptId: reservation.attempt_id,
        code: hashError.code,
      })
      await finishAttempt('FAILURE', 'AUDIT_HASH_UPDATE_FAILED')
      return json({ error: 'Não foi possível registrar a auditoria da operação.' }, headers, 500)
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'FUNCIONARIO', provisioned_by_admin: true },
    })

    if (error) {
      await finishAttempt('FAILURE', 'AUTH_CREATE_FAILED')
      return json({ error: 'Não foi possível criar a conta. Verifique se o e-mail já está em uso.' }, headers, 400)
    }

    await finishAttempt('SUCCESS', 'ACCOUNT_CREATED')
    return json({ id: data.user.id, email: data.user.email }, headers, 201)
  } catch (error) {
    console.error('employee_creation_unexpected_failure', {
      attemptId: reservation.attempt_id,
      message: error instanceof Error ? error.message : 'unknown_error',
    })
    if (!attemptFinished) {
      try {
        await finishAttempt('FAILURE', 'UNEXPECTED_ERROR')
      } catch (finalizeError) {
        console.error('employee_creation_pending_attempt_requires_alert', {
          attemptId: reservation.attempt_id,
          message: finalizeError instanceof Error ? finalizeError.message : 'unknown_finalize_error',
        })
      }
    }
    return json({ error: 'Não foi possível concluir o cadastro com segurança.' }, headers, 500)
  }
})
