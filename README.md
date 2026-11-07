# Solar Mechanics

Public website for Solar Mechanics (presented in association with EEC Builders Corp.): solar supply and installation, a load-based calculator, and informational pages for planned electrical services and solar training.

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
- Legal confirmation of the EEC Builders Corp. relationship
