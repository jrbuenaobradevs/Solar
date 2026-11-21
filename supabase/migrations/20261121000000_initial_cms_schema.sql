CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- CMS Tables
CREATE TABLE public.admin_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    path text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title text DEFAULT '',
    meta_description text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.page_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_type text NOT NULL,
    title text NOT NULL DEFAULT '',
    content jsonb DEFAULT '{}',
    sort_order integer NOT NULL DEFAULT 0,
    is_visible boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}',
    is_public boolean DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.contact_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_type text NOT NULL CHECK (inquiry_type IN ('contact', 'quote')),
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL DEFAULT '',
    subject text NOT NULL DEFAULT '',
    message text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'completed', 'cancelled')),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Catalog Tables
CREATE TABLE public.solar_packages (
    id text PRIMARY KEY,
    name text NOT NULL,
    audience text NOT NULL,
    type text NOT NULL,
    solar numeric(12,2) NOT NULL,
    inverter numeric(12,2) NOT NULL,
    battery numeric(12,2) NOT NULL,
    panels text NOT NULL,
    generation numeric(12,2) NOT NULL,
    price numeric(12,2) NOT NULL,
    includes text[] NOT NULL,
    featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.solar_addons (
    id text PRIMARY KEY,
    name text NOT NULL,
    spec text NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Admin Tables
CREATE TABLE public.media_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    storage_path text NOT NULL UNIQUE,
    bucket_name text NOT NULL DEFAULT 'site-media',
    file_type text,
    file_size bigint DEFAULT 0,
    title text DEFAULT '',
    alt_text text DEFAULT '',
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Triggers
CREATE TRIGGER set_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_page_sections_updated_at BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_solar_packages_updated_at BEFORE UPDATE ON public.solar_packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_solar_addons_updated_at BEFORE UPDATE ON public.solar_addons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_pages_status_path ON public.pages(status, path);
CREATE INDEX idx_page_sections_page_position ON public.page_sections(page_id, sort_order);
CREATE INDEX idx_contact_inquiries_status_created ON public.contact_inquiries(status, created_at DESC);
CREATE INDEX idx_contact_inquiries_created ON public.contact_inquiries(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_activity_logs_actor ON public.activity_logs(user_id, created_at DESC);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-media',
    'site-media',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read site-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'site-media');
CREATE POLICY "Admin upload site-media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site-media');
CREATE POLICY "Admin update site-media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'site-media');
CREATE POLICY "Admin delete site-media" ON storage.objects
    FOR DELETE USING (bucket_id = 'site-media');

-- RLS Policies
-- admin_users: No public access; admins manage
CREATE POLICY "Admin manage admin_users" ON public.admin_users FOR ALL USING (public.is_admin());

-- pages: Public reads published; admins manage
CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manage pages" ON public.pages FOR ALL USING (public.is_admin());

-- page_sections: Public reads visible sections of published pages; admins manage
CREATE POLICY "Public read page_sections" ON public.page_sections FOR SELECT USING (
    is_visible = true AND EXISTS (
        SELECT 1 FROM public.pages p WHERE p.id = page_id AND p.status = 'published'
    )
);
CREATE POLICY "Admin manage page_sections" ON public.page_sections FOR ALL USING (public.is_admin());

-- site_settings: Public reads public settings; admins manage
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin manage site_settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- contact_inquiries: Public inserts only; admins read/update
CREATE POLICY "Public insert inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read inquiries" ON public.contact_inquiries FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin update inquiries" ON public.contact_inquiries FOR UPDATE USING (public.is_admin());

-- solar_packages: Public reads; admins manage
CREATE POLICY "Public read solar_packages" ON public.solar_packages FOR SELECT USING (true);
CREATE POLICY "Admin manage solar_packages" ON public.solar_packages FOR ALL USING (public.is_admin());

-- solar_addons: Public reads; admins manage
CREATE POLICY "Public read solar_addons" ON public.solar_addons FOR SELECT USING (true);
CREATE POLICY "Admin manage solar_addons" ON public.solar_addons FOR ALL USING (public.is_admin());

-- media_assets: Public reads public media; admins manage
CREATE POLICY "Public read media_assets" ON public.media_assets FOR SELECT USING (is_public = true);
CREATE POLICY "Admin manage media_assets" ON public.media_assets FOR ALL USING (public.is_admin());

-- activity_logs: No public access; admins read only
CREATE POLICY "Admin read activity_logs" ON public.activity_logs FOR SELECT USING (public.is_admin());
