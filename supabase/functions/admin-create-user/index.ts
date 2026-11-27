import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeadersFor } from '../_shared/cors.ts'
import { validateEmployeeProvision } from '../_shared/validation.ts'
import { sha256Email } from '../_shared/audit.ts'
import { finalizeCreatedAccount } from '../_shared/provisioning.ts'

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

  // Reserve the actor's attempt before role checks so unauthorized calls are rate-limited.
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
  let accountCreated = false
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

    // Only an older pending reservation can prove that a prior request created this account.
    const { data: recoveredUserId, error: reconcileError } = await adminClient.rpc(
      'reconcile_employee_creation_by_email_hash',
      { p_email_sha256: emailHash },
    )
    if (reconcileError) {
      console.error('employee_creation_reconciliation_check_failed', {
        attemptId: reservation.attempt_id,
        code: reconcileError.code,
      })
      await finishAttempt('FAILURE', 'RECONCILIATION_CHECK_FAILED')
      return json({ error: 'Não foi possível verificar com segurança se a conta já existe. Tente novamente mais tarde.' }, headers, 503)
    }
    if (recoveredUserId) {
      await finishAttempt('FAILURE', 'DUPLICATE_ACCOUNT_RECONCILED')
      return json({
        error: 'Já existe uma conta para este e-mail. A auditoria da tentativa anterior foi reconciliada; nenhuma conta duplicada foi criada.',
        id: recoveredUserId,
        auditReconciled: true,
      }, headers, 409)
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'FUNCIONARIO', provisioned_by_admin: true },
    })

    if (error) {
      await finishAttempt('FAILURE', 'AUTH_CREATE_FAILED')
      return json({ error: 'Não foi possível criar a conta. Verifique se o e-mail já está em uso.' }, headers, 409)
    }

    accountCreated = true
    const auditResult = await finalizeCreatedAccount(async () => {
      const { error } = await adminClient.rpc('record_employee_creation_account', {
        p_attempt_id: reservation.attempt_id,
        p_account_user_id: data.user.id,
      })
      if (error) console.error('employee_created_audit_reconciliation_required', {
        attemptId: reservation.attempt_id,
        accountUserId: data.user.id,
        code: error.code,
      })
      return { error }
    })
    if (auditResult.auditStatus === 'PENDING_RECONCILIATION') {
      return json({
        id: data.user.id,
        email: data.user.email,
        auditStatus: auditResult.auditStatus,
        message: 'A conta foi criada. O registro de auditoria será reconciliado automaticamente. Não tente criar novamente.',
      }, headers, 202)
    }
    attemptFinished = true
    return json({ id: data.user.id, email: data.user.email, auditStatus: 'SUCCESS' }, headers, 201)
  } catch (error) {
    console.error('employee_creation_unexpected_failure', {
      attemptId: reservation.attempt_id,
      message: error instanceof Error ? error.message : 'unknown_error',
    })
    if (!attemptFinished && !accountCreated) {
      try {
        await finishAttempt('FAILURE', 'UNEXPECTED_ERROR')
      } catch (finalizeError) {
        console.error('employee_creation_pending_attempt_requires_alert', {
          attemptId: reservation.attempt_id,
          message: finalizeError instanceof Error ? finalizeError.message : 'unknown_finalize_error',
        })
      }
    } else if (!attemptFinished && accountCreated) {
      console.error('employee_created_but_audit_finalize_failed', { attemptId: reservation.attempt_id })
    }
    if (accountCreated) {
      return json({
        id: undefined,
        auditStatus: 'PENDING_RECONCILIATION',
        message: 'A conta foi criada, mas a confirmação da auditoria está pendente. Não tente criar novamente; a reconciliação automática verificará a conta.',
      }, headers, 202)
    }
    return json({ error: 'Não foi possível concluir o cadastro com segurança.' }, headers, 500)
  }
})
