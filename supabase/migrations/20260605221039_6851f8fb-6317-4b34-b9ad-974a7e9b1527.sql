
-- 1) Auto-set registry_id + approved_at on transition to approved
CREATE OR REPLACE FUNCTION public.set_registry_id_on_approval()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.approval_status = 'approved'
     AND (OLD.approval_status IS DISTINCT FROM 'approved')
     AND NEW.registry_id IS NULL THEN
    NEW.registry_id := public.generate_registry_id(NEW.lga);
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_set_registry_id ON public.businesses;
CREATE TRIGGER trg_set_registry_id
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_registry_id_on_approval();

-- 2) Touch updated_at on businesses + profiles
DROP TRIGGER IF EXISTS trg_businesses_touch ON public.businesses;
CREATE TRIGGER trg_businesses_touch BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_touch ON public.profiles;
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3) Admins can view all profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lga_moderator'));

-- 4) Admins view all roles, super admin manages roles
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin manage roles" ON public.user_roles;
CREATE POLICY "Super admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- 5) Make sure admins can view suspended businesses (existing policy already covers via is_admin)
-- (no change needed — "Auth can view approved businesses" already returns true for admins on any row)

-- 6) Allow admins to insert notifications (for sending decision notifications via authenticated client)
DROP POLICY IF EXISTS "Admins insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lga_moderator'));

-- 7) Allow admins to insert audit log rows via authenticated client
DROP POLICY IF EXISTS "Admins insert audit" ON public.audit_log;
CREATE POLICY "Admins insert audit" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lga_moderator'));

-- 8) Allow admins (not just super_admin) to view audit log
DROP POLICY IF EXISTS "Admins view audit" ON public.audit_log;
CREATE POLICY "Admins view audit" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
