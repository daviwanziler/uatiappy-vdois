-- Complete database schema required by the direct-message MVP and RLS tests.
-- Additive migration for a clean local Supabase database.

create extension if not exists pgcrypto;

create table if not exists public.employee_creation_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  email_sha256 text,
  outcome text not null default 'PENDING'
    check (outcome in ('PENDING','SUCCESS','FAILURE','UNAUTHORIZED','VALIDATION_FAILURE','RATE_LIMITED')),
  detail_code text not null default 'REQUEST_RECEIVED',
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists employee_creation_audit_actor_created_idx on public.employee_creation_audit(actor_id, created_at desc);
create index if not exists employee_creation_audit_created_idx on public.employee_creation_audit(created_at);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.employee_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.employee_profiles(user_id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists conversation_participants_user_idx on public.conversation_participants(user_id, conversation_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.employee_profiles(user_id) on delete restrict,
  body text not null check (length(trim(body)) between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);

create or replace function public.is_active_employee()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.employee_profiles p
    where p.user_id = (select auth.uid()) and p.account_status = 'ACTIVE'
  );
$$;

create or replace function public.is_active_administrator()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.employee_profiles p
    where p.user_id = (select auth.uid())
      and p.role = 'ADMINISTRADOR' and p.account_status = 'ACTIVE'
  );
$$;

create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id and cp.user_id = (select auth.uid())
  );
$$;

create or replace function public.create_direct_conversation(p_other_user_id uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_conversation_id uuid;
  v_low uuid;
  v_high uuid;
begin
  if v_actor is null or not public.is_active_employee() then
    raise exception 'Conta ativa obrigatória.' using errcode = '42501';
  end if;
  if p_other_user_id is null or p_other_user_id = v_actor then
    raise exception 'Participante inválido.';
  end if;
  if not exists (
    select 1 from public.employee_profiles
    where user_id = p_other_user_id and account_status = 'ACTIVE'
  ) then
    raise exception 'O participante não está ativo.' using errcode = '42501';
  end if;

  v_low := least(v_actor, p_other_user_id);
  v_high := greatest(v_actor, p_other_user_id);
  perform pg_advisory_xact_lock(hashtextextended(v_low::text || ':' || v_high::text, 1));

  select c.id into v_conversation_id
  from public.conversations c
  where (select count(*) from public.conversation_participants cp where cp.conversation_id = c.id) = 2
    and exists (select 1 from public.conversation_participants cp where cp.conversation_id = c.id and cp.user_id = v_actor)
    and exists (select 1 from public.conversation_participants cp where cp.conversation_id = c.id and cp.user_id = p_other_user_id)
  order by c.created_at limit 1;

  if v_conversation_id is not null then return v_conversation_id; end if;

  insert into public.conversations(created_by) values (v_actor) returning id into v_conversation_id;
  insert into public.conversation_participants(conversation_id, user_id)
  values (v_conversation_id, v_actor), (v_conversation_id, p_other_user_id);
  return v_conversation_id;
end;
$$;

create or replace function public.reserve_employee_creation_attempt(
  p_actor_id uuid, p_email_sha256 text default null, p_max_attempts integer default 5
)
returns table(allowed boolean, attempt_id uuid, retry_after_seconds integer)
language plpgsql security definer set search_path = ''
as $$
declare v_count integer; v_oldest timestamptz; v_id uuid;
begin
  if p_max_attempts < 1 or p_max_attempts > 20 or p_actor_id is null then
    raise exception 'Parâmetros de limite inválidos.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 0));
  select count(*), min(created_at) into v_count, v_oldest
  from public.employee_creation_audit
  where actor_id = p_actor_id and created_at > now() - interval '1 hour'
    and outcome in ('PENDING','SUCCESS','FAILURE','UNAUTHORIZED','VALIDATION_FAILURE');
  if v_count >= p_max_attempts then
    return query select false, null::uuid,
      greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::integer);
    return;
  end if;
  insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
  values (p_actor_id, p_email_sha256, 'PENDING', 'REQUEST_RECEIVED') returning id into v_id;
  return query select true, v_id, 0;
end;
$$;

create or replace function public.set_employee_creation_email_hash(p_attempt_id uuid, p_email_sha256 text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_email_sha256 is null or p_email_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'Hash SHA-256 inválido.'; end if;
  update public.employee_creation_audit set email_sha256 = p_email_sha256
  where id = p_attempt_id and outcome = 'PENDING';
  if not found then raise exception 'Tentativa pendente não encontrada.'; end if;
end;
$$;

create or replace function public.finish_employee_creation_attempt(p_attempt_id uuid, p_outcome text, p_detail_code text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_outcome not in ('SUCCESS','FAILURE','UNAUTHORIZED','VALIDATION_FAILURE') then raise exception 'Resultado final inválido.'; end if;
  update public.employee_creation_audit
  set outcome = p_outcome, detail_code = left(coalesce(p_detail_code, 'UNSPECIFIED'), 64), finished_at = now()
  where id = p_attempt_id and outcome = 'PENDING';
  if not found then raise exception 'Tentativa pendente não encontrada ou já finalizada.'; end if;
end;
$$;

alter table public.employee_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.employee_creation_audit enable row level security;

drop policy if exists employee_profiles_read_self_or_admin on public.employee_profiles;
create policy employee_profiles_read_self_or_admin on public.employee_profiles for select to authenticated
using (user_id = (select auth.uid()) or public.is_active_administrator());

drop policy if exists conversations_read_participants on public.conversations;
create policy conversations_read_participants on public.conversations for select to authenticated
using (public.is_active_employee() and public.is_conversation_participant(id));

drop policy if exists participants_read_members on public.conversation_participants;
create policy participants_read_members on public.conversation_participants for select to authenticated
using (public.is_active_employee() and public.is_conversation_participant(conversation_id));

drop policy if exists messages_read_participants on public.messages;
create policy messages_read_participants on public.messages for select to authenticated
using (public.is_active_employee() and public.is_conversation_participant(conversation_id));

drop policy if exists messages_insert_participants on public.messages;
create policy messages_insert_participants on public.messages for insert to authenticated
with check (public.is_active_employee() and sender_id = (select auth.uid()) and public.is_conversation_participant(conversation_id));

revoke all on public.employee_creation_audit from public, anon, authenticated;
grant select on public.employee_profiles, public.conversations, public.conversation_participants, public.messages to authenticated;
grant insert on public.messages to authenticated;
grant select, insert, update on public.employee_profiles to service_role;
grant select, insert, update, delete on public.employee_creation_audit to service_role;

revoke all on function public.is_active_employee() from public, anon;
revoke all on function public.is_active_administrator() from public, anon;
revoke all on function public.is_conversation_participant(uuid) from public, anon;
revoke all on function public.create_direct_conversation(uuid) from public, anon;
revoke all on function public.reserve_employee_creation_attempt(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.set_employee_creation_email_hash(uuid, text) from public, anon, authenticated;
revoke all on function public.finish_employee_creation_attempt(uuid, text, text) from public, anon, authenticated;
grant execute on function public.is_active_employee() to authenticated, service_role;
grant execute on function public.is_active_administrator() to authenticated, service_role;
grant execute on function public.is_conversation_participant(uuid) to authenticated, service_role;
grant execute on function public.create_direct_conversation(uuid) to authenticated;
grant execute on function public.reserve_employee_creation_attempt(uuid, text, integer) to service_role;
grant execute on function public.set_employee_creation_email_hash(uuid, text) to service_role;
grant execute on function public.finish_employee_creation_attempt(uuid, text, text) to service_role;
revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role;
