-- Run with: supabase test db
-- pgTAP plan is 23 assertions. Run only against a disposable local/test Supabase project.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(23);

\set user_a 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
\set user_b 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
\set blocked_user 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
\set unprovisioned_user 'ffffffff-ffff-4fff-8fff-ffffffffffff'
\set conversation_a 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
\set conversation_b 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'

select extensions.ok(
  exists (select 1 from cron.job where jobname = 'uatiappy-cleanup-employee-creation-audit' and schedule = '17 3 * * *'),
  'daily audit cleanup job is installed in Supabase Cron'
);
select extensions.ok(
  not has_function_privilege('authenticated', 'public.cleanup_employee_creation_audit()', 'EXECUTE'),
  'authenticated role cannot execute audit cleanup'
);

-- Only accounts carrying server-managed provisioning metadata become active.
-- raw_user_meta_data is attacker-controlled and deliberately contains a fake role.
insert into auth.users(
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (:'user_a', 'authenticated', 'authenticated', 'a@uatiappy.test', '', now(),
   '{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}', '{}', now(), now()),
  (:'user_b', 'authenticated', 'authenticated', 'b@uatiappy.test', '', now(),
   '{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}', '{}', now(), now()),
  (:'blocked_user', 'authenticated', 'authenticated', 'blocked@uatiappy.test', '', now(),
   '{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}', '{}', now(), now()),
  (:'unprovisioned_user', 'authenticated', 'authenticated', 'unprovisioned@uatiappy.test', '', now(),
   '{"provider":"email","providers":["email"]}', '{"role":"ADMINISTRADOR"}', now(), now());

-- Simulate Auth account creation succeeding while the audit remains pending.
insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
values (
  :'user_a',
  encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex'),
  'PENDING',
  'SIMULATED_AUDIT_FINALIZE_FAILURE'
);
select extensions.is(
  public.reconcile_employee_creation_by_email_hash(encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')),
  :'user_a'::uuid,
  'reconciliation locates the already-created Auth account by normalized email hash'
);
select extensions.is(
  (select outcome from public.employee_creation_audit
   where email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')
   order by created_at desc limit 1),
  'SUCCESS',
  'reconciliation changes the pending audit to SUCCESS'
);
select extensions.is(
  (select account_user_id from public.employee_creation_audit
   where email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')
   order by created_at desc limit 1),
  :'user_a'::uuid,
  'reconciliation stores the created Auth user id for traceability'
);

insert into public.conversations(id, created_by) values
  (:'conversation_a', :'user_a'), (:'conversation_b', :'user_b');
insert into public.conversation_participants(conversation_id, user_id) values
  (:'conversation_a', :'user_a'), (:'conversation_a', :'user_b'),
  (:'conversation_b', :'user_b'), (:'conversation_b', :'blocked_user');
insert into public.messages(conversation_id, sender_id, body) values
  (:'conversation_a', :'user_a', 'mensagem privada A'),
  (:'conversation_b', :'user_b', 'mensagem privada B');

-- Unprovisioned public-signup-like user remains disabled and cannot self-assign a role.
select extensions.is(
  (select account_status from public.employee_profiles where user_id = :'unprovisioned_user'),
  'DISABLED',
  'new user without server provisioning remains disabled'
);
select extensions.is(
  (select role from public.employee_profiles where user_id = :'unprovisioned_user'),
  'FUNCIONARIO',
  'client-controlled user metadata cannot grant administrator role'
);

-- User A sees only conversations where they are a participant.
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
select extensions.throws_ok(
  $$insert into public.conversations(created_by)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$$,
  '42501', null, 'clients cannot create conversations by direct table insert'
);
select extensions.ok(
  public.create_direct_conversation('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is not null,
  'active employee can create a direct conversation only through the validated RPC'
);
reset role;

-- User B can read its two conversations but cannot escalate its own profile role.
select set_config('request.jwt.claim.sub', :'user_b', true);
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', :'user_b', 'role', 'authenticated',
  'app_metadata', jsonb_build_object('role', 'FUNCIONARIO')
)::text, true);
set local role authenticated;
select extensions.is((select count(*)::int from public.messages), 2, 'user B sees only messages from conversations they participate in');
select extensions.ok(
  not has_table_privilege('authenticated', 'public.employee_profiles', 'UPDATE'),
  'authenticated role has no SQL UPDATE privilege on employee_profiles'
);
select extensions.ok(
  not has_table_privilege('anon', 'public.employee_profiles', 'UPDATE'),
  'anon role has no SQL UPDATE privilege on employee_profiles'
);
select extensions.throws_ok(
  $$update public.employee_profiles set role = 'ADMINISTRADOR'
    where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'$$,
  '42501', null, 'direct API update cannot promote employee to administrator'
);
select extensions.is(
  (select role from public.employee_profiles where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  'FUNCIONARIO',
  'employee role remains FUNCIONARIO after privilege escalation attempt'
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

-- A non-admin's first five attempts are audited; further attempts are rejected
-- without inserting additional rows. The actor id is server-derived.
set local role service_role;
do $$
declare
  v_attempt record;
  v_index integer;
  v_first_attempt uuid;
begin
  for v_index in 1..5 loop
    select * into v_attempt
    from public.reserve_employee_creation_attempt(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      null,
      5
    );
    if not v_attempt.allowed then
      raise exception 'Attempt % should be within the limit', v_index;
    end if;
    if v_index = 1 then
      v_first_attempt := v_attempt.attempt_id;
      perform public.set_employee_creation_email_hash(v_first_attempt, encode(digest('employee@example.com', 'sha256'), 'hex'));
    end if;
    perform public.finish_employee_creation_attempt(v_attempt.attempt_id, 'UNAUTHORIZED', 'ROLE_REQUIRED');
  end loop;
end $$;
select extensions.is(
  (select count(*)::int from public.employee_creation_audit
   where actor_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
     and outcome = 'UNAUTHORIZED'),
  5,
  'the first five unauthorized attempts are recorded for investigation'
);
select extensions.is(
  (select email_sha256 from public.employee_creation_audit where id = (select id from public.employee_creation_audit where email_sha256 is not null order by created_at desc limit 1)),
  encode(digest('employee@example.com', 'sha256'), 'hex'),
  'audit stores SHA-256 of normalized target email'
);
select extensions.is(
  (select actor_id from public.employee_creation_audit where email_sha256 = encode(digest('employee@example.com', 'sha256'), 'hex')),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
  'actor UUID remains separate from target email hash'
);
select extensions.is(
  (select allowed from public.reserve_employee_creation_attempt(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', null, 5
  )),
  false,
  'the sixth unauthorized attempt is rate limited'
);
select extensions.is(
  (select count(*)::int from public.employee_creation_audit
   where actor_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  5,
  'rate-limited retries do not create additional audit rows'
);
reset role;

select * from extensions.finish();
rollback;
