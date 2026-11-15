drop function if exists public.admin_list_users();
create function public.admin_list_users()
returns table(user_id uuid,email text,role text,created_at timestamptz,is_verified boolean,account_type text)
language plpgsql security definer set search_path = ''
as $function$
begin
 if auth.uid() is null or not exists(select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='owner_admin') then
  raise exception 'Owner Admin permission required' using errcode='42501';
 end if;
 return query
 select u.id,u.email::text,coalesce(r.role,'customer')::text,u.created_at,coalesce(av.is_verified,false),
 case when coalesce(r.role,'customer') in ('owner_admin','admin','sub_admin') then 'admin'
      when coalesce(r.role,'customer')='vendor' or exists(select 1 from public.vendors v where v.user_id=u.id) then 'seller'
      else 'customer' end::text
 from auth.users u
 left join public.user_roles r on r.user_id=u.id
 left join public.account_verifications av on av.user_id=u.id
 order by u.created_at desc;
end;
$function$;
revoke all on function public.admin_list_users() from public,anon;
grant execute on function public.admin_list_users() to authenticated;