-- HubinBD Admin Management Center
-- Adds aggregate-only reporting RPCs and enforces Sub-admin read-only access.
-- No existing rows are changed or deleted.

CREATE OR REPLACE FUNCTION public.is_current_user_owner_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'owner_admin');
$function$;
REVOKE ALL ON FUNCTION public.is_current_user_owner_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_owner_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_current_user_sub_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'sub_admin'
  );
$function$;

REVOKE ALL ON FUNCTION public.is_current_user_sub_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_sub_admin() TO authenticated;

-- Restrictive policies cannot be bypassed by the existing permissive admin policies.
-- Sub-admins may read permitted reports, but cannot write to any RLS-protected public table.
DO $block$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND c.relrowsecurity = true
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS sub_admin_read_only_insert ON public.%I', target.relname);
    EXECUTE format('CREATE POLICY sub_admin_read_only_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (NOT (SELECT public.is_current_user_sub_admin()))', target.relname);

    EXECUTE format('DROP POLICY IF EXISTS sub_admin_read_only_update ON public.%I', target.relname);
    EXECUTE format('CREATE POLICY sub_admin_read_only_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT (SELECT public.is_current_user_sub_admin())) WITH CHECK (NOT (SELECT public.is_current_user_sub_admin()))', target.relname);

    EXECUTE format('DROP POLICY IF EXISTS sub_admin_read_only_delete ON public.%I', target.relname);
    EXECUTE format('CREATE POLICY sub_admin_read_only_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT (SELECT public.is_current_user_sub_admin()))', target.relname);
  END LOOP;
END;
$block$;

-- Confidential records must not be directly readable by Sub-admins.
DO $block$
DECLARE
  target_name text;
BEGIN
  FOREACH target_name IN ARRAY ARRAY[
    'admin_audit_logs',
    'orders',
    'vendors',
    'service_orders',
    'payouts',
    'affiliate_profiles',
    'affiliate_payout_requests',
    'account_verifications'
  ]
  LOOP
    IF to_regclass(format('public.%I', target_name)) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS sub_admin_no_read_confidential ON public.%I', target_name);
      EXECUTE format('CREATE POLICY sub_admin_no_read_confidential ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (NOT (SELECT public.is_current_user_sub_admin()))', target_name);
    END IF;
  END LOOP;
END;
$block$;

-- Financial and security data are Owner Admin only. Self-service payout reads remain intact.
DROP POLICY IF EXISTS owner_only_audit_log_read ON public.admin_audit_logs;
CREATE POLICY owner_only_audit_log_read ON public.admin_audit_logs AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()));

DROP POLICY IF EXISTS owner_only_seller_commission_read ON public.seller_commissions;
CREATE POLICY owner_only_seller_commission_read ON public.seller_commissions AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()));

DROP POLICY IF EXISTS owner_only_seller_commission_rules_read ON public.seller_commission_rules;
CREATE POLICY owner_only_seller_commission_rules_read ON public.seller_commission_rules AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()));

DROP POLICY IF EXISTS owner_only_payout_read ON public.payouts;
CREATE POLICY owner_only_payout_read ON public.payouts AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()) OR seller_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS owner_or_affiliate_commission_read ON public.affiliate_commissions;
CREATE POLICY owner_or_affiliate_commission_read ON public.affiliate_commissions AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()) OR EXISTS (
 SELECT 1 FROM public.affiliate_profiles ap WHERE ap.id = affiliate_commissions.affiliate_id AND ap.user_id = (SELECT auth.uid())
));

DROP POLICY IF EXISTS owner_or_affiliate_payout_read ON public.affiliate_payout_requests;
CREATE POLICY owner_or_affiliate_payout_read ON public.affiliate_payout_requests AS RESTRICTIVE FOR SELECT TO authenticated
USING ((SELECT public.is_current_user_owner_admin()) OR EXISTS (
 SELECT 1 FROM public.affiliate_profiles ap WHERE ap.id = affiliate_payout_requests.affiliate_id AND ap.user_id = (SELECT auth.uid())
));

-- Apply the same no-write rule to Supabase Storage objects.
DROP POLICY IF EXISTS sub_admin_read_only_storage_insert ON storage.objects;
CREATE POLICY sub_admin_read_only_storage_insert ON storage.objects
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT (SELECT public.is_current_user_sub_admin()));

DROP POLICY IF EXISTS sub_admin_read_only_storage_update ON storage.objects;
CREATE POLICY sub_admin_read_only_storage_update ON storage.objects
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (NOT (SELECT public.is_current_user_sub_admin()))
  WITH CHECK (NOT (SELECT public.is_current_user_sub_admin()));

DROP POLICY IF EXISTS sub_admin_read_only_storage_delete ON storage.objects;
CREATE POLICY sub_admin_read_only_storage_delete ON storage.objects
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (NOT (SELECT public.is_current_user_sub_admin()));

-- Aggregate-only business summary. Does not return customer names, phones or addresses.
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

  IF v_role NOT IN ('owner_admin', 'sub_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  v_today_start := (date_trunc('day', now() AT TIME ZONE 'Asia/Dhaka')) AT TIME ZONE 'Asia/Dhaka';
  v_month_start := (date_trunc('month', now() AT TIME ZONE 'Asia/Dhaka')) AT TIME ZONE 'Asia/Dhaka';

  SELECT jsonb_build_object(
    'daily_sales', COALESCE((
      SELECT sum(o.amount) FROM public.orders o
      WHERE o.created_at >= v_today_start
        AND lower(coalesce(o.status, '')) IN ('delivered', 'completed')
    ), 0),
    'monthly_sales', COALESCE((
      SELECT sum(o.amount) FROM public.orders o
      WHERE o.created_at >= v_month_start
        AND lower(coalesce(o.status, '')) IN ('delivered', 'completed')
    ), 0),
    'total_orders', (SELECT count(*) FROM public.orders),
    'pending_orders', (SELECT count(*) FROM public.orders o WHERE lower(coalesce(o.status, '')) = 'pending'),
    'seller_commission', COALESCE((
      SELECT sum(sc.commission_amount) FROM public.seller_commissions sc
      WHERE lower(coalesce(sc.status, '')) <> 'reversed'
    ), 0),
    'affiliate_commission', COALESCE((
      SELECT sum(ac.commission_amount) FROM public.affiliate_commissions ac
      WHERE lower(coalesce(ac.status, '')) <> 'reversed'
    ), 0),
    'low_stock_count', (
      SELECT count(*) FROM public.products p
      WHERE p.is_active = true AND p.stock <= 5 AND lower(coalesce(p.status, '')) = 'approved'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_business_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_business_summary() TO authenticated;

-- Sales report contains only grouped totals; customer PII is never returned.
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

  IF v_role NOT IN ('owner_admin', 'sub_admin', 'admin') THEN
    RAISE EXCEPTION 'Admin permission required' USING ERRCODE = '42501';
  END IF;

  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from OR p_to - p_from > 366 THEN
    RAISE EXCEPTION 'Invalid report date range';
  END IF;

  RETURN QUERY
  SELECT
    (o.created_at AT TIME ZONE 'Asia/Dhaka')::date AS report_date,
    COALESCE(NULLIF(v.business_name, ''), 'Direct / Platform') AS seller_name,
    COALESCE(NULLIF(p.category, ''), 'অন্যান্য') AS category_name,
    count(*)::bigint AS order_count,
    COALESCE(sum(o.amount), 0)::numeric AS sales_amount
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

COMMENT ON FUNCTION public.admin_business_summary() IS
  'Returns aggregate-only business KPIs to Owner Admin, Sub-admin and legacy Admin roles; no customer PII.';
COMMENT ON FUNCTION public.admin_sales_report(date, date) IS
  'Returns grouped date/seller/category sales totals only; no customer PII. Owner Admin export is enforced in the Admin UI.';
