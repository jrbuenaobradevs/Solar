-- Comprehensive Seeder Script for Supabase
-- Populates pages, page sections, site settings, solar packages, and solar addons
-- based on the current local storage CMS and solar calibration module data.
-- Safe to re-run (uses ON CONFLICT DO UPDATE / DO NOTHING).

--------------------------------------------------
-- 1. SITE SETTINGS
--------------------------------------------------
INSERT INTO public.site_settings (key, value, is_public)
VALUES (
    'company',
    '{
      "companyName": "Solar Mechanics",
      "description": "Solar supply and installation planning for homes and businesses in the Philippines.",
      "address": "Metro Manila, Philippines",
      "phone": "+63 917 000 0000",
      "email": "hello@solarmechanics.example",
      "hours": "To be confirmed",
      "facebook": "",
      "instagram": "",
      "linkedin": ""
    }'::jsonb,
    true
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

--------------------------------------------------
-- 2. PAGES & SECTIONS
--------------------------------------------------

-- HOME PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Powering a Cleaner, Brighter Tomorrow.',
    'home',
    '/',
    'published',
    'Solar Mechanics | Solar Energy & Electrical Solutions',
    'Your partner in solar power solutions, electrical services, and practical solar training.'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    meta_description = EXCLUDED.meta_description,
    updated_at = now();

INSERT INTO public.page_sections (page_id, section_type, title, content, sort_order, is_visible)
VALUES
('a0000000-0000-0000-0000-000000000001', 'offer', 'Three service areas. Solar is ready first.', '{"body": "Solar Solutions is the functional path in this release. Electrical Services and the Training Center are introduced as planned offerings."}'::jsonb, 1, true),
('a0000000-0000-0000-0000-000000000001', 'why', 'Practical energy solutions, sized around your property.', '{"body": "Every site is different. We start with your loads and usage, then a technical assessment confirms the design before any formal quotation."}'::jsonb, 2, true)
ON CONFLICT DO NOTHING;


-- SOLAR SOLUTIONS PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Supply, installation, and a practical energy calculator.',
    'solar-solutions',
    '/solar-solutions',
    'published',
    'Solar Solutions & Packages | Solar Mechanics',
    'Compare hybrid, on-grid, and off-grid configurations, then estimate your loads.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();

INSERT INTO public.page_sections (page_id, section_type, title, content, sort_order, is_visible)
VALUES
('a0000000-0000-0000-0000-000000000002', 'types', 'Solar system types', '{"body": "On-grid, hybrid, and off-grid solutions with technical assessment before quotation."}'::jsonb, 1, true)
ON CONFLICT DO NOTHING;


-- SOLAR CALCULATOR PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'Estimate your energy use, then request a quotation.',
    'solar-calculator',
    '/solar-calculator',
    'published',
    'Solar Calculator | Solar Mechanics',
    'Add appliances first. Contact details are collected only when you request a quote.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


-- QUOTE PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'Send your estimate for technical review.',
    'quote',
    '/quote',
    'published',
    'Request a Quote | Solar Mechanics',
    'Your calculator results stay on this form. Submit for review.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


-- ELECTRICAL SERVICES PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'Planned electrical supply and installation support.',
    'electrical-services',
    '/electrical-services',
    'published',
    'Electrical Services (Planned) | Solar Mechanics',
    'This page introduces future electrical service categories.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


-- TRAINING CENTER PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'Proposed courses in solar knowledge and installation skills.',
    'training-center',
    '/training-center',
    'published',
    'Solar Training Center (Planned) | Solar Mechanics',
    'These topics are planned. Learn about solar photovoltaic systems.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


-- ABOUT PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000007',
    'Solar energy, electrical services, and practical training.',
    'about',
    '/about',
    'published',
    'About Us | Solar Mechanics',
    'Solar Mechanics helps properties plan solar power and electrical services.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();

INSERT INTO public.page_sections (page_id, section_type, title, content, sort_order, is_visible)
VALUES
('a0000000-0000-0000-0000-000000000007', 'who', 'Helping properties plan cleaner power with clear estimates.', '{"body": "We help homeowners and businesses estimate solar energy needs, compare system types, and request a technical quotation."}'::jsonb, 1, true)
ON CONFLICT DO NOTHING;


-- CONTACT PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000008',
    'Tell us about your property and energy goals.',
    'contact',
    '/contact',
    'published',
    'Contact Us | Solar Mechanics',
    'Get in touch with Solar Mechanics for your solar and electrical inquiries.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


-- PROJECTS PAGE
INSERT INTO public.pages (id, title, slug, path, status, meta_title, meta_description)
VALUES (
    'a0000000-0000-0000-0000-000000000009',
    'Representative solar installations.',
    'projects',
    '/projects',
    'published',
    'Projects Gallery | Solar Mechanics',
    'Representative solar installation case studies.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = now();


--------------------------------------------------
-- 3. SOLAR PACKAGES (from solarCalibration.ts)
--------------------------------------------------
INSERT INTO public.solar_packages (id, name, audience, type, solar, inverter, battery, panels, generation, price, includes, featured)
VALUES
('hybrid-5kw', '5KW Hybrid System', 'Residential', 'Hybrid', 4.96, 5, 15.36, '8 × 620W bifacial panels', 15.9, 337000, ARRAY['Entry-level hybrid for smaller homes', '8 × 620W bifacial panels (4.96 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', '5 kW hybrid inverter', 'Installation and commissioning'], false),
('hybrid-6kw', '6KW Hybrid System', 'Residential', 'Hybrid', 6.20, 6, 15.36, '10 × 620W bifacial panels', 19.8, 378000, ARRAY['Most popular for Filipino homes', '10 × 620W bifacial panels (6.2 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 14 panels', '6 kW hybrid inverter', 'Installation and commissioning'], true),
('hybrid-8kw', '8KW Hybrid System', 'Residential', 'Hybrid', 8.68, 8, 15.36, '14 × 620W bifacial panels', 27.8, 467000, ARRAY['For medium homes with air conditioning units', '14 × 620W bifacial panels (8.68 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 20 panels', '8 kW hybrid inverter', 'Installation and commissioning'], false),
('hybrid-10kw', '10KW Hybrid System', 'Residential', 'Hybrid', 9.92, 10, 15.36, '16 × 620W bifacial panels', 31.7, 533000, ARRAY['16 × 620W bifacial panels (9.92 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 25 panels', '10 kW hybrid inverter', 'Installation and commissioning'], false),
('hybrid-12kw', '12KW Hybrid System', 'Residential', 'Hybrid', 12.40, 12, 15.36, '20 × 620W bifacial panels', 39.7, 614000, ARRAY['Large capacity for homes or small businesses', '20 × 620W bifacial panels (12.4 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 30 panels', '12 kW hybrid inverter', 'Installation and commissioning'], false),
('hybrid-16kw', '16KW Hybrid System', 'Commercial', 'Hybrid', 16.12, 16, 15.36, '26 × 620W bifacial panels', 51.6, 760000, ARRAY['Commercial-grade system for high energy demand', '26 × 620W bifacial panels (16.12 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 41 panels', '16 kW hybrid inverter', 'Installation and commissioning'], false),
('hybrid-18kw', '18KW Hybrid ON/OFF Grid System', 'Commercial', 'Hybrid', 18.60, 18, 15.36, '30 × 620W bifacial panels', 59.5, 866000, ARRAY['30 × 620W bifacial panels (18.6 kWp)', '15.36 kWh battery (1× 300AH 51.2V)', 'Expandable up to 42 panels', '18 kW hybrid on/off-grid inverter', 'Installation and commissioning'], false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    audience = EXCLUDED.audience,
    type = EXCLUDED.type,
    solar = EXCLUDED.solar,
    inverter = EXCLUDED.inverter,
    battery = EXCLUDED.battery,
    panels = EXCLUDED.panels,
    generation = EXCLUDED.generation,
    price = EXCLUDED.price,
    includes = EXCLUDED.includes,
    featured = EXCLUDED.featured,
    updated_at = now();


--------------------------------------------------
-- 4. SOLAR ADDONS (from solarCalibration.ts)
--------------------------------------------------
INSERT INTO public.solar_addons (id, name, spec, price)
VALUES
('battery-module', 'Extra Battery Module', '314–330AH 51.2V LiFePO4 | brands: SRNE, Genix, Menred, CST, Fjiv, Ginza (from ₱110,000 to ₱125,000)', 110000),
('panel-pair', 'Additional Solar Panels (Per Pair)', '2 × 620W bifacial panels | OSDA, Canadian, Seraphim, Solahestia | incl. mounting + cable + labor', 24000)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    spec = EXCLUDED.spec,
    price = EXCLUDED.price,
    updated_at = now();
