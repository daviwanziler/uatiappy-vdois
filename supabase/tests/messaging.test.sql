-- Run with: supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(4);

\set user_a '12121212-1212-4212-8212-121212121212'
\set user_b '34343434-3434-4434-8434-343434343434'
\set user_c '56565656-5656-4565-8565-565656565656'
\set conversation_a '78787878-7878-4878-8878-787878787878'
\set conversation_b '90909090-9090-4909-8909-909090909090'

insert into auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
  (:'user_a','authenticated','authenticated','msg-a@uatiappy.test','',now(),'{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}','{}',now(),now()),
  (:'user_b','authenticated','authenticated','msg-b@uatiappy.test','',now(),'{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}','{}',now(),now()),
  (:'user_c','authenticated','authenticated','msg-c@uatiappy.test','',now(),'{"provider":"email","providers":["email"],"role":"FUNCIONARIO","provisioned_by_admin":true}','{}',now(),now());

update public.employee_profiles set display_name='Participante B' where user_id=:'user_b';
insert into public.conversations(id,created_by) values (:'conversation_a',:'user_a'), (:'conversation_b',:'user_c');
insert into public.conversation_participants(conversation_id,user_id) values
  (:'conversation_a',:'user_a'), (:'conversation_a',:'user_b'),
  (:'conversation_b',:'user_c'), (:'conversation_b',:'user_b');
insert into public.messages(conversation_id,sender_id,body) values
  (:'conversation_a',:'user_a','Prévia privada A'),
  (:'conversation_b',:'user_c','Prévia privada C');

select set_config('request.jwt.claim.sub', :'user_a', true);
select set_config('request.jwt.claims', jsonb_build_object('sub',:'user_a','role','authenticated','app_metadata',jsonb_build_object('role','FUNCIONARIO'))::text,true);
set local role authenticated;
select extensions.is((select count(*)::int from public.get_my_conversations()),1,'conversation RPC returns only the caller direct conversations');
select extensions.is((select participant_name from public.get_my_conversations() limit 1),'Participante B','conversation RPC returns the peer display name');
select extensions.is((select last_message from public.get_my_conversations() limit 1),'Prévia privada A','conversation RPC returns the last message preview');
select extensions.is((select count(*)::int from public.messages),1,'message RLS keeps other conversations private');
reset role;
select * from extensions.finish();
rollback;
