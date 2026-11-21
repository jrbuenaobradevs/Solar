# CMS data model and Supabase migration notes

The prototype stores one versioned JSON document in browser `localStorage` under `solar-mechanics-cms-v1`. `src/lib/cms.ts` owns seed data, types, reads, writes, and inquiry creation. UI components use that repository instead of talking to a backend. This is local to one browser profile and is not shared with other administrators.

This document describes the finalized Supabase database schema for production use.

## Proposed PostgreSQL tables

All primary keys use UUID unless a stable content key is more useful. Use `timestamptz` in UTC. `created_at` defaults to `now()`; `updated_at` is maintained by a trigger.

| Table | Columns and constraints | Indexes / relationships |
| --- | --- | --- |
| `admin_users` | `id uuid PK references auth.users(id) on delete cascade`, `role text not null default 'editor' check (role in ('super_admin','admin','editor'))`, timestamps | Unique auth identity via PK; role checked server-side with RLS. Supabase Auth owns credentials. |
| `pages` | `id uuid PK`, `title text not null`, `slug text not null unique`, `path text not null unique`, `status text not null default 'published' check (status in ('draft','published','archived'))`, `meta_title text default ''`, `meta_description text default ''`, timestamps | Unique `slug`, `path`; index `(status, path)`. |
| `page_sections` | `id uuid PK`, `page_id uuid not null references pages(id) on delete cascade`, `section_type text not null`, `title text not null default ''`, `content jsonb default '{}'`, `sort_order integer not null default 0`, `is_visible boolean default true`, timestamps | Index `(page_id, sort_order)`. Ordered editable sections. |
| `site_settings` | `id uuid PK`, `key text not null unique`, `value jsonb not null default '{}'`, `is_public boolean default false`, `updated_at timestamptz` | Single row per setting key; seed `company` as one JSON object to avoid duplicating shared contact values. |
| `contact_inquiries` | `id uuid PK`, `inquiry_type text not null check (inquiry_type in ('contact','quote'))`, `full_name text not null`, `email text not null`, `phone text not null default ''`, `subject text not null default ''`, `message text not null default ''`, `status text not null default 'new' check (status in ('new','in_progress','contacted','completed','cancelled'))`, `metadata jsonb default '{}'`, timestamps | Indexes `(status, created_at desc)`, `created_at desc`. Public insert policy should allow only validated form submissions; admin reads/updates require authenticated role. |
| `solar_packages` | `id text PK`, `name text not null`, `audience text not null`, `type text not null`, `solar numeric(12,2) not null`, `inverter numeric(12,2) not null`, `battery numeric(12,2) not null`, `panels text not null`, `generation numeric(12,2) not null`, `price numeric(12,2) not null`, `includes text[] not null`, `featured boolean default false`, timestamps | Public read; admin manage. |
| `solar_addons` | `id text PK`, `name text not null`, `spec text not null`, `price numeric(12,2) not null`, timestamps | Public read; admin manage. |
| `media_assets` | `id uuid PK`, `file_name text not null`, `storage_path text not null unique`, `bucket_name text not null default 'site-media'`, `file_type text`, `file_size bigint default 0`, `title text default ''`, `alt_text text default ''`, `uploaded_by uuid references auth.users(id) on delete set null`, `is_public boolean default true`, timestamps | Unique `storage_path`; FK used by sections when an asset library is introduced. Not needed for initial URL-based content editing. |
| `activity_logs` | `id uuid PK`, `user_id uuid references auth.users(id) on delete set null`, `action text not null`, `entity_type text not null`, `entity_id uuid`, `description text not null`, `metadata jsonb default '{}'`, `created_at timestamptz not null default now()` | Indexes `(entity_type, entity_id, created_at desc)` and `(user_id, created_at desc)`. Append-only; don't cascade-delete audit history. |

## Seed data

The repeatable prototype seeder is the stable `pages` and `settings` constants in `src/lib/cms.ts`; `getCms()` initializes an empty browser store from these records and stable page IDs (`home`, `solar-solutions`, `solar-calculator`, `quote`, `electrical-services`, `training-center`, `about`, `contact`, `projects`). Writes replace the one versioned record and do not append seed rows, so repeated initialization does not duplicate content. Inquiry data is intentionally empty. Existing package, FAQ, course, appliance, service, and image records remain in their original source modules; they are not copied into a second competing catalog.

## Migration boundary

Replace repository functions in `src/lib/cms.ts` with Supabase queries. Keep the `CmsPage`, `SiteSettings`, and `Inquiry` shapes as DTOs. Move public submission validation to an Edge Function or narrowly scoped RLS insert policy. Do not expose a service role key in the browser. Add authenticated admin access, RLS, audit writes, and storage upload policies before production use.

## Migration execution instructions

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-id <your-project-id>`
4. Apply migration: `supabase migration up`
5. Apply seed: `supabase db seed --seed-data supabase/seed.sql`

## Seed execution instructions

The seed file (`supabase/seed.sql`) contains:
- Solar package records with deterministic IDs
- Solar addon records with deterministic IDs
- No administrator accounts or credentials

Run: `supabase db seed`

## Environment variable requirements

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes | Client-side key |
| `SUPABASE_SECRET_KEY` | Server-only | Secret key for Edge Functions |

## Security limitations

- RLS policies are enabled on all tables
- Public users cannot read admin records
- Public users cannot update or delete inquiries
- Activity logs are read-only for admins
- Storage bucket policies restrict upload to authenticated admins
- Service role key must never be exposed to frontend code