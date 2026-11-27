-- Preserve audit history when an administrator's Auth account is deleted.
-- The actor reference becomes nullable and is anonymized by ON DELETE SET NULL.
alter table public.employee_creation_audit
  alter column actor_id drop not null;

alter table public.employee_creation_audit
  drop constraint if exists employee_creation_audit_actor_id_fkey;

alter table public.employee_creation_audit
  add constraint employee_creation_audit_actor_id_fkey
  foreign key (actor_id)
  references auth.users(id)
  on delete set null;
