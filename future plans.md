# Future plans — Solar Mechanics

This document records work that is **out of scope for the current Vite + React site**. Today, catalog packages and calculator rates live in [`src/config/solarCalibration.ts`](src/config/solarCalibration.ts), courses in [`src/data/trainingCourses.ts`](src/data/trainingCourses.ts), electrical service cards in [`src/data/electricalServices.ts`](src/data/electricalServices.ts), and quote requests in browser `sessionStorage` ([`src/lib/quoteService.ts`](src/lib/quoteService.ts)).

Recommended datastore: **PostgreSQL** (hosted via **Supabase**, Singapore region, or Neon plus a small API). Use `JSONB` for nested calculator snapshots. Keep sizing formulas in [`src/lib/solarCalc.ts`](src/lib/solarCalc.ts); do not put business logic only in the database.

Public pages should **read** catalog data and **insert** leads. Staff should be the only roles that can change prices, stock, enrollments, or quote status.

---

## 1. Database setup and data migration

### Goals

- Persist hybrid packages, quote requests, and later shop/training records on a server.
- Stop treating `sessionStorage` as a quotation channel.
- Let staff update list prices without a code deploy.

### Setup

1. Create a Postgres project (Supabase preferred for auth, storage, and row-level security).
2. Add a backend or Supabase client so the browser never holds a service-role key.
3. Enable staff authentication (email or magic link). Public users do not need accounts for v1 quotes.
4. Regions: host in **Singapore** (or closer) for Philippine visitors.

### Suggested core tables

| Table | Purpose |
|---|---|
| `packages` | Hybrid catalog SKUs (name, audience, type, kWp, inverter kW, battery kWh, panel string, generation, price, featured, includes, expandability). |
| `calibration` | Optional single-row (or versioned) peak sun hours, performance factor, panel wattage, unit rates. |
| `quotes` | Lead + status (`pending_review` → site visit → quoted). Contact fields as columns; `payload jsonb` for appliances and estimate snapshot. |
| `contacts` | Contact-page inquiries (separate from solar quotes). |

### Migration of current data

1. Export the seven hybrid packages from `solarCalibration.packages` into a seed SQL or JSON fixture (`hybrid-5kw` … `hybrid-18kw`, PHP prices, 620W bifacial specs, 15.36 kWh battery).
2. Seed `calibration` from `peakSunHours`, `performanceFactor`, `panelWattageW`, and `pricing` if those move out of TypeScript.
3. Seed training course stubs from `trainingCourses` (ids `intro`, `install`, `storage`, `sizing`, `maintenance`, `safety`).
4. Seed electrical service categories from `electricalServices` if they become sellable or bookable later.
5. Do **not** migrate `sessionStorage` quotes; they are local mock data only.
6. Point Home and Solar Solutions at `packages` (featured = first three residential SKUs or `featured = true`). Keep a static fallback in code until the API is healthy.
7. Replace `submitQuote` with an authenticated insert; return a server-issued reference (`SM-…`) and email the team.

### Out of scope for this phase

- Full CMS for every page.
- Moving calculator math into SQL.
- Treating catalog prices as formal quotations (site assessment still required).

---

## 2. Future shop management

Electrical Services is informational only today. Shop management is the later path for **selling materials and kits** (panels, inverters, batteries, BOS), not for booking licensed electrical work.

### Goals

- Staff can maintain a product catalog, stock, and PHP prices.
- Customers can browse, add to cart, and place orders (pickup or delivery TBD).
- Orders are distinct from solar **quote requests** (installed systems stay on the quote workflow).

### Planned entities

| Table | Purpose |
|---|---|
| `products` | SKU, name, category (panel, inverter, battery, electrical, accessory), wattage/voltage attributes, description, images. |
| `product_prices` | PHP list price, VAT flag, effective dates. |
| `inventory` | On-hand qty, reserved qty, warehouse/location. |
| `orders` | Customer, status, totals, payment reference. |
| `order_items` | Product, qty, unit price snapshot. |

### Product phases

1. **Catalog only** — replace planned “Electrical Supply and Materials” with a read-only shop fed from `products`. No checkout.
2. **Inquiry cart** — customer submits a materials list; staff confirms stock and price (similar to quotes).
3. **Checkout** — payments (e.g. PayMongo / GCash), invoices, and inventory decrement. Add only after legal/tax process is defined.

### Rules

- Hybrid **packages** remain installation offers, not cart line items, unless a package is explicitly marked “supply-only”.
- Stock must never be shown as a guarantee of same-day availability until inventory is live.
- Images and datasheets go in object storage; database stores URLs.

---

## 3. Future training management

[`src/pages/TrainingCenterPage.tsx`](src/pages/TrainingCenterPage.tsx) lists proposed courses and sends people to Contact. It is not an LMS. Future work should add **schedules, enrollment, and staff admin** before full e-learning.

### Goals

- Publish real courses, batches, fees, and venues (or online links).
- Capture interest and paid enrollments instead of a generic contact form.
- Staff can mark attendance and issue certificates later.

### Planned entities

| Table | Purpose |
|---|---|
| `courses` | Migrated from `trainingCourses` plus duration, fee, delivery mode, published flag. |
| `course_sessions` | Start/end, capacity, instructor, location. |
| `enrollments` | Person, session, status (`interest` / `registered` / `paid` / `completed`). |
| `certificates` | Optional later: code, issued_at, file URL. |

### Product phases

1. **Interest list** — “Register interest” writes `enrollments` with status `interest`; no payment, no student login.
2. **Scheduled batches** — public session dates and remaining seats; staff confirm by email/phone.
3. **Enrollment + payment** — deposits, receipts, waitlist.
4. **LMS (last)** — lessons, quizzes, student accounts. Do not start here; the current page already states those are out of scope.

### Rules

- Do not publish accreditation, PRC/TESDA claims, or guaranteed job placement unless legally confirmed.
- Course copy can stay marketing-level until a session is `published`.
- Training payments stay separate from shop orders and solar quotes so refunds and reporting stay clear.

---

## Suggested order of work

1. Postgres + `packages` + `quotes` migration (unblocks live leads and price edits).
2. Shop catalog (read-only), then inquiry cart.
3. Training interest list and `course_sessions`, then paid enrollment.
4. LMS and certificates only after batches actually run.
