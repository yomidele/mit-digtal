
-- Roles enum & user_roles table
CREATE TYPE public.app_role AS ENUM ('business_owner','lga_moderator','state_admin','super_admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_lga TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('state_admin','super_admin'))
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_sector TEXT,
  products_services TEXT NOT NULL,
  ownership_structure TEXT NOT NULL,
  registration_status TEXT NOT NULL,
  cac_number TEXT,
  operational_status TEXT NOT NULL DEFAULT 'Active',
  lga TEXT NOT NULL,
  community TEXT NOT NULL,
  address TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_email TEXT NOT NULL,
  website TEXT,
  employee_count TEXT NOT NULL,
  production_capacity TEXT,
  market_reach TEXT NOT NULL,
  key_markets TEXT,
  financing_needs TEXT,
  certifications TEXT[] DEFAULT '{}',
  export_readiness TEXT NOT NULL DEFAULT 'No',
  logo_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  document_urls TEXT[] DEFAULT '{}',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  registry_id TEXT UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.businesses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved businesses
CREATE POLICY "Public can view approved businesses" ON public.businesses FOR SELECT TO anon USING (approval_status = 'approved');
CREATE POLICY "Auth can view approved businesses" ON public.businesses FOR SELECT TO authenticated USING (
  approval_status = 'approved' OR user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'lga_moderator')
);
CREATE POLICY "Owners create own business" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update own pending/rejected business" ON public.businesses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND approval_status IN ('pending','rejected'))
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update any business" ON public.businesses FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Super admin delete" ON public.businesses FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX idx_businesses_approval ON public.businesses(approval_status);
CREATE INDEX idx_businesses_lga ON public.businesses(lga);
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_user ON public.businesses(user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users mark own read" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin view audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;

CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_businesses_touch BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + business_owner role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'business_owner');
  RETURN NEW;
END;$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Registry ID generator (called from server when approving)
CREATE OR REPLACE FUNCTION public.generate_registry_id(_lga TEXT) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  lga_code TEXT;
  yr TEXT;
  seq INT;
BEGIN
  lga_code := UPPER(LEFT(REGEXP_REPLACE(_lga,'[^A-Za-z]','','g'),3));
  yr := TO_CHAR(now(),'YYYY');
  SELECT COUNT(*)+1 INTO seq FROM public.businesses
    WHERE registry_id LIKE 'MIT/'||lga_code||'/'||yr||'/%';
  RETURN 'MIT/'||lga_code||'/'||yr||'/'||LPAD(seq::TEXT,5,'0');
END;$$;
