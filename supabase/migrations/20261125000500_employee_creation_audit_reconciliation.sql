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

  select u.id into v_user_id
  from auth.users u
  where encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = p_email_sha256
  order by u.created_at desc
  limit 1;

  if v_user_id is null then
    return null;
  end if;

  update public.employee_creation_audit
  set account_user_id = v_user_id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED_AUDIT_RECONCILED',
      finished_at = coalesce(finished_at, now())
  where email_sha256 = p_email_sha256
    and outcome = 'PENDING';

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

  update public.employee_creation_audit
  set account_user_id = p_account_user_id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED',
      finished_at = now()
  where id = p_attempt_id
    and outcome = 'PENDING';

  if not found then
    -- Idempotent retry: accept only if this exact attempt already records this user.
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

-- Reconcile real Auth accounts before timing out pending audit reservations.
create or replace function public.cleanup_employee_creation_audit()
returns integer
language plpgsql
security definer
set search_path = ''
as $cleanup$
declare
  v_deleted integer := 0;
begin
  update public.employee_creation_audit a
  set account_user_id = u.id,
      outcome = 'SUCCESS',
      detail_code = 'ACCOUNT_CREATED_AUDIT_RECONCILED',
      finished_at = coalesce(a.finished_at, now())
  from auth.users u
  where a.outcome = 'PENDING'
    and a.email_sha256 is not null
    and encode(extensions.digest(lower(btrim(u.email)), 'sha256'), 'hex') = a.email_sha256;

  update public.employee_creation_audit
  set outcome = 'FAILURE',
      detail_code = 'AUDIT_FINALIZATION_TIMEOUT_NO_ACCOUNT',
      finished_at = now()
  where outcome = 'PENDING'
    and created_at < now() - interval '15 minutes'
    and account_user_id is null;

  delete from public.employee_creation_audit
  where created_at < now() - interval '90 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$cleanup$;

revoke all on function public.reconcile_employee_creation_by_email_hash(text) from public, anon, authenticated;
revoke all on function public.record_employee_creation_account(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reconcile_employee_creation_by_email_hash(text) to service_role;
grant execute on function public.record_employee_creation_account(uuid, uuid) to service_role;
revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role, postgres;
