
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.flow_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE public.webhook_direction AS ENUM ('inbound', 'outbound');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT 'BF',
  channels TEXT[] NOT NULL DEFAULT '{whatsapp}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- PROFILES (linked to auth.users, NO role column)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER_ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- FLOWS
CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  status flow_status NOT NULL DEFAULT 'draft',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- FLOW_VERSIONS
CREATE TABLE public.flow_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (flow_id, version_number)
);
ALTER TABLE public.flow_versions ENABLE ROW LEVEL SECURITY;

-- GLOBALS
CREATE TABLE public.globals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, key)
);
ALTER TABLE public.globals ENABLE ROW LEVEL SECURITY;

-- WEBHOOK_LOGS
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  direction webhook_direction NOT NULL DEFAULT 'outbound',
  url TEXT,
  payload JSONB,
  response_body TEXT,
  status_code INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTIONS (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS POLICIES: Organizations
CREATE POLICY "Users can view their org"
  ON public.organizations FOR SELECT TO authenticated
  USING (id = public.get_user_org_id(auth.uid()));

-- RLS POLICIES: Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS POLICIES: User roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS POLICIES: Flows (org-scoped)
CREATE POLICY "Users can view org flows"
  ON public.flows FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can insert org flows"
  ON public.flows FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can update org flows"
  ON public.flows FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can delete org flows"
  ON public.flows FOR DELETE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

-- RLS POLICIES: Flow versions (org-scoped via flow)
CREATE POLICY "Users can view org flow versions"
  ON public.flow_versions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.flows f WHERE f.id = flow_id AND f.org_id = public.get_user_org_id(auth.uid())
  ));
CREATE POLICY "Users can insert org flow versions"
  ON public.flow_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.flows f WHERE f.id = flow_id AND f.org_id = public.get_user_org_id(auth.uid())
  ));

-- RLS POLICIES: Globals (org-scoped)
CREATE POLICY "Users can view org globals"
  ON public.globals FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can insert org globals"
  ON public.globals FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can update org globals"
  ON public.globals FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can delete org globals"
  ON public.globals FOR DELETE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

-- RLS POLICIES: Webhook logs (org-scoped)
CREATE POLICY "Users can view org webhook logs"
  ON public.webhook_logs FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Users can insert org webhook logs"
  ON public.webhook_logs FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flows_updated_at
  BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
