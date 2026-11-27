-- Run with: supabase test db
-- pgTAP plan is 30 assertions. Run only against a disposable local/test Supabase project.
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(30);

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
insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code, created_at)
values (
  :'user_a',
  encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex'),
  'PENDING',
  'SIMULATED_AUDIT_FINALIZE_FAILURE',
  now() - interval '1 minute'
);
insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
values (
  :'blocked_user',
  encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex'),
  'PENDING',
  'RETRY_REQUEST_RECEIVED'
);
select extensions.is(
  public.reconcile_employee_creation_by_email_hash(
    (select id from public.employee_creation_audit where actor_id = :'blocked_user' and outcome = 'PENDING'
     and email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')),
    encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')
  ) ->> 'status',
  'RECOVERED',
  'reconciliation recovers only an older correlated pending attempt'
);
select extensions.is(
  (select outcome from public.employee_creation_audit
   where actor_id = :'user_a' and email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')),
  'SUCCESS',
  'the original pending audit is marked SUCCESS'
);
select extensions.is(
  (select account_user_id from public.employee_creation_audit
   where actor_id = :'user_a' and email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')),
  :'user_a'::uuid,
  'reconciliation stores the created Auth user id for traceability'
);
select extensions.is(
  (select detail_code from public.employee_creation_audit
   where actor_id = :'blocked_user' and email_sha256 = encode(extensions.digest('a@uatiappy.test', 'sha256'), 'hex')),
  'RETRY_RECONCILED_PREVIOUS_ATTEMPT',
  'the retry is not recorded as a second successful creation'
);

-- An existing account without a matching older pending attempt is a duplicate,
-- not a successful reconciliation.
insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
values (
  :'blocked_user',
  encode(extensions.digest('unprovisioned@uatiappy.test', 'sha256'), 'hex'),
  'PENDING',
  'DUPLICATE_RETRY_RECEIVED'
);
select extensions.is(
  public.reconcile_employee_creation_by_email_hash(
    (select id from public.employee_creation_audit where actor_id = :'blocked_user'
     and detail_code = 'DUPLICATE_RETRY_RECEIVED'),
    encode(extensions.digest('unprovisioned@uatiappy.test', 'sha256'), 'hex')
  ) ->> 'status',
  'DUPLICATE',
  'an existing account without a correlated pending attempt is rejected as duplicate'
);
select extensions.is(
  (select outcome from public.employee_creation_audit
   where actor_id = :'blocked_user' and detail_code = 'DUPLICATE_EMAIL'),
  'FAILURE',
  'duplicate retry is not written as a successful creation'
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

-- The cleanup job records a durable successful run with counters.
set local role service_role;
select public.cleanup_employee_creation_audit();
select extensions.ok(
  exists (
    select 1 from public.employee_creation_audit_cleanup_runs
    where status = 'SUCCESS' and finished_at is not null
      and pending_finalized >= 0 and records_deleted >= 0
  ),
  'audit cleanup records completion and execution counters'
);
reset role;

-- A simulated deletion failure must persist a FAILURE execution record.
create or replace function public.test_fail_audit_cleanup_delete()
returns trigger language plpgsql as $$$$
begin
  raise exception 'simulated cleanup failure';
end;
$$$$;
create trigger test_fail_audit_cleanup_delete
before delete on public.employee_creation_audit
for each row execute function public.test_fail_audit_cleanup_delete();
insert into public.employee_creation_audit(actor_id, outcome, detail_code, created_at)
values (:'user_a', 'SUCCESS', 'SIMULATED_OLD_AUDIT', now() - interval '100 days');
set local role service_role;
select extensions.is(public.cleanup_employee_creation_audit(), -1, 'cleanup reports a failure sentinel when maintenance fails');
select extensions.ok(
  exists (
    select 1 from public.employee_creation_audit_cleanup_runs
    where status = 'FAILURE' and finished_at is not null
      and error_message like 'SQLSTATE=%'
  ),
  'cleanup failure remains observable in a committed execution record'
);
reset role;
drop trigger test_fail_audit_cleanup_delete on public.employee_creation_audit;
drop function public.test_fail_audit_cleanup_delete();

-- Deleting an Auth user must not cascade-delete historical audit evidence.
insert into public.employee_creation_audit(actor_id, outcome, detail_code)
values (:'unprovisioned_user', 'SUCCESS', 'PRESERVE_ON_ACTOR_DELETE');
delete from auth.users where id = :'unprovisioned_user';
select extensions.is(
  (select count(*)::int from public.employee_creation_audit where actor_id = :'unprovisioned_user'),
  1,
  'audit history survives deletion of its actor account'
);

select * from extensions.finish();
rollback;
