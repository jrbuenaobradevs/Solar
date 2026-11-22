-- ============================================================================
-- Solar Mechanics CMS - Unified Supabase Migration
-- Version: 2026-11-21
--
-- Fresh-database migration combining the original Migration 1 and Migration 2.
-- Assumes this is a Supabase project where the managed auth and storage schemas
-- already exist. Do NOT drop/recreate Supabase-managed auth or storage schemas.
--
-- IMPORTANT:
-- 1. Run this on a fresh application schema (or after intentionally resetting
--    the application tables). This is not a data-preserving upgrade migration.
-- 2. Create the first Supabase Auth user separately, then run the documented
--    Super Admin bootstrap statement in the README / instructions.
-- 3. The audit log entity_id is TEXT so UUID and TEXT primary keys both work.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Core tables
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'editor'
        CHECK (role IN ('super_admin', 'admin', 'editor')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text NOT NULL DEFAULT 'editor'
        CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    storage_path text NOT NULL UNIQUE,
    bucket_name text NOT NULL DEFAULT 'site-media',
    file_type text,
    file_size bigint NOT NULL DEFAULT 0,
    title text NOT NULL DEFAULT '',
    alt_text text NOT NULL DEFAULT '',
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public boolean NOT NULL DEFAULT true,
    width integer,
    height integer,
    focal_point_x numeric(3,2) DEFAULT 0.5,
    focal_point_y numeric(3,2) DEFAULT 0.5,
    tags text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    path text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    meta_title text NOT NULL DEFAULT '',
    meta_description text NOT NULL DEFAULT '',
    template text NOT NULL DEFAULT 'default',
    seo_keywords text[] NOT NULL DEFAULT '{}',
    og_image_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
    publish_at timestamptz,
    expire_at timestamptz,
    parent_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_type text NOT NULL,
    title text NOT NULL DEFAULT '',
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,
    layout text NOT NULL DEFAULT 'default',
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    background_image_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_public boolean NOT NULL DEFAULT false,
    category text NOT NULL DEFAULT 'general'
        CHECK (category IN (
            'general', 'company', 'branding', 'maintenance',
            'admin', 'seo', 'social', 'contact'
        )),
    description text,
    is_sensitive boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_type text NOT NULL CHECK (inquiry_type IN ('contact', 'quote')),
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL DEFAULT '',
    subject text NOT NULL DEFAULT '',
    message text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'new'
        CHECK (status IN (
            'new', 'in_progress', 'contacted', 'completed', 'cancelled'
        )),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.solar_packages (
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
    featured boolean NOT NULL DEFAULT false,
    description text,
    specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    badge_text text,
    badge_color text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.solar_addons (
    id text PRIMARY KEY,
    name text NOT NULL,
    spec text NOT NULL,
    price numeric(12,2) NOT NULL,
    description text,
    icon_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
    is_active boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    category text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    -- TEXT intentionally supports both UUID and TEXT primary keys.
    entity_id text,
    description text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    location text NOT NULL DEFAULT 'header'
        CHECK (location IN ('header', 'footer', 'mobile', 'sidebar', 'utility')),
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
    label text NOT NULL,
    url text NOT NULL,
    target text NOT NULL DEFAULT '_self'
        CHECK (target IN ('_self', '_blank')),
    icon text,
    css_classes text,
    is_active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. Helper functions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

-- SECURITY DEFINER avoids RLS recursion when policies call is_admin().
-- The function only checks membership in admin_users; it does not accept a
-- caller-supplied user ID.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.id = auth.uid()
          AND au.role IN ('super_admin', 'admin', 'editor')
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.id = auth.uid()
          AND au.role = 'super_admin'
    );
$function$;

-- Explicit text entity ID prevents UUID/TEXT mismatches across audited tables.
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action text,
    p_entity_type text,
    p_entity_id text,
    p_description text,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_claims jsonb;
    v_user_agent text;
BEGIN
    v_claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
    v_user_agent := v_claims ->> 'user_agent';

    INSERT INTO public.activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        auth.uid(),
        p_action,
        p_entity_type,
        p_entity_id,
        p_description,
        COALESCE(p_metadata, '{}'::jsonb),
        inet_client_addr(),
        v_user_agent
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    v_action text;
    v_entity_id text;
    v_description text;
    v_metadata jsonb;
    v_old jsonb;
    v_new jsonb;
BEGIN
    v_action := TG_OP;

    IF TG_OP = 'INSERT' THEN
        v_old := NULL;
        v_new := to_jsonb(NEW);
        v_entity_id := v_new ->> 'id';
    ELSIF TG_OP = 'UPDATE' THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_entity_id := COALESCE(v_new ->> 'id', v_old ->> 'id');
    ELSE
        v_old := to_jsonb(OLD);
        v_new := NULL;
        v_entity_id := v_old ->> 'id';
    END IF;

    v_description := TG_TABLE_NAME || ' ' || lower(TG_OP);
    v_metadata := jsonb_build_object('old', v_old, 'new', v_new);

    PERFORM public.log_activity(
        v_action,
        TG_TABLE_NAME::text,
        v_entity_id,
        v_description,
        v_metadata
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$function$;

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_pages_status_path
    ON public.pages(status, path);
CREATE INDEX IF NOT EXISTS idx_pages_parent_sort
    ON public.pages(parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_publish_expire
    ON public.pages(publish_at, expire_at);
CREATE INDEX IF NOT EXISTS idx_pages_status_publish
    ON public.pages(status, publish_at, expire_at);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_position
    ON public.page_sections(page_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status_created
    ON public.contact_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created
    ON public.contact_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_settings_category
    ON public.site_settings(category);

CREATE INDEX IF NOT EXISTS idx_media_assets_tags
    ON public.media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_bucket
    ON public.media_assets(bucket_name);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
    ON public.activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor
    ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_desc
    ON public.activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solar_packages_active_order
    ON public.solar_packages(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_solar_addons_active_order
    ON public.solar_addons(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_menus_location_active
    ON public.menus(location, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_parent
    ON public.menu_items(menu_id, parent_id, sort_order);

-- ----------------------------------------------------------------------------
-- 4. Updated-at triggers
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_pages_updated_at ON public.pages;
CREATE TRIGGER set_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_page_sections_updated_at ON public.page_sections;
CREATE TRIGGER set_page_sections_updated_at
    BEFORE UPDATE ON public.page_sections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER set_contact_inquiries_updated_at
    BEFORE UPDATE ON public.contact_inquiries
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_solar_packages_updated_at ON public.solar_packages;
CREATE TRIGGER set_solar_packages_updated_at
    BEFORE UPDATE ON public.solar_packages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_solar_addons_updated_at ON public.solar_addons;
CREATE TRIGGER set_solar_addons_updated_at
    BEFORE UPDATE ON public.solar_addons
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER set_media_assets_updated_at
    BEFORE UPDATE ON public.media_assets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_menus_updated_at ON public.menus;
CREATE TRIGGER set_menus_updated_at
    BEFORE UPDATE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Admin users view
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.admin_users_view
WITH (security_invoker = true)
AS
SELECT
    au.id,
    au.role AS admin_role,
    au.created_at AS admin_created_at,
    au.updated_at AS admin_updated_at,
    p.full_name,
    p.avatar_url,
    p.is_active,
    p.last_login_at,
    p.role AS profile_role
FROM public.admin_users au
LEFT JOIN public.profiles p ON p.id = au.id;

-- ----------------------------------------------------------------------------
-- 6. Enable Row Level Security
-- ----------------------------------------------------------------------------

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. RLS policies
-- ----------------------------------------------------------------------------

-- admin_users
DROP POLICY IF EXISTS "Admin manage admin_users" ON public.admin_users;
CREATE POLICY "Admin manage admin_users"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- pages: public can read only published pages within publish/expiry window
DROP POLICY IF EXISTS "Public read pages" ON public.pages;
CREATE POLICY "Public read pages"
    ON public.pages
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND (publish_at IS NULL OR publish_at <= now())
        AND (expire_at IS NULL OR expire_at > now())
    );

DROP POLICY IF EXISTS "Admin manage pages" ON public.pages;
CREATE POLICY "Admin manage pages"
    ON public.pages
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- page_sections
DROP POLICY IF EXISTS "Public read page_sections" ON public.page_sections;
CREATE POLICY "Public read page_sections"
    ON public.page_sections
    FOR SELECT
    TO anon, authenticated
    USING (
        is_visible = true
        AND EXISTS (
            SELECT 1
            FROM public.pages p
            WHERE p.id = page_sections.page_id
              AND p.status = 'published'
              AND (p.publish_at IS NULL OR p.publish_at <= now())
              AND (p.expire_at IS NULL OR p.expire_at > now())
        )
    );

DROP POLICY IF EXISTS "Admin manage page_sections" ON public.page_sections;
CREATE POLICY "Admin manage page_sections"
    ON public.page_sections
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- site_settings
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
    ON public.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true AND is_sensitive = false);

DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
CREATE POLICY "Admin manage site_settings"
    ON public.site_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- contact inquiries: public insert only; admin read/update
DROP POLICY IF EXISTS "Public insert inquiries" ON public.contact_inquiries;
CREATE POLICY "Public insert inquiries"
    ON public.contact_inquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin read inquiries"
    ON public.contact_inquiries
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin update inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin update inquiries"
    ON public.contact_inquiries
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- solar packages
DROP POLICY IF EXISTS "Public read solar_packages" ON public.solar_packages;
CREATE POLICY "Public read solar_packages"
    ON public.solar_packages
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage solar_packages" ON public.solar_packages;
CREATE POLICY "Admin manage solar_packages"
    ON public.solar_packages
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- solar addons
DROP POLICY IF EXISTS "Public read solar_addons" ON public.solar_addons;
CREATE POLICY "Public read solar_addons"
    ON public.solar_addons
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage solar_addons" ON public.solar_addons;
CREATE POLICY "Admin manage solar_addons"
    ON public.solar_addons
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- media assets
DROP POLICY IF EXISTS "Public read media_assets" ON public.media_assets;
CREATE POLICY "Public read media_assets"
    ON public.media_assets
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

DROP POLICY IF EXISTS "Admin manage media_assets" ON public.media_assets;
CREATE POLICY "Admin manage media_assets"
    ON public.media_assets
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- activity logs: admin read only; inserts are performed by SECURITY DEFINER function
DROP POLICY IF EXISTS "Admin read activity_logs" ON public.activity_logs;
CREATE POLICY "Admin read activity_logs"
    ON public.activity_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- menus
DROP POLICY IF EXISTS "Public read menus" ON public.menus;
CREATE POLICY "Public read menus"
    ON public.menus
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage menus" ON public.menus;
CREATE POLICY "Admin manage menus"
    ON public.menus
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- menu items
DROP POLICY IF EXISTS "Public read menu_items" ON public.menu_items;
CREATE POLICY "Public read menu_items"
    ON public.menu_items
    FOR SELECT
    TO anon, authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1
            FROM public.menus m
            WHERE m.id = menu_items.menu_id
              AND m.is_active = true
        )
    );

DROP POLICY IF EXISTS "Admin manage menu_items" ON public.menu_items;
CREATE POLICY "Admin manage menu_items"
    ON public.menu_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Audit triggers
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS audit_pages ON public.pages;
CREATE TRIGGER audit_pages
    AFTER INSERT OR UPDATE OR DELETE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_page_sections ON public.page_sections;
CREATE TRIGGER audit_page_sections
    AFTER INSERT OR UPDATE OR DELETE ON public.page_sections
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_site_settings ON public.site_settings;
CREATE TRIGGER audit_site_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_solar_packages ON public.solar_packages;
CREATE TRIGGER audit_solar_packages
    AFTER INSERT OR UPDATE OR DELETE ON public.solar_packages
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_solar_addons ON public.solar_addons;
CREATE TRIGGER audit_solar_addons
    AFTER INSERT OR UPDATE OR DELETE ON public.solar_addons
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_media_assets ON public.media_assets;
CREATE TRIGGER audit_media_assets
    AFTER INSERT OR UPDATE OR DELETE ON public.media_assets
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_admin_users ON public.admin_users;
CREATE TRIGGER audit_admin_users
    AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_menus ON public.menus;
CREATE TRIGGER audit_menus
    AFTER INSERT OR UPDATE OR DELETE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_menu_items ON public.menu_items;
CREATE TRIGGER audit_menu_items
    AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ----------------------------------------------------------------------------
-- 9. Storage bucket and policies
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'site-media',
    'site-media',
    true,
    10485760,
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read site-media" ON storage.objects;
CREATE POLICY "Public read site-media"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Admin upload site-media" ON storage.objects;
CREATE POLICY "Admin upload site-media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin update site-media" ON storage.objects;
CREATE POLICY "Admin update site-media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'site-media'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Admin delete site-media" ON storage.objects;
CREATE POLICY "Admin delete site-media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'site-media'
        AND public.is_admin()
    );

-- ----------------------------------------------------------------------------
-- 10. Initial site settings
-- ----------------------------------------------------------------------------

INSERT INTO public.site_settings (key, value, is_public, category, description)
VALUES
(
    'maintenance',
    '{
        "enabled": false,
        "message": "We are currently performing scheduled maintenance. Please check back soon.",
        "allowed_ips": []
    }'::jsonb,
    false,
    'maintenance',
    'Maintenance mode configuration'
),
(
    'branding',
    '{
        "logo_light": null,
        "logo_dark": null,
        "favicon": null,
        "primary_color": "#1606b8",
        "secondary_color": "#0ea5e9",
        "font_heading": "Inter",
        "font_body": "Inter"
    }'::jsonb,
    true,
    'branding',
    'Branding and visual identity settings'
),
(
    'seo',
    '{
        "site_name": "Solar Mechanics",
        "default_title": "Solar Mechanics | Solar Energy & Electrical Solutions",
        "default_description": "Your partner in solar power solutions, electrical services, and practical solar training.",
        "default_og_image": null,
        "twitter_handle": "",
        "google_site_verification": "",
        "robots_txt": "User-agent: *\nAllow: /"
    }'::jsonb,
    true,
    'seo',
    'Global SEO settings'
),
(
    'contact',
    '{
        "email": "solarmechanics.corporation@gmail.com",
        "phone": "+63 917 000 0000",
        "address": "Metro Manila, Philippines",
        "hours": "To be confirmed",
        "map_embed_url": "",
        "contact_form_enabled": true,
        "quote_form_enabled": true
    }'::jsonb,
    true,
    'contact',
    'Contact information and form settings'
)
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. Minimal grants for Supabase API roles
-- RLS remains the row-level authorization boundary.
-- ----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON
    public.pages,
    public.page_sections,
    public.site_settings,
    public.solar_packages,
    public.solar_addons,
    public.media_assets,
    public.menus,
    public.menu_items
TO anon, authenticated;

GRANT INSERT ON public.contact_inquiries TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.admin_users,
    public.profiles,
    public.pages,
    public.page_sections,
    public.site_settings,
    public.contact_inquiries,
    public.solar_packages,
    public.solar_addons,
    public.media_assets,
    public.menus,
    public.menu_items
TO authenticated;

GRANT SELECT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.admin_users_view TO authenticated;

-- The audit writer is called by triggers; do not expose direct execution.
REVOKE ALL ON FUNCTION public.log_activity(text, text, text, text, jsonb)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_trigger()
    FROM PUBLIC, anon, authenticated;

-- These functions are used by policies/triggers. Policy execution runs with
-- the function owner's privileges for SECURITY DEFINER functions.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

COMMIT;

-- ============================================================================
-- 12. Post-migration verification (run separately after successful migration)
-- ============================================================================
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'admin_users','profiles','pages','page_sections','site_settings',
--     'contact_inquiries','solar_packages','solar_addons','media_assets',
--     'activity_logs','menus','menu_items'
--   )
-- ORDER BY table_name;
--
-- SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS arguments
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'set_updated_at','is_admin','is_super_admin',
--     'log_activity','audit_trigger'
--   )
-- ORDER BY p.proname;
--
-- SELECT event_object_table, trigger_name
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;
--
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- ============================================================================
-- 13. First Super Admin bootstrap (run manually AFTER creating the Auth user)
-- ============================================================================
-- Replace the UUID below with the actual id from auth.users.
--
-- INSERT INTO public.admin_users (id, role)
-- VALUES ('YOUR-AUTH-USER-UUID', 'super_admin')
-- ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
--
-- INSERT INTO public.profiles (id, full_name, role, is_active)
-- VALUES ('YOUR-AUTH-USER-UUID', 'Super Admin', 'super_admin', true)
-- ON CONFLICT (id) DO UPDATE
-- SET full_name = EXCLUDED.full_name,
--     role = EXCLUDED.role,
--     is_active = true;
--
-- NOTE: The admin_users insert fires an audit trigger. The audit entry will
-- have a null user_id if run from the SQL editor without an authenticated JWT.
-- ============================================================================
