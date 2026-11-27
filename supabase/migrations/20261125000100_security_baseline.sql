-- UatiAppy security baseline: account lifecycle, direct messages, RLS and audit/rate limit.
-- Apply with: supabase db push (after linking the intended Supabase project).

create extension if not exists pgcrypto;

create table if not exists public.employee_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'FUNCIONARIO' check (role in ('ADMINISTRADOR', 'FUNCIONARIO')),
  account_status text not null default 'DISABLED' check (account_status in ('ACTIVE', 'BLOCKED', 'DISABLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employee_profiles_status_idx on public.employee_profiles(account_status);
create index if not exists employee_profiles_role_idx on public.employee_profiles(role);

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
  -- raw_app_meta_data is server-managed; user_metadata is intentionally ignored.
  v_trusted_provision := coalesce(new.raw_app_meta_data ->> 'provisioned_by_admin' = 'true', false);
  v_role := case
    when new.raw_app_meta_data ->> 'role' = 'ADMINISTRADOR' then 'ADMINISTRADOR'
    else 'FUNCIONARIO'
  end;
  v_status := case
    when v_trusted_provision then 'ACTIVE'
    else 'DISABLED'
  end;

  insert into public.employee_profiles(user_id, email, role, account_status)
  values (new.id, new.email, v_role, v_status)
  on conflict (user_id) do update
    set email = excluded.email,
        role = excluded.role,
        account_status = case
          -- Do not silently reactivate an existing blocked/disabled account.
          when public.employee_profiles.account_status in ('BLOCKED', 'DISABLED')
            then public.employee_profiles.account_status
          when v_trusted_provision then 'ACTIVE'
          else 'DISABLED'
        end,
        updated_at = now();
  return new;
end;
$$;

-- Retention: keep security audit evidence for 90 days. Invoke daily from a
-- trusted scheduler (Supabase Cron/pg_cron or an external server-side job).
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

revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role;
