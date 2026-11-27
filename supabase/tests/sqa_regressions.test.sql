-- Regression tests for SQA findings #121-#124.
-- Run with: supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(7);

\set audit_actor '11111111-1111-4111-8111-111111111111'

insert into auth.users(
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  :'audit_actor', 'authenticated', 'authenticated', 'sqa-reconcile@uatiappy.test', '', now(),
  '{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}',
  '{}', now(), now()
);

insert into public.employee_creation_audit(actor_id, email_sha256, outcome, detail_code)
values (
  :'audit_actor',
  encode(extensions.digest('sqa-reconcile@uatiappy.test', 'sha256'), 'hex'),
  'PENDING',
  'SQA_RECONCILIATION_FIXTURE'
);

select extensions.is(
  public.reconcile_employee_creation_by_email_hash(encode(extensions.digest('sqa-reconcile@uatiappy.test', 'sha256'), 'hex')),
  null::uuid,
  'a recent pending attempt cannot be reconciled as an earlier successful account'
);
select extensions.is(
  (select outcome from public.employee_creation_audit where detail_code = 'SQA_RECONCILIATION_FIXTURE'),
  'PENDING',
  'a recent duplicate attempt remains pending until independently resolved'
);

-- Age the reservation, not the Auth user: this models Auth creation succeeding
-- after a durable reservation whose final audit update was interrupted.
update public.employee_creation_audit
set created_at = now() - interval '20 minutes'
where detail_code = 'SQA_RECONCILIATION_FIXTURE';

select extensions.is(
  public.reconcile_employee_creation_by_email_hash(encode(extensions.digest('sqa-reconcile@uatiappy.test', 'sha256'), 'hex')),
  :'audit_actor'::uuid,
  'a stale attempt correlated to an Auth account created afterward can be reconciled'
);
select extensions.is(
  (select outcome from public.employee_creation_audit where detail_code = 'SQA_RECONCILIATION_FIXTURE'),
  'SUCCESS',
  'the correlated stale audit attempt is marked successful'
);

select public.cleanup_employee_creation_audit();
select extensions.is(
  (select status from public.employee_creation_audit_cleanup_runs order by id desc limit 1),
  'SUCCESS',
  'audit cleanup execution status is recorded'
);
select extensions.ok(
  (select finished_at is not null from public.employee_creation_audit_cleanup_runs order by id desc limit 1),
  'audit cleanup execution records its completion timestamp'
);

delete from auth.users where id = :'audit_actor';
select extensions.is(
  (select actor_id from public.employee_creation_audit where detail_code = 'SQA_RECONCILIATION_FIXTURE'),
  null::uuid,
  'deleting the Auth actor preserves the audit row and anonymizes actor_id'
);

select * from extensions.finish();
rollback;
