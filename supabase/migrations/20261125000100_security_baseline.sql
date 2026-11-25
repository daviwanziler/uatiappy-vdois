-- UatiAppy security baseline: account lifecycle, direct messages, RLS and audit/rate limit.
-- Apply with: supabase db push (after linking the intended Supabase project).

create extension if not exists pgcrypto;

create table if not exists public.employee_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'FUNCIONARIO' check (role in ('ADMINISTRADOR', 'FUNCIONARIO')),
  account_status text not null default 'ACTIVE' check (account_status in ('ACTIVE', 'BLOCKED', 'DISABLED')),
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
begin
  insert into public.employee_profiles(user_id, email, role)
  values (
    new.id,
    new.email,
    case when new.raw_app_meta_data ->> 'role' = 'ADMINISTRADOR'
      then 'ADMINISTRADOR' else 'FUNCIONARIO' end
  )
  on conflict (user_id) do update
    set email = excluded.email,
        role = case
          when new.raw_app_meta_data ->> 'role' = 'ADMINISTRADOR' then 'ADMINISTRADOR'
          else 'FUNCIONARIO'
        end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
after insert or update of email, raw_app_meta_data on auth.users
for each row execute function public.sync_employee_profile();

insert into public.employee_profiles(user_id, email, role)
select id, email,
  case when raw_app_meta_data ->> 'role' = 'ADMINISTRADOR'
    then 'ADMINISTRADOR' else 'FUNCIONARIO' end
from auth.users
on conflict (user_id) do update set email = excluded.email;

create or replace function public.is_active_employee()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.employee_profiles p
    where p.user_id = (select auth.uid())
      and p.account_status = 'ACTIVE'
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMINISTRADOR', false)
    and exists (
      select 1 from public.employee_profiles p
      where p.user_id = (select auth.uid())
        and p.account_status = 'ACTIVE'
        and p.role = 'ADMINISTRADOR'
    );
$$;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists conversation_participants_user_idx
  on public.conversation_participants(user_id, conversation_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at desc);

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_active_employee() and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = (select auth.uid())
  );
$$;

create or replace function public.create_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation_id uuid;
begin
  if auth.uid() is null or not public.is_active_employee() then
    raise exception 'Conta sem permissão para criar conversa.' using errcode = '42501';
  end if;
  if p_other_user_id = auth.uid() then
    raise exception 'Não é possível criar conversa consigo mesmo.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.employee_profiles
    where user_id = p_other_user_id and account_status = 'ACTIVE'
  ) then
    raise exception 'Destinatário inexistente ou inativo.' using errcode = '22023';
  end if;

  insert into public.conversations(created_by) values (auth.uid())
  returning id into v_conversation_id;

  insert into public.conversation_participants(conversation_id, user_id)
  values (v_conversation_id, auth.uid()), (v_conversation_id, p_other_user_id);

  return v_conversation_id;
end;
$$;

alter table public.employee_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Remove permissive policies before installing the known policy set.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('employee_profiles', 'conversations', 'conversation_participants', 'messages')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "active users read active directory"
on public.employee_profiles for select to authenticated
using (
  public.is_active_employee()
  and (account_status = 'ACTIVE' or public.is_active_admin())
);

create policy "participants read own conversations"
on public.conversations for select to authenticated
using (public.is_conversation_member(id));

create policy "active users create own conversations"
on public.conversations for insert to authenticated
with check (public.is_active_employee() and created_by = (select auth.uid()));

create policy "participants read participant list"
on public.conversation_participants for select to authenticated
using (public.is_conversation_member(conversation_id));

create policy "participants read messages"
on public.messages for select to authenticated
using (public.is_conversation_member(conversation_id));

create policy "active participants send as themselves"
on public.messages for insert to authenticated
with check (
  public.is_active_employee()
  and sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);

revoke all on public.employee_profiles, public.conversations,
  public.conversation_participants, public.messages from anon;
grant select on public.employee_profiles, public.conversations,
  public.conversation_participants, public.messages to authenticated;
grant insert on public.conversations, public.messages to authenticated;

revoke all on function public.sync_employee_profile() from public, anon, authenticated;
revoke all on function public.is_active_employee() from public, anon;
revoke all on function public.is_active_admin() from public, anon;
revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_active_employee() to authenticated;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
revoke all on function public.create_direct_conversation(uuid) from public, anon;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

-- Privileged audit trail: no passwords, tokens, or raw secrets are stored.
create table if not exists public.employee_creation_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  email_sha256 text,
  outcome text not null check (outcome in ('PENDING', 'SUCCESS', 'FAILURE', 'RATE_LIMITED', 'UNAUTHORIZED')),
  detail_code text,
  created_at timestamptz not null default now()
);
create index if not exists employee_creation_audit_actor_time_idx
  on public.employee_creation_audit(actor_id, created_at desc);

alter table public.employee_creation_audit enable row level security;
revoke all on public.employee_creation_audit from anon, authenticated, public;

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
    and outcome in ('PENDING', 'SUCCESS', 'FAILURE', 'RATE_LIMITED');

  if v_count >= p_max_attempts then
    insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
    values (p_actor_id, p_email_sha256, 'RATE_LIMITED', 'HOURLY_LIMIT')
    returning id into v_id;
    return query select false, v_id,
      greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::integer);
    return;
  end if;

  insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
  values (p_actor_id, p_email_sha256, 'PENDING', 'REQUEST_RECEIVED')
  returning id into v_id;
  return query select true, v_id, 0;
end;
$$;

create or replace function public.finish_employee_creation_attempt(
  p_attempt_id uuid,
  p_outcome text,
  p_detail_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_outcome not in ('SUCCESS', 'FAILURE', 'UNAUTHORIZED') then
    raise exception 'Resultado inválido.';
  end if;
  update public.employee_creation_audit
    set outcome = p_outcome, detail_code = left(p_detail_code, 80)
  where id = p_attempt_id and outcome = 'PENDING';
end;
$$;

revoke all on function public.reserve_employee_creation_attempt(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.finish_employee_creation_attempt(uuid, text, text) from public, anon, authenticated;
grant execute on function public.reserve_employee_creation_attempt(uuid, text, integer) to service_role;
grant execute on function public.finish_employee_creation_attempt(uuid, text, text) to service_role;
