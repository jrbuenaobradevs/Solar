# Solar Mechanics

Public website for Solar Mechanics: solar supply and installation, a load-based calculator, and informational pages for planned electrical services and solar training.

## Local development

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

The Vite app serves on port **8443** (`http://localhost:8443`).

```bash
pnpm test
pnpm build
```

## Calibrate solar sizing and prices

Edit **`src/config/solarCalibration.ts`**. That file controls peak sun hours, performance factor, panel wattage, inverter and battery heuristics, PHP unit rates, VAT, whether prices are shown, and the package catalog. See comments in the file.

## Quotation submissions

There is no backend. Quote requests are stored in the browser (`sessionStorage`) and labeled as a development mock. They are not emailed.

## Placeholder content still required

- Verified phone, email, and service area
- Approved package prices (or set `showIllustrativePricing` to `false`)
- Real project photos and company credentials
# Admin CMS prototype

The public website runs at the Vite development URL. The CMS is available at `/admin` (for example `http://localhost:8443/admin`). No separate server or login is configured.

The dashboard edits nine page records and shared website settings, and lists contact/quote inquiries. Data is saved in this browser's `localStorage`; form requests do not reach the company or a server. Opening the site in another browser/profile will show its own initial seed. Page title/description fields are connected to the public routes, and home/about section text is connected as well. Image URLs are stored as section content; uploads and a shared media library are not implemented.

Run `npm run dev` to start Vite, `npm run build` for a production build, and `npm run preview` to preview the build. The existing development server may already be running. Database design and the seed catalog are documented in `docs/cms-schema.md` and `docs/cms-seed.json`.

Implemented: local CMS repository, responsive admin dashboard, page editor, shared company/contact settings, inquiry list/search/filter/detail/status/notes, public contact and quote inquiry capture, local preview links.

Simulated: persistence is per-browser localStorage/sessionStorage only; submitted messages are not emailed or transmitted.

Pending for production: Supabase schema deployment and repository, authentication/RLS, shared media uploads, audit log, full binding of every original page section/package/catalog field to the CMS, and verified company details.
