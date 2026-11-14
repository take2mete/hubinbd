-- Extend owner-admin user management with the vendor role.
-- A user can only be assigned vendor after their vendor application is approved.
create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_role text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'owner_admin'
  ) then
    raise exception 'Owner Admin permission required' using errcode = '42501';
  end if;

  if p_role not in ('customer', 'vendor', 'admin', 'sub_admin') then
    raise exception 'Unsupported role';
  end if;

  select ur.role into current_role
  from public.user_roles ur where ur.user_id = p_user_id;

  if current_role = 'owner_admin' then
    raise exception 'Owner Admin role cannot be changed here';
  end if;

  if not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'User not found';
  end if;

  if p_role = 'vendor' and not exists (
    select 1 from public.vendors v
    where v.user_id = p_user_id and v.status = 'approved'
  ) then
    raise exception 'Only users with an approved seller application can be assigned the seller role';
  end if;

  insert into public.user_roles(user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$function$;

revoke all on function public.admin_set_user_role(uuid, text) from public, anon;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
