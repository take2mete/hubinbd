-- Phase 3: backend query and public-read caching optimization.
-- Public catalog indexes match the active/approved filters and stable ordering
-- used by the storefront. Trigram indexes support contains-search (ILIKE '%term%').
-- No rows, policies, roles, or existing indexes are removed or rewritten.

create extension if not exists pg_trgm with schema extensions;

create index if not exists products_public_latest_idx
  on public.products (created_at desc, id desc)
  where is_active is true and status = 'Approved';

create index if not exists products_public_subcategory_latest_idx
  on public.products (sub_category_id, created_at desc, id desc)
  where is_active is true and status = 'Approved';

create index if not exists products_name_trgm_idx
  on public.products using gin (name extensions.gin_trgm_ops);

create index if not exists products_name_bn_trgm_idx
  on public.products using gin (name_bn extensions.gin_trgm_ops);

create index if not exists main_categories_active_sort_idx
  on public.main_categories (sort_order, id)
  where is_active is true;

create index if not exists sub_categories_active_sort_idx
  on public.sub_categories (sort_order, id)
  where is_active is true;

create index if not exists vendors_status_submitted_idx
  on public.vendors (status, submitted_at desc);

analyze public.products;
analyze public.main_categories;
analyze public.sub_categories;
analyze public.vendors;
