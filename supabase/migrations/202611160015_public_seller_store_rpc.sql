-- Public seller storefront: expose only approved seller identity and approved active products.
-- This RPC bypasses table RLS safely while returning a strict, non-sensitive field allowlist.
create or replace function public.get_public_seller_store(p_seller_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select case
    when exists (
      select 1
      from public.vendors v
      where v.user_id = p_seller_id
        and lower(v.status) = 'approved'
    )
    then jsonb_build_object(
      'seller', (
        select jsonb_build_object(
          'user_id', v.user_id,
          'business_name', v.business_name,
          'status', v.status
        )
        from public.vendors v
        where v.user_id = p_seller_id
          and lower(v.status) = 'approved'
        limit 1
      ),
      'products', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'name_bn', p.name_bn,
            'image_urls', p.image_urls,
            'price', p.price,
            'old_price', p.old_price,
            'category', p.category,
            'stock', p.stock,
            'sold', p.sold
          )
          order by p.created_at desc
        )
        from public.products p
        where p.vendor_id = p_seller_id
          and p.is_active = true
          and lower(p.status) = 'approved'
      ), '[]'::jsonb)
    )
    else null
  end;
$$;

revoke all on function public.get_public_seller_store(uuid) from public;
grant execute on function public.get_public_seller_store(uuid) to anon, authenticated;
