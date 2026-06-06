
-- 1. Remove broad anon read on businesses; server functions (service role) serve public directory.
DROP POLICY IF EXISTS "Public can view approved businesses" ON public.businesses;

-- 2. Storage: restrict business-media reads to files under approved-business owner folders (or owner/admin).
DROP POLICY IF EXISTS "Anyone can view business media" ON storage.objects;

CREATE POLICY "Public read media of approved businesses"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'business-media'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.approval_status = 'approved'
      AND b.user_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Owners and admins read own business media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-media'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'lga_moderator'::public.app_role)
  )
);

-- 3. Revoke EXECUTE on SECURITY DEFINER helpers from PUBLIC/authenticated/anon.
--    has_role/is_admin remain callable because RLS policies invoke them as the policy owner.
REVOKE EXECUTE ON FUNCTION public.generate_registry_id(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_registry_id_on_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
