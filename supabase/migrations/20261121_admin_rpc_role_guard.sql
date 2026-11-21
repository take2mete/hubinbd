-- Harden Admin report RPC role checks against users without a user_roles row.
-- SECURITY DEFINER is required because Sub-admins must receive aggregate-only results
-- while direct reads of confidential source tables remain blocked by RLS.
CREATE OR REPLACE FUNCTION public.admin_business_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_role text;
  v_today_start timestamptz;
  v_month_start timestamptz;
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  SELECT ur.role INTO v_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();

  IF v_role IS NULL OR v_role NOT IN ('owner_admin', 'sub_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  v_today_start := (date_trunc('day', now() AT TIME ZONE 'Asia/Dhaka')) AT TIME ZONE 'Asia/Dhaka';
  v_month_start := (date_trunc('month', now() AT TIME ZONE 'Asia/Dhaka')) AT TIME ZONE 'Asia/Dhaka';

  SELECT jsonb_build_object(
    'daily_sales', COALESCE((SELECT sum(o.amount) FROM public.orders o WHERE o.created_at >= v_today_start AND lower(coalesce(o.status, '')) IN ('delivered', 'completed')), 0),
    'monthly_sales', COALESCE((SELECT sum(o.amount) FROM public.orders o WHERE o.created_at >= v_month_start AND lower(coalesce(o.status, '')) IN ('delivered', 'completed')), 0),
    'total_orders', (SELECT count(*) FROM public.orders),
    'pending_orders', (SELECT count(*) FROM public.orders o WHERE lower(coalesce(o.status, '')) = 'pending'),
    'seller_commission', COALESCE((SELECT sum(sc.commission_amount) FROM public.seller_commissions sc WHERE lower(coalesce(sc.status, '')) <> 'reversed'), 0),
    'affiliate_commission', COALESCE((SELECT sum(ac.commission_amount) FROM public.affiliate_commissions ac WHERE lower(coalesce(ac.status, '')) <> 'reversed'), 0),
    'low_stock_count', (SELECT count(*) FROM public.products p WHERE p.is_active = true AND p.stock <= 5 AND lower(coalesce(p.status, '')) = 'approved')
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_business_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_business_summary() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_sales_report(p_from date, p_to date)
RETURNS TABLE (
  report_date date,
  seller_name text,
  category_name text,
  order_count bigint,
  sales_amount numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  SELECT ur.role INTO v_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();

  IF v_role IS NULL OR v_role NOT IN ('owner_admin', 'sub_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 366 THEN
    RAISE EXCEPTION 'Invalid report date range';
  END IF;

  RETURN QUERY
  SELECT
    (o.created_at AT TIME ZONE 'Asia/Dhaka')::date,
    COALESCE(NULLIF(v.business_name, ''), 'Direct / Platform'),
    COALESCE(NULLIF(p.category, ''), 'অন্যান্য'),
    count(*)::bigint,
    COALESCE(sum(o.amount), 0)::numeric
  FROM public.orders o
  LEFT JOIN public.vendors v ON v.user_id = o.seller_id
  LEFT JOIN public.products p ON p.id = o.product_id
  WHERE (o.created_at AT TIME ZONE 'Asia/Dhaka')::date BETWEEN p_from AND p_to
    AND lower(coalesce(o.status, '')) IN ('delivered', 'completed')
  GROUP BY 1, 2, 3
  ORDER BY 1 DESC, 5 DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_sales_report(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_sales_report(date, date) TO authenticated;
