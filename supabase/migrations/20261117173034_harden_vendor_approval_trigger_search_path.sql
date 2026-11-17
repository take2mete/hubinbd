-- Pin the SECURITY DEFINER vendor-approval trigger to an empty search_path.
-- All application objects referenced by the function are schema-qualified.
-- This preserves the existing trigger and role-assignment behavior.
ALTER FUNCTION public.assign_vendor_role_on_approval()
  SET search_path = '';
