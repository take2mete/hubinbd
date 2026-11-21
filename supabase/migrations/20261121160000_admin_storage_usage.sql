-- Owner-only read-only summary of Storage usage.
-- Does not expose object names, paths, metadata, or file contents.
CREATE OR REPLACE FUNCTION public.admin_storage_usage()
RETURNS TABLE(bucket_name text, object_count bigint, bytes_used bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = 'off'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'owner_admin'
  ) THEN
    RAISE EXCEPTION 'Owner Admin permission required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT b.name::text, count(o.id)::bigint,
    coalesce(sum(CASE
      WHEN (o.metadata->>'size') ~ '^[0-9]+$' THEN (o.metadata->>'size')::bigint
      ELSE 0::bigint
    END), 0)::bigint
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON o.bucket_id = b.id
  GROUP BY b.name
  ORDER BY b.name;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_storage_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_storage_usage() TO authenticated;
