-- Reconcile Auth account creation with the durable audit trail.
alter table public.employee_creation_audit
  add column if not exists account_user_id uuid references auth.users(id) on delete set null;

create index if not exists employee_creation_audit_pending_email_idx
  on public.employee_creation_audit(email_sha256, created_at)
  where outcome = 'PENDING';

create or replace function public.reconcile_employee_creation_by_email_hash(p_email_sha256 text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $reconcile$
declare
  v_user_id uuid;
begin
  if p_email_sha256 is null or p_email_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'Hash SHA-256 inválido.';
  end if;

  -- A match is valid only when a prior, stale reservation predates the Auth account.
  -- A fresh reservation for an already-existing email must never be marked successful.
  with candidate as (
    select a.id, u.id as user_id
    from public.employee_creation_audit a
    join auth.users u
      on encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = a.email_sha256
    where a.email_sha256 = p_email_sha256
      and a.outcome = 'PENDING'
      and a.account_user_id is null
      and a.created_at < now() - interval '15 minutes'
      and u.created_at >= a.created_at
      and u.raw_app_meta_data ->> 'provisioned_by_admin' = 'true'
      and u.raw_app_meta_data ->> 'role' = 'FUNCIONARIO'
    order by a.created_at
    limit 1
    for update of a
  )
  update public.employee_creation_audit a
  set account_user_id = candidate.user_id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED_AUDIT_RECONCILED',
      finished_at = coalesce(a.finished_at, now())
  from candidate
  where a.id = candidate.id
  returning candidate.user_id into v_user_id;

  return v_user_id;
end;
$reconcile$;

create or replace function public.record_employee_creation_account(
  p_attempt_id uuid,
  p_account_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $record$
begin
  if p_attempt_id is null or p_account_user_id is null then
    raise exception 'Identificadores obrigatórios.';
  end if;

  update public.employee_creation_audit a
  set account_user_id = p_account_user_id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED',
      finished_at = now()
  where a.id = p_attempt_id
    and a.outcome = 'PENDING'
    and exists (
      select 1 from auth.users u
      where u.id = p_account_user_id
        and encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = a.email_sha256
        and u.raw_app_meta_data ->> 'provisioned_by_admin' = 'true'
        and u.raw_app_meta_data ->> 'role' = 'FUNCIONARIO'
    );

  if not found then
    if exists (
      select 1 from public.employee_creation_audit
      where id = p_attempt_id and account_user_id = p_account_user_id and outcome = 'SUCCESS'
    ) then
      return;
    end if;
    raise exception 'Tentativa pendente não encontrada ou vinculada a outra conta.';
  end if;
end;
$record$;

-- Preserve cleanup observability while reconciling only stale, correlated attempts.
create or replace function public.cleanup_employee_creation_audit()
returns integer
language plpgsql
security definer
set search_path = ''
as $cleanup$
declare
  v_run_id bigint;
  v_pending integer := 0;
  v_rows integer := 0;
  v_deleted integer := 0;
begin
  insert into public.employee_creation_audit_cleanup_runs(status)
  values ('RUNNING')
  returning id into v_run_id;

  begin
    update public.employee_creation_audit a
    set account_user_id = u.id,
        outcome = 'SUCCESS',
        detail_code = 'ACCOUNT_CREATED_AUDIT_RECONCILED',
        finished_at = coalesce(a.finished_at, now())
    from auth.users u
    where a.outcome = 'PENDING'
      and a.account_user_id is null
      and a.created_at < now() - interval '15 minutes'
      and u.created_at >= a.created_at
      and encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = a.email_sha256
      and u.raw_app_meta_data ->> 'provisioned_by_admin' = 'true'
      and u.raw_app_meta_data ->> 'role' = 'FUNCIONARIO';
    get diagnostics v_pending = row_count;

    update public.employee_creation_audit
    set outcome = 'FAILURE',
        detail_code = 'AUDIT_FINALIZATION_TIMEOUT_NO_ACCOUNT',
        finished_at = now()
    where outcome = 'PENDING'
      and created_at < now() - interval '15 minutes'
      and account_user_id is null;
    get diagnostics v_rows = row_count;
    v_pending := v_pending + v_rows;

    delete from public.employee_creation_audit
    where created_at < now() - interval '90 days';
    get diagnostics v_deleted = row_count;

    update public.employee_creation_audit_cleanup_runs
    set finished_at = now(),
        pending_finalized = v_pending,
        records_deleted = v_deleted,
        status = 'SUCCESS'
    where id = v_run_id;
  exception when others then
    update public.employee_creation_audit_cleanup_runs
    set finished_at = now(),
        status = 'FAILURE',
        error_message = left(sqlstate || ': ' || sqlerrm, 1000)
    where id = v_run_id;
    raise;
  end;

  return v_deleted;
end;
$cleanup$;

revoke all on function public.reconcile_employee_creation_by_email_hash(text) from public, anon, authenticated;
revoke all on function public.record_employee_creation_account(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reconcile_employee_creation_by_email_hash(text) to service_role;
grant execute on function public.record_employee_creation_account(uuid, uuid) to service_role;
revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role, postgres;
