-- Safe additive indexes and role-aware commission policy optimization.
-- No table data, existing index, or storage object is removed.
CREATE INDEX IF NOT EXISTS seller_commission_rules_category_id_idx ON public.seller_commission_rules(category_id);
CREATE INDEX IF NOT EXISTS seller_commissions_category_id_idx ON public.seller_commissions(category_id);
CREATE INDEX IF NOT EXISTS seller_commissions_product_id_idx ON public.seller_commissions(product_id);

DROP POLICY IF EXISTS "Admins manage seller commission rules" ON public.seller_commission_rules;
CREATE POLICY "Admins manage seller commission rules" ON public.seller_commission_rules AS PERMISSIVE FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role IN ('owner_admin','sub_admin','admin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role IN ('owner_admin','sub_admin','admin')));

DROP POLICY IF EXISTS "Admins manage seller commissions" ON public.seller_commissions;
CREATE POLICY "Admins manage seller commissions" ON public.seller_commissions AS PERMISSIVE FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role IN ('owner_admin','sub_admin','admin')))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role IN ('owner_admin','sub_admin','admin')));

-- Internal trigger only; never callable as a client RPC.
REVOKE EXECUTE ON FUNCTION public.sync_seller_commission_for_order() FROM PUBLIC, anon, authenticated;
