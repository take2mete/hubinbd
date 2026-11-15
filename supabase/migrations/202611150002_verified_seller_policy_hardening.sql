drop policy if exists "Admins and verified owners can update products" on public.products;
create policy "Admins and verified owners can update products" on public.products for update to authenticated using (
 exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
 or (vendor_id=(select auth.uid()) and exists(select 1 from public.vendors v where v.user_id=(select auth.uid()) and v.status='approved') and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
) with check (
 exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
 or (vendor_id=(select auth.uid()) and exists(select 1 from public.vendors v where v.user_id=(select auth.uid()) and v.status='approved') and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
);
drop policy if exists "Admins and verified owners can delete products" on public.products;
create policy "Admins and verified owners can delete products" on public.products for delete to authenticated using (
 exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
 or (vendor_id=(select auth.uid()) and exists(select 1 from public.vendors v where v.user_id=(select auth.uid()) and v.status='approved') and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
);