-- ============================================================================
-- Solar Mechanics - Unified Database Seeder
-- Compatible with: 20261121000000_unified_solar_mechanics_cms.sql
--
-- Seeds:
--   * Company site settings
--   * 9 CMS pages
--   * Page sections with stable UUIDs
--   * 7 solar packages
--   * 2 solar addons
--   * Header and footer navigation menus + menu items
--
-- Rerunnable: stable primary keys + ON CONFLICT DO UPDATE.
-- This script does not create Auth users or assign a Super Admin.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. COMPANY SITE SETTINGS
-- ----------------------------------------------------------------------------

INSERT INTO public.site_settings (
    key, value, is_public, category, description
)
VALUES (
    'company',
    '{
      "companyName": "Solar Mechanics",
      "description": "Solar supply and installation planning for homes and businesses in the Philippines.",
      "address": "Metro Manila, Philippines",
      "phone": "+63 917 000 0000",
      "email": "solarmechanics.corporation@gmail.com",
      "hours": "To be confirmed",
      "facebook": "",
      "instagram": "",
      "linkedin": ""
    }'::jsonb,
    true,
    'company',
    'Company information'
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    is_public = EXCLUDED.is_public,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    updated_at = now();

-- ----------------------------------------------------------------------------
-- 2. CMS PAGES
-- Stable page UUIDs are referenced by the page_sections records below.
-- ----------------------------------------------------------------------------

INSERT INTO public.pages (
    id, title, slug, path, status,
    meta_title, meta_description, template, sort_order
)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Powering a Cleaner, Brighter Tomorrow.',
    'home',
    '/',
    'published',
    'Solar Mechanics | Solar Energy & Electrical Solutions',
    'Your partner in solar power solutions, electrical services, and practical solar training.',
    'default',
    1
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Supply, installation, and a practical energy calculator.',
    'solar-solutions',
    '/solar-solutions',
    'published',
    'Solar Solutions & Packages | Solar Mechanics',
    'Compare hybrid, on-grid, and off-grid configurations, then estimate your loads.',
    'default',
    2
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Estimate your energy use, then request a quotation.',
    'solar-calculator',
    '/solar-calculator',
    'published',
    'Solar Calculator | Solar Mechanics',
    'Add appliances first. Contact details are collected only when you request a quote.',
    'default',
    3
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Send your estimate for technical review.',
    'quote',
    '/quote',
    'published',
    'Request a Quote | Solar Mechanics',
    'Your calculator results stay on this form. Submit for review.',
    'default',
    4
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Planned electrical supply and installation support.',
    'electrical-services',
    '/electrical-services',
    'published',
    'Electrical Services (Planned) | Solar Mechanics',
    'This page introduces future electrical service categories.',
    'default',
    5
),
(
    'a0000000-0000-0000-0000-000000000006',
    'Proposed courses in solar knowledge and installation skills.',
    'training-center',
    '/training-center',
    'published',
    'Solar Training Center (Planned) | Solar Mechanics',
    'These topics are planned. Learn about solar photovoltaic systems.',
    'default',
    6
),
(
    'a0000000-0000-0000-0000-000000000007',
    'Solar energy, electrical services, and practical training.',
    'about',
    '/about',
    'published',
    'About Us | Solar Mechanics',
    'Solar Mechanics helps properties plan solar power and electrical services.',
    'default',
    7
),
(
    'a0000000-0000-0000-0000-000000000008',
    'Tell us about your property and energy goals.',
    'contact',
    '/contact',
    'published',
    'Contact Us | Solar Mechanics',
    'Get in touch with Solar Mechanics for your solar and electrical inquiries.',
    'default',
    8
),
(
    'a0000000-0000-0000-0000-000000000009',
    'Representative solar installations.',
    'projects',
    '/projects',
    'published',
    'Projects Gallery | Solar Mechanics',
    'Representative solar installation case studies.',
    'default',
    9
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    path = EXCLUDED.path,
    status = EXCLUDED.status,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    template = EXCLUDED.template,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

-- ----------------------------------------------------------------------------
-- 3. PAGE SECTIONS
-- Explicit stable IDs make this section rerunnable without requiring an
-- additional UNIQUE(page_id, section_type) constraint.
-- ----------------------------------------------------------------------------

INSERT INTO public.page_sections (
    id, page_id, section_type, title, content,
    sort_order, is_visible, layout, settings
)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'offer',
    'Three service areas. Solar is ready first.',
    '{"body": "Solar Solutions is the functional path in this release. Electrical Services and the Training Center are introduced as planned offerings."}'::jsonb,
    1, true, 'default', '{}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'why',
    'Practical energy solutions, sized around your property.',
    '{"body": "Every site is different. We start with your loads and usage, then a technical assessment confirms the design before any formal quotation."}'::jsonb,
    2, true, 'default', '{}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'types',
    'Solar system types',
    '{"body": "On-grid, hybrid, and off-grid solutions with technical assessment before quotation."}'::jsonb,
    1, true, 'default', '{}'::jsonb
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000007',
    'who',
    'Helping properties plan cleaner power with clear estimates.',
    '{"body": "We help homeowners and businesses estimate solar energy needs, compare system types, and request a technical quotation."}'::jsonb,
    1, true, 'default', '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    page_id = EXCLUDED.page_id,
    section_type = EXCLUDED.section_type,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible,
    layout = EXCLUDED.layout,
    settings = EXCLUDED.settings,
    updated_at = now();

-- ----------------------------------------------------------------------------
-- 4. SOLAR PACKAGES
-- Prices are seeded as supplied in the original solarCalibration.ts data.
-- ----------------------------------------------------------------------------

INSERT INTO public.solar_packages (
    id, name, audience, type, solar, inverter, battery,
    panels, generation, price, includes, featured,
    description, specifications, is_active, display_order
)
VALUES
(
    'hybrid-5kw',
    '5KW Hybrid System',
    'Residential',
    'Hybrid',
    4.96, 5, 15.36,
    '8 × 620W bifacial panels',
    15.9,
    337000,
    ARRAY[
        'Entry-level hybrid for smaller homes',
        '8 × 620W bifacial panels (4.96 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        '5 kW hybrid inverter',
        'Installation and commissioning'
    ],
    false,
    'Entry-level hybrid solar package for smaller residential properties.',
    '{"panel_count": 8, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 5}'::jsonb,
    true,
    1
),
(
    'hybrid-6kw',
    '6KW Hybrid System',
    'Residential',
    'Hybrid',
    6.20, 6, 15.36,
    '10 × 620W bifacial panels',
    19.8,
    378000,
    ARRAY[
        'Most popular for Filipino homes',
        '10 × 620W bifacial panels (6.2 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 14 panels',
        '6 kW hybrid inverter',
        'Installation and commissioning'
    ],
    true,
    'Popular hybrid solar configuration for residential energy needs.',
    '{"panel_count": 10, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 6, "expandable_panel_count": 14}'::jsonb,
    true,
    2
),
(
    'hybrid-8kw',
    '8KW Hybrid System',
    'Residential',
    'Hybrid',
    8.68, 8, 15.36,
    '14 × 620W bifacial panels',
    27.8,
    467000,
    ARRAY[
        'For medium homes with air conditioning units',
        '14 × 620W bifacial panels (8.68 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 20 panels',
        '8 kW hybrid inverter',
        'Installation and commissioning'
    ],
    false,
    'Higher-capacity hybrid solar package for medium residential properties.',
    '{"panel_count": 14, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 8, "expandable_panel_count": 20}'::jsonb,
    true,
    3
),
(
    'hybrid-10kw',
    '10KW Hybrid System',
    'Residential',
    'Hybrid',
    9.92, 10, 15.36,
    '16 × 620W bifacial panels',
    31.7,
    533000,
    ARRAY[
        '16 × 620W bifacial panels (9.92 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 25 panels',
        '10 kW hybrid inverter',
        'Installation and commissioning'
    ],
    false,
    'Large residential hybrid solar package.',
    '{"panel_count": 16, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 10, "expandable_panel_count": 25}'::jsonb,
    true,
    4
),
(
    'hybrid-12kw',
    '12KW Hybrid System',
    'Residential',
    'Hybrid',
    12.40, 12, 15.36,
    '20 × 620W bifacial panels',
    39.7,
    614000,
    ARRAY[
        'Large capacity for homes or small businesses',
        '20 × 620W bifacial panels (12.4 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 30 panels',
        '12 kW hybrid inverter',
        'Installation and commissioning'
    ],
    false,
    'High-capacity hybrid solar package for larger properties.',
    '{"panel_count": 20, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 12, "expandable_panel_count": 30}'::jsonb,
    true,
    5
),
(
    'hybrid-16kw',
    '16KW Hybrid System',
    'Commercial',
    'Hybrid',
    16.12, 16, 15.36,
    '26 × 620W bifacial panels',
    51.6,
    760000,
    ARRAY[
        'Commercial-grade system for high energy demand',
        '26 × 620W bifacial panels (16.12 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 41 panels',
        '16 kW hybrid inverter',
        'Installation and commissioning'
    ],
    false,
    'Commercial-grade hybrid solar package for higher energy demand.',
    '{"panel_count": 26, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 16, "expandable_panel_count": 41}'::jsonb,
    true,
    6
),
(
    'hybrid-18kw',
    '18KW Hybrid ON/OFF Grid System',
    'Commercial',
    'Hybrid',
    18.60, 18, 15.36,
    '30 × 620W bifacial panels',
    59.5,
    866000,
    ARRAY[
        '30 × 620W bifacial panels (18.6 kWp)',
        '15.36 kWh battery (1× 300AH 51.2V)',
        'Expandable up to 42 panels',
        '18 kW hybrid on/off-grid inverter',
        'Installation and commissioning'
    ],
    false,
    'Large hybrid on/off-grid solar configuration for commercial applications.',
    '{"panel_count": 30, "panel_wattage": 620, "battery_capacity_kwh": 15.36, "inverter_capacity_kw": 18, "expandable_panel_count": 42}'::jsonb,
    true,
    7
)
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
    description = EXCLUDED.description,
    specifications = EXCLUDED.specifications,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = now();

-- ----------------------------------------------------------------------------
-- 5. SOLAR ADDONS
-- ----------------------------------------------------------------------------

INSERT INTO public.solar_addons (
    id, name, spec, price, description, is_active, display_order, category
)
VALUES
(
    'battery-module',
    'Extra Battery Module',
    '314–330AH 51.2V LiFePO4 | brands: SRNE, Genix, Menred, CST, Fjiv, Ginza (from ₱110,000 to ₱125,000)',
    110000,
    'Additional LiFePO4 battery capacity. Final price depends on selected brand and specification.',
    true,
    1,
    'battery'
),
(
    'panel-pair',
    'Additional Solar Panels (Per Pair)',
    '2 × 620W bifacial panels | OSDA, Canadian, Seraphim, Solahestia | incl. mounting + cable + labor',
    24000,
    'Two additional 620W bifacial solar panels, including mounting, cabling, and labor as specified.',
    true,
    2,
    'solar_panel'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    spec = EXCLUDED.spec,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    category = EXCLUDED.category,
    updated_at = now();

-- ----------------------------------------------------------------------------
-- 6. HEADER AND FOOTER MENUS
-- Stable IDs make menu creation and item updates repeatable.
-- ----------------------------------------------------------------------------

INSERT INTO public.menus (
    id, name, slug, description, location, is_active, sort_order
)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Main Navigation',
    'main-navigation',
    'Primary website navigation menu.',
    'header',
    true,
    1
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Footer Navigation',
    'footer-navigation',
    'Footer website navigation menu.',
    'footer',
    true,
    2
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

INSERT INTO public.menu_items (
    id, menu_id, parent_id, label, url, target,
    is_active, sort_order
)
VALUES
-- Header
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, 'Home', '/', '_self', true, 1),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', NULL, 'Solar Solutions', '/solar-solutions', '_self', true, 2),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', NULL, 'Electrical Services', '/electrical-services', '_self', true, 3),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', NULL, 'Training Center', '/training-center', '_self', true, 4),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', NULL, 'Projects', '/projects', '_self', true, 5),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', NULL, 'About', '/about', '_self', true, 6),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', NULL, 'Contact', '/contact', '_self', true, 7),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', NULL, 'Get a Quote', '/quote', '_self', true, 8),

-- Footer
('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', NULL, 'Home', '/', '_self', true, 1),
('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', NULL, 'Solar Solutions', '/solar-solutions', '_self', true, 2),
('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000002', NULL, 'Solar Calculator', '/solar-calculator', '_self', true, 3),
('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000002', NULL, 'Projects', '/projects', '_self', true, 4),
('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000002', NULL, 'About Us', '/about', '_self', true, 5),
('d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000002', NULL, 'Contact', '/contact', '_self', true, 6)
ON CONFLICT (id) DO UPDATE SET
    menu_id = EXCLUDED.menu_id,
    parent_id = EXCLUDED.parent_id,
    label = EXCLUDED.label,
    url = EXCLUDED.url,
    target = EXCLUDED.target,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

COMMIT;

-- ============================================================================
-- 7. OPTIONAL POST-SEED VERIFICATION
-- Run these queries separately after the seeder completes.
-- ============================================================================

-- SELECT key, category, is_public FROM public.site_settings ORDER BY key;
--
-- SELECT id, title, slug, path, status
-- FROM public.pages
-- ORDER BY sort_order, path;
--
-- SELECT p.slug, ps.section_type, ps.title, ps.sort_order
-- FROM public.page_sections ps
-- JOIN public.pages p ON p.id = ps.page_id
-- ORDER BY p.sort_order, ps.sort_order;
--
-- SELECT id, name, price, featured, is_active, display_order
-- FROM public.solar_packages
-- ORDER BY display_order;
--
-- SELECT id, name, price, category, is_active
-- FROM public.solar_addons
-- ORDER BY display_order;
--
-- SELECT m.name AS menu_name, mi.label, mi.url, mi.sort_order
-- FROM public.menu_items mi
-- JOIN public.menus m ON m.id = mi.menu_id
-- ORDER BY m.location, m.sort_order, mi.sort_order;
--
-- ============================================================================
-- END OF SEEDER
-- ============================================================================
