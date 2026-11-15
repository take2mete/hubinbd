-- Fix anonymous homepage product reads.
-- The policy must not query vendors/account_verifications directly because
-- anonymous users do not have table privileges. Use a narrowly scoped helper.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_verified_approved_vendor(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vendors v
    join public.account_verifications av on av.user_id = v.user_id
    where v.user_id = p_user_id
      and v.status = 'approved'
      and av.is_verified = true
  );
$$;

revoke all on function private.is_verified_approved_vendor(uuid) from public;
grant execute on function private.is_verified_approved_vendor(uuid) to anon, authenticated;

drop policy if exists "Verified seller products are publicly readable" on public.products;
create policy "Verified seller products are publicly readable" on public.products
for select to anon, authenticated
using (
  (
    is_active = true
    and lower(status) = 'approved'
    and (
      vendor_id is null
      or private.is_verified_approved_vendor(vendor_id)
    )
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role in ('owner_admin','admin','sub_admin')
  )
);
