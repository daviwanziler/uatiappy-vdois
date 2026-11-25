-- Operational hardening: schedule audit maintenance daily in Supabase Cron.
-- Supabase projects support pg_cron; the job executes as its trusted owner.
create extension if not exists pg_cron;

create table if not exists public.employee_creation_audit_cleanup_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  pending_finalized integer not null default 0,
  records_deleted integer not null default 0,
  status text not null default 'RUNNING' check (status in ('RUNNING','SUCCESS','FAILURE')),
  error_message text
);
alter table public.employee_creation_audit_cleanup_runs enable row level security;
revoke all on public.employee_creation_audit_cleanup_runs from public, anon, authenticated;
grant select, insert, update on public.employee_creation_audit_cleanup_runs to service_role;
grant usage, select on sequence public.employee_creation_audit_cleanup_runs_id_seq to service_role;

create or replace function public.cleanup_employee_creation_audit()
returns integer
language plpgsql
security definer
set search_path = ''
as $cleanup$
declare
  v_run_id bigint;
  v_pending integer := 0;
  v_deleted integer := 0;
begin
  insert into public.employee_creation_audit_cleanup_runs(status)
  values ('RUNNING')
  returning id into v_run_id;

  update public.employee_creation_audit
  set outcome = 'FAILURE',
      detail_code = 'AUDIT_FINALIZATION_TIMEOUT',
      finished_at = now()
  where outcome = 'PENDING'
    and created_at < now() - interval '15 minutes';
  get diagnostics v_pending = row_count;

  delete from public.employee_creation_audit
  where created_at < now() - interval '90 days';
  get diagnostics v_deleted = row_count;

  update public.employee_creation_audit_cleanup_runs
  set finished_at = now(),
      pending_finalized = v_pending,
      records_deleted = v_deleted,
      status = 'SUCCESS'
  where id = v_run_id;

  return v_deleted;
exception when others then
  if v_run_id is not null then
    update public.employee_creation_audit_cleanup_runs
    set finished_at = now(), status = 'FAILURE',
        error_message = left(sqlstate || ': ' || sqlerrm, 1000)
    where id = v_run_id;
  end if;
  raise;
end;
$cleanup$;

revoke all on function public.cleanup_employee_creation_audit() from public, anon, authenticated;
grant execute on function public.cleanup_employee_creation_audit() to service_role, postgres;

-- Replace the named job idempotently. 03:17 UTC daily.
do $schedule$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'uatiappy-cleanup-employee-creation-audit';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'uatiappy-cleanup-employee-creation-audit',
    '17 3 * * *',
    'select public.cleanup_employee_creation_audit();'
  );
end;
$schedule$;
