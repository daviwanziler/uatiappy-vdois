-- SQA fixes for Issues #121-#124.
-- Keep historical actor identifiers without a destructive FK to auth.users.
alter table public.employee_creation_audit
  drop constraint if exists employee_creation_audit_actor_id_fkey;

-- A retry may reconcile only a distinct older pending attempt, correlated to an
-- Auth account created during that attempt. An existing account by itself is a duplicate.
drop function if exists public.reconcile_employee_creation_by_email_hash(text);
create function public.reconcile_employee_creation_by_email_hash(
  p_attempt_id uuid,
  p_email_sha256 text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $reconcile$
declare
  v_user_id uuid;
  v_current_created_at timestamptz;
  v_pending_id uuid;
  v_pending_created_at timestamptz;
begin
  if p_attempt_id is null or p_email_sha256 is null or p_email_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'Parâmetros de reconciliação inválidos.';
  end if;

  select created_at into v_current_created_at
  from public.employee_creation_audit
  where id = p_attempt_id and outcome = 'PENDING' and email_sha256 = p_email_sha256;
  if v_current_created_at is null then
    raise exception 'Tentativa atual pendente não encontrada.';
  end if;

  select u.id into v_user_id
  from auth.users u
  where encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = p_email_sha256
  order by u.created_at desc
  limit 1;

  if v_user_id is null then
    return jsonb_build_object('status', 'NOT_FOUND');
  end if;

  select a.id, a.created_at into v_pending_id, v_pending_created_at
  from public.employee_creation_audit a
  join auth.users u on u.id = v_user_id
  where a.id <> p_attempt_id
    and a.email_sha256 = p_email_sha256
    and a.outcome = 'PENDING'
    and a.account_user_id is null
    and a.created_at < v_current_created_at
    and u.created_at >= a.created_at
    and u.created_at <= v_current_created_at + interval '2 seconds'
    and u.raw_app_meta_data ->> 'provisioned_by_admin' = 'true'
    and u.raw_app_meta_data ->> 'role' = 'FUNCIONARIO'
  order by a.created_at
  limit 1
  for update of a;

  if v_pending_id is null then
    update public.employee_creation_audit
    set outcome = 'FAILURE', detail_code = 'DUPLICATE_EMAIL', finished_at = now()
    where id = p_attempt_id and outcome = 'PENDING';
    return jsonb_build_object('status', 'DUPLICATE');
  end if;

  update public.employee_creation_audit
  set account_user_id = v_user_id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED_AUDIT_RECONCILED',
      finished_at = coalesce(finished_at, now())
  where id = v_pending_id and outcome = 'PENDING';

  update public.employee_creation_audit
  set outcome = 'FAILURE', detail_code = 'RETRY_RECONCILED_PREVIOUS_ATTEMPT', finished_at = now()
  where id = p_attempt_id and outcome = 'PENDING';

  return jsonb_build_object('status', 'RECOVERED', 'user_id', v_user_id, 'attempt_id', v_pending_id);
end;
$reconcile$;

revoke all on function public.reconcile_employee_creation_by_email_hash(uuid, text) from public, anon, authenticated;
grant execute on function public.reconcile_employee_creation_by_email_hash(uuid, text) to service_role;

-- Restore cleanup observability after migration 005 replaced the instrumented
-- function from migration 004. The RUNNING row is outside the exception block,
-- so it survives a failed cleanup transaction.
create or replace function public.cleanup_employee_creation_audit()
returns integer
language plpgsql
security definer
set search_path = ''
as $cleanup$
declare
  v_run_id bigint;
  v_pending integer := 0;
  v_deleted integer := 0;
begin
  insert into public.employee_creation_audit_cleanup_runs(status)
  values ('RUNNING')
  returning id into v_run_id;

  begin
    update public.employee_creation_audit
    set outcome = 'FAILURE',
        detail_code = 'AUDIT_FINALIZATION_TIMEOUT',
        finished_at = now()
    where outcome = 'PENDING'
      and created_at < now() - interval '15 minutes';
    get diagnostics v_pending = row_count;

    delete from public.employee_creation_audit
    where created_at < now() - interval '90 days';
    get diagnostics v_deleted = row_count;

    update public.employee_creation_audit_cleanup_runs
    set finished_at = now(),
        pending_finalized = v_pending,
        records_deleted = v_deleted,
        status = 'SUCCESS',
        error_message = null
    where id = v_run_id;
  exception when others then
    update public.employee_creation_audit_cleanup_runs
    set finished_at = now(),
        status = 'FAILURE',
        error_message = left('SQLSTATE=' || sqlstate || '; rotina de limpeza falhou', 1000)
    where id = v_run_id;
    -- Returning a sentinel keeps the failure record committed; re-raising would
    -- roll back the entire function statement, including its observability row.
    return -1;
  end;

  return v_deleted;
end;
$cleanup$;

revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role, postgres;
