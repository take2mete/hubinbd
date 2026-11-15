-- Account verification is independent from account role and seller onboarding.
create table if not exists public.account_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.account_verifications enable row level security;
drop policy if exists "Users can read own verification" on public.account_verifications;
create policy "Users can read own verification" on public.account_verifications
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.account_verifications to authenticated;

create or replace function private.initialize_account_security()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.account_verifications(user_id,is_verified)
  values(new.id,false) on conflict(user_id) do nothing;
  insert into public.user_roles(user_id,role)
  values(new.id,'customer') on conflict(user_id) do nothing;
  return new;
end;
$function$;
drop trigger if exists hubinbd_initialize_account_security on auth.users;
create trigger hubinbd_initialize_account_security
  after insert on auth.users
  for each row execute function private.initialize_account_security();

-- Existing accounts are explicitly unverified until Owner Admin verifies them.
insert into public.account_verifications(user_id,is_verified)
select id,false from auth.users
on conflict(user_id) do nothing;

create or replace function public.register_seller_self(
  p_business_name text,
  p_contact_name text,
  p_phone text,
  p_address text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'সেলার রেজিস্ট্রেশনের আগে লগইন করুন'; end if;
  if length(trim(coalesce(p_business_name,''))) < 2 then raise exception 'দোকানের নাম দিন'; end if;
  if length(trim(coalesce(p_contact_name,''))) < 2 then raise exception 'আপনার নাম দিন'; end if;
  if length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g')) < 10 then raise exception 'সঠিক মোবাইল নম্বর দিন'; end if;
  if length(trim(coalesce(p_address,''))) < 3 then raise exception 'সম্পূর্ণ ঠিকানা দিন'; end if;

  insert into public.vendors(user_id,business_name,contact_name,phone,address,status,submitted_at,reviewed_at,reviewed_by,review_note)
  values(v_user,trim(p_business_name),trim(p_contact_name),regexp_replace(trim(p_phone),'[[:space:]]','','g'),trim(p_address),'approved',now(),now(),v_user,'Self-service seller registration')
  on conflict(user_id) do update set
    business_name=excluded.business_name,
    contact_name=excluded.contact_name,
    phone=excluded.phone,
    address=excluded.address,
    status='approved',
    reviewed_at=now(),
    reviewed_by=v_user,
    review_note='Self-service seller registration';

  insert into public.user_roles(user_id,role) values(v_user,'vendor')
  on conflict(user_id) do update set role='vendor'
  where public.user_roles.role not in ('owner_admin','admin','sub_admin');

  insert into public.account_verifications(user_id,is_verified)
  values(v_user,false) on conflict(user_id) do nothing;
end;
$function$;
revoke all on function public.register_seller_self(text,text,text,text) from public,anon;
grant execute on function public.register_seller_self(text,text,text,text) to authenticated;

-- Owner Admin only: verification toggles never modify roles or delete accounts.
drop function if exists public.admin_list_users();
create function public.admin_list_users()
returns table(user_id uuid,email text,role text,created_at timestamptz,is_verified boolean,account_type text)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='owner_admin'
  ) then raise exception 'Owner Admin permission required' using errcode='42501'; end if;

  return query
  select u.id,u.email::text,coalesce(r.role,'customer')::text,u.created_at,
         coalesce(av.is_verified,false),
         case when coalesce(r.role,'customer')='vendor' or exists(select 1 from public.vendors v where v.user_id=u.id) then 'seller' else 'customer' end::text
  from auth.users u
  left join public.user_roles r on r.user_id=u.id
  left join public.account_verifications av on av.user_id=u.id
  order by u.created_at desc;
end;
$function$;
revoke all on function public.admin_list_users() from public,anon;
grant execute on function public.admin_list_users() to authenticated;

create or replace function public.admin_set_user_verification(p_user_id uuid,p_is_verified boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare v_actor uuid:=auth.uid();
begin
  if v_actor is null or not exists(select 1 from public.user_roles where user_id=v_actor and role='owner_admin') then
    raise exception 'Owner Admin permission required' using errcode='42501';
  end if;
  if p_user_id=v_actor then raise exception 'নিজের verification status পরিবর্তন করা যাবে না'; end if;
  if exists(select 1 from public.user_roles where user_id=p_user_id and role in ('owner_admin','admin','sub_admin')) then
    raise exception 'Admin role-এর verification এই পেজ থেকে পরিবর্তন করা যাবে না';
  end if;
  if not exists(select 1 from auth.users where id=p_user_id) then raise exception 'User not found'; end if;
  insert into public.account_verifications(user_id,is_verified,verified_at,verified_by,updated_at)
  values(p_user_id,p_is_verified,case when p_is_verified then now() else null end,case when p_is_verified then v_actor else null end,now())
  on conflict(user_id) do update set is_verified=excluded.is_verified,verified_at=excluded.verified_at,verified_by=excluded.verified_by,updated_at=now();
end;
$function$;
revoke all on function public.admin_set_user_verification(uuid,boolean) from public,anon;
grant execute on function public.admin_set_user_verification(uuid,boolean) to authenticated;

-- Verification gates for seller-side writes. Admin roles retain their existing access.
drop policy if exists "Admins and approved vendors can insert products" on public.products;
create policy "Admins and verified vendors can insert products" on public.products
for insert to authenticated with check (
  exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
  or (vendor_id=(select auth.uid())
      and exists(select 1 from public.vendors v where v.user_id=(select auth.uid()) and v.status='approved')
      and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
);
drop policy if exists "Admins and owners can update products" on public.products;
create policy "Admins and verified owners can update products" on public.products
for update to authenticated using (
  exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
  or (vendor_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
) with check (
  exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
  or (vendor_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
);
drop policy if exists "Admins and owners can delete products" on public.products;
create policy "Admins and verified owners can delete products" on public.products
for delete to authenticated using (
  exists(select 1 from public.user_roles ur where ur.user_id=(select auth.uid()) and ur.role in ('owner_admin','sub_admin','admin'))
  or (vendor_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified))
);

drop policy if exists "Sellers can update own orders" on public.orders;
create policy "Verified sellers can update own orders" on public.orders
for update to authenticated using (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
) with check (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
);
drop policy if exists "Sellers can request own payouts" on public.payouts;
create policy "Verified sellers can request own payouts" on public.payouts
for insert to authenticated with check (
  seller_id=(select auth.uid()) and status='Pending'
  and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
);
drop policy if exists "Sellers can create own vouchers" on public.vouchers;
create policy "Verified sellers can create own vouchers" on public.vouchers
for insert to authenticated with check (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
);
drop policy if exists "Sellers can update own vouchers" on public.vouchers;
create policy "Verified sellers can update own vouchers" on public.vouchers
for update to authenticated using (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
) with check (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
);
drop policy if exists "Sellers can delete own vouchers" on public.vouchers;
create policy "Verified sellers can delete own vouchers" on public.vouchers
for delete to authenticated using (
  seller_id=(select auth.uid()) and exists(select 1 from public.account_verifications av where av.user_id=(select auth.uid()) and av.is_verified)
);

-- Checkout is performed by a SECURITY DEFINER function, so enforce customer verification inside it too.
create or replace function private.create_customer_order(
 p_product_id bigint,p_quantity integer,p_customer_name text,p_phone text,p_address text,p_delivery_area text,p_affiliate_code text default null
)
returns table(order_id uuid,order_no text)
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user uuid:=auth.uid(); v_product public.products%rowtype; v_order_id uuid; v_order_no text; v_charge integer;
begin
 if v_user is null then raise exception 'লগইন করে অর্ডার করুন'; end if;
 if not exists(select 1 from public.account_verifications av where av.user_id=v_user and av.is_verified) then
   raise exception 'অর্ডার করতে আগে Admin-এর কাছ থেকে অ্যাকাউন্ট Verify করান';
 end if;
 if p_quantity is null or p_quantity<1 or p_quantity>20 then raise exception 'পরিমাণ ১ থেকে ২০ এর মধ্যে দিন'; end if;
 if length(trim(coalesce(p_customer_name,'')))<2 then raise exception 'সঠিক নাম দিন'; end if;
 if length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g'))<10 then raise exception 'সঠিক মোবাইল নম্বর দিন'; end if;
 if length(trim(coalesce(p_address,'')))<8 then raise exception 'সম্পূর্ণ ঠিকানা দিন'; end if;
 select dc.charge into v_charge from public.delivery_charges dc where dc.area_name=trim(coalesce(p_delivery_area,'')) and dc.is_active=true;
 if not found then raise exception 'ডেলিভারি এলাকা নির্বাচন করুন'; end if;
 select * into v_product from public.products where id=p_product_id and is_active=true and lower(status)='approved' for update;
 if not found then raise exception 'পণ্যটি এখন অর্ডার করা যাচ্ছে না'; end if;
 if v_product.vendor_id is null or not exists(select 1 from public.vendors v where v.user_id=v_product.vendor_id and v.status='approved') then raise exception 'এই পণ্যের বিক্রেতা এখনো অনুমোদিত নয়'; end if;
 if not exists(select 1 from public.account_verifications av where av.user_id=v_product.vendor_id and av.is_verified) then raise exception 'বিক্রেতার অ্যাকাউন্ট এখনো Verify হয়নি'; end if;
 if v_product.stock<p_quantity then raise exception 'পর্যাপ্ত স্টক নেই'; end if;
 update public.products set stock=stock-p_quantity,updated_at=now() where id=p_product_id;
 v_order_no:='HB'||to_char(now(),'YYMMDD')||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.orders(order_no,seller_id,customer_id,customer_name,phone,address,product_name,amount,delivery_charge,status,hub,affiliate_code,product_id,quantity)
 values(v_order_no,v_product.vendor_id,v_user,trim(p_customer_name),regexp_replace(trim(p_phone),'[[:space:]]','','g'),trim(p_address),coalesce(nullif(v_product.name_bn,''),v_product.name),round(v_product.price*p_quantity)::integer,v_charge,'Pending',trim(p_delivery_area),nullif(upper(trim(coalesce(p_affiliate_code,''))),''),p_product_id,p_quantity)
 returning id into v_order_id;
 return query select v_order_id,v_order_no;
end;
$function$;
