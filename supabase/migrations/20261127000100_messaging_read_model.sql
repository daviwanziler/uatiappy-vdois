-- Messaging read model for the authenticated employee's direct conversations.
-- Exposes only the other participant's basic display identity and last-message preview.
create or replace function public.get_my_conversations()
returns table (
  conversation_id uuid,
  participant_id uuid,
  participant_name text,
  last_message text,
  last_message_at timestamptz,
  activity_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    peer.user_id,
    coalesce(nullif(btrim(peer.display_name), ''), 'Participante'),
    latest.body,
    latest.created_at,
    coalesce(latest.created_at, c.created_at)
  from public.conversations c
  join public.conversation_participants mine
    on mine.conversation_id = c.id and mine.user_id = (select auth.uid())
  join lateral (
    select cp.user_id
    from public.conversation_participants cp
    where cp.conversation_id = c.id
      and cp.user_id <> (select auth.uid())
    limit 1
  ) other_user on true
  join public.employee_profiles peer on peer.user_id = other_user.user_id
  left join lateral (
    select m.body, m.created_at
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc, m.id desc
    limit 1
  ) latest on true
  where public.is_active_employee()
    and (select count(*) from public.conversation_participants cp
         where cp.conversation_id = c.id) = 2
  order by coalesce(latest.created_at, c.created_at) desc, c.id desc;
$$;

revoke all on function public.get_my_conversations() from public, anon;
grant execute on function public.get_my_conversations() to authenticated;

comment on function public.get_my_conversations() is
  'Returns only the authenticated active employee direct conversations, peer display name and last-message preview.';
