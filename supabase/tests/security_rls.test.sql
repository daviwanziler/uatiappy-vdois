-- Run with: supabase test db
-- This integration test creates disposable auth users and rolls everything back.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(6);

\set user_a 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
\set user_b 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
\set blocked_user 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
\set conversation_a 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
\set conversation_b 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'

insert into auth.users(id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, created_at, updated_at)
values
  (:'user_a', 'authenticated', 'authenticated', 'a@uatiappy.test', '', now(), '{"provider":"email","providers":["email"],"role":"FUNCIONARIO"}', now(), now()),
  (:'user_b', 'authenticated', 'authenticated', 'b@uatiappy.test', '', now(), '{"provider":"email","providers":["email"],"role":"FUNCIONARIO"}', now(), now()),
  (:'blocked_user', 'authenticated', 'authenticated', 'blocked@uatiappy.test', '', now(), '{"provider":"email","providers":["email"],"role":"FUNCIONARIO"}', now(), now());

insert into public.conversations(id, created_by) values
  (:'conversation_a', :'user_a'), (:'conversation_b', :'user_b');
insert into public.conversation_participants(conversation_id, user_id) values
  (:'conversation_a', :'user_a'), (:'conversation_a', :'user_b'),
  (:'conversation_b', :'user_b'), (:'conversation_b', :'blocked_user');
insert into public.messages(conversation_id, sender_id, body) values
  (:'conversation_a', :'user_a', 'mensagem privada A'),
  (:'conversation_b', :'user_b', 'mensagem privada B');

-- User A is a participant only in conversation A.
select set_config('request.jwt.claim.sub', :'user_a', true);
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', :'user_a', 'role', 'authenticated',
  'app_metadata', jsonb_build_object('role', 'FUNCIONARIO')
)::text, true);
set local role authenticated;
select extensions.is((select count(*)::int from public.messages), 1, 'user A sees only messages from conversations they participate in');
select extensions.throws_ok(
  $$insert into public.messages(conversation_id, sender_id, body)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'forbidden')$$,
  '42501', null, 'user A cannot send a message to a conversation they do not participate in'
);
reset role;

-- User B can read conversation B, but cannot escalate their own profile role.
select set_config('request.jwt.claim.sub', :'user_b', true);
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', :'user_b', 'role', 'authenticated',
  'app_metadata', jsonb_build_object('role', 'FUNCIONARIO')
)::text, true);
set local role authenticated;
select extensions.is((select count(*)::int from public.messages), 2, 'user B sees only the two conversations they participate in');
select extensions.throws_ok(
  $$update public.employee_profiles set role = 'ADMINISTRADOR'
    where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  '42501', null, 'employee cannot promote their own role'
);
reset role;

-- A blocked account with a still-present JWT loses access immediately through RLS.
update public.employee_profiles set account_status = 'BLOCKED'
where user_id = :'blocked_user';
select set_config('request.jwt.claim.sub', :'blocked_user', true);
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', :'blocked_user', 'role', 'authenticated',
  'app_metadata', jsonb_build_object('role', 'FUNCIONARIO')
)::text, true);
set local role authenticated;
select extensions.is((select count(*)::int from public.messages), 0, 'blocked user cannot read messages with an existing JWT');
select extensions.throws_ok(
  $$insert into public.messages(conversation_id, sender_id, body)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'blocked')$$,
  '42501', null, 'blocked user cannot send messages with an existing JWT'
);

reset role;
select * from extensions.finish();
rollback;
