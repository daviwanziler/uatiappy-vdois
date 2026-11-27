-- Incremental hardening for environments where the initial security baseline
-- may already have been applied. Safe to run more than once.
alter table public.employee_profiles
  alter column account_status set default 'DISABLED';

create or replace function public.sync_employee_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_trusted_provision boolean;
  v_role text;
  v_status text;
begin
  v_trusted_provision := coalesce(new.raw_app_meta_data ->> 'provisioned_by_admin' = 'true', false);
  v_role := case
    when new.raw_app_meta_data ->> 'role' = 'ADMINISTRADOR' then 'ADMINISTRADOR'
    else 'FUNCIONARIO'
  end;
  v_status := case when v_trusted_provision then 'ACTIVE' else 'DISABLED' end;

  insert into public.employee_profiles(user_id, email, role, account_status)
  values (new.id, new.email, v_role, v_status)
  on conflict (user_id) do update
    set email = excluded.email,
        role = excluded.role,
        account_status = case
          when public.employee_profiles.account_status in ('BLOCKED', 'DISABLED')
            then public.employee_profiles.account_status
          when v_trusted_provision then 'ACTIVE'
          else 'DISABLED'
        end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
after insert or update of email, raw_app_meta_data on auth.users
for each row execute function public.sync_employee_profile();

-- Existing accounts without the server-only marker are not considered provisioned.
update public.employee_profiles p
set account_status = 'DISABLED', updated_at = now()
from auth.users u
where u.id = p.user_id
  and coalesce(u.raw_app_meta_data ->> 'provisioned_by_admin' = 'true', false) = false
  and p.account_status = 'ACTIVE';

create or replace function public.reserve_employee_creation_attempt(
  p_actor_id uuid,
  p_email_sha256 text,
  p_max_attempts integer default 5
)
returns table(allowed boolean, attempt_id uuid, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_oldest timestamptz;
  v_id uuid;
begin
  if p_max_attempts < 1 or p_max_attempts > 20 then
    raise exception 'Limite inválido.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 0));

  select count(*), min(created_at)
    into v_count, v_oldest
  from public.employee_creation_audit
  where actor_id = p_actor_id
    and created_at > now() - interval '1 hour'
    and outcome in ('PENDING', 'SUCCESS', 'FAILURE', 'UNAUTHORIZED');

  if v_count >= p_max_attempts then
    -- Rejected retries are deliberately not written to the audit table.
    return query select false, null::uuid,
      greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::integer);
    return;
  end if;

  insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
  values (p_actor_id, p_email_sha256, 'PENDING', 'REQUEST_RECEIVED')
  returning id into v_id;
  return query select true, v_id, 0;
end;
$$;

create or replace function public.cleanup_employee_creation_audit()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.employee_creation_audit
  where created_at < now() - interval '90 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.sync_employee_profile() from public, anon, authenticated;
revoke all on function public.reserve_employee_creation_attempt(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.reserve_employee_creation_attempt(uuid, text, integer) to service_role;
revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role;
