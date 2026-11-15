-- Hide all approved products belonging to sellers while their account is unverified.
-- Keep product records, approvals, images, sales history and orders unchanged.
-- Previously approved sellers are grandfathered as verified; new accounts default to unverified.
update public.account_verifications av
set is_verified=true,
    verified_at=coalesce(av.verified_at,now()),
    updated_at=now()
from public.vendors v
where v.user_id=av.user_id
  and v.status='approved'
  and av.is_verified=false;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Verified seller products are publicly readable" on public.products
for select to anon, authenticated
using (
  (
    is_active=true
    and lower(status)='approved'
    and (
      vendor_id is null
      or exists (
        select 1
        from public.vendors v
        join public.account_verifications av on av.user_id=v.user_id
        where v.user_id=products.vendor_id
          and v.status='approved'
          and av.is_verified=true
      )
    )
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.user_id=(select auth.uid())
      and ur.role in ('owner_admin','admin','sub_admin')
  )
);
