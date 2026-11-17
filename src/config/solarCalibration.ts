/**
 * SOLAR MECHANICS — CALCULATION & PRICING CALIBRATION
 * =====================================================
 * Edit THIS FILE to change how the public calculator sizes systems and
 * how illustrative PHP totals are computed. No other source files need
 * to change for routine rate or assumption updates.
 *
 * All monetary values are Philippine pesos (PHP).
 * All capacities are kWp (solar), kW (inverter), or kWh (battery).
 *
 * These numbers are DEVELOPMENT DEFAULTS for a preliminary estimate.
 * They are not an engineered design, an official quotation, or a
 * guarantee of production, savings, or backup runtime.
 *
 * Set `showIllustrativePricing` to false to hide PHP totals until
 * business-approved rates are confirmed.
 */

export const solarCalibration = {
  /** Set to false to hide all PHP figures in the calculator and package cards. */
  showIllustrativePricing: true,

  /**
   * Peak sun hours (kWh/kWp/day equivalent).
   * Philippine sites commonly range ~3.5–5.5 depending on location,
   * season, and shading. This is a single default, not a site survey.
   */
  peakSunHours: 4.0,

  /**
   * Overall performance factor (0–1) covering soiling, temperature,
   * wiring, inverter, and mismatch losses. Typical preliminary range 0.75–0.85.
   */
  performanceFactor: 0.8,

  /** Default panel module size used to convert kWp → panel count. */
  panelWattageW: 620,

  /** Floor for recommended PV capacity (kWp). */
  minimumSolarKwp: 2.2,

  /** Round PV capacity to this many decimal places. */
  solarDecimalPlaces: 1,

  /**
   * Indicative inverter sizing: inverter kW ≈ connected load (kW) × this factor.
   * Surge-heavy motor loads still need engineering review.
   */
  inverterLoadFactor: 1.25,
  minimumInverterKw: 3,

  /**
   * Indicative battery sizing when backup is requested:
   * kWh = (critical load kW × backup hours) / (usableDoD × roundTripEfficiency)
   * Shown as a preliminary figure, not a certified storage design.
   */
  batteryUsableDod: 0.8,
  batteryRoundTripEfficiency: 0.9,
  batteryDecimalPlaces: 1,

  /**
   * Lean / balanced / high-coverage multipliers applied to the base PV
   * (and battery, when backup is requested).
   */
  coverageTiers: [
    { id: "lean", label: "Lean", solarMultiplier: 0.8, batteryMultiplier: 0.7, coveragePercent: 65 },
    { id: "balanced", label: "Balanced", solarMultiplier: 1, batteryMultiplier: 1, coveragePercent: 82 },
    { id: "high", label: "High coverage", solarMultiplier: 1.25, batteryMultiplier: 1.3, coveragePercent: 95 },
  ] as const,

  /**
   * UNIT RATES — edit these to recalibrate calculator price breakdowns.
   * Totals are: sum of line items below, then VAT.
   */
  pricing: {
    currency: "PHP" as const,
    /** Installed solar array, per kWp of recommended capacity. */
    solarPerKwp: 38000,
    /** Inverter, per kW of recommended inverter size. */
    inverterPerKw: {
      "On-Grid": 18000,
      Hybrid: 26000,
      "Off-Grid": 28000,
    },
    /** Storage, per kWh of indicative battery size. Zero if no backup. */
    batteryPerKwh: 22000,
    /** Roof/ground mounting, per panel. */
    mountingPerPanel: 3500,
    /** Protection, cabling, and balance of system (fixed). */
    electricalFixed: 28000,
    /** Labor: base fee plus a per-kWp amount. */
    laborBase: 45000,
    laborPerKwp: 3500,
    /** Illustrative VAT rate applied to the subtotal. */
    vatRate: 0.12,
  },

  /**
   * Catalog packages shown on Home and Solar Solutions.
   * Change `price` here when list prices are updated.
   * `priceIsPlaceholder` keeps the UI labeled as not an official quote.
   */
  packages: [
    {
      id: "hybrid-5kw",
      name: "5KW Hybrid System",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 4.96,
      inverter: 5,
      battery: 15.36,
      panels: "8 × 620W bifacial panels",
      generation: 15.9,
      price: 337000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Entry-level hybrid for smaller homes",
        "8 × 620W bifacial panels (4.96 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "5 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-6kw",
      name: "6KW Hybrid System",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 6.2,
      inverter: 6,
      battery: 15.36,
      panels: "10 × 620W bifacial panels",
      generation: 19.8,
      price: 378000,
      priceIsPlaceholder: true,
      featured: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Most popular for Filipino homes",
        "10 × 620W bifacial panels (6.2 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 14 panels",
        "6 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-8kw",
      name: "8KW Hybrid System",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 8.68,
      inverter: 8,
      battery: 15.36,
      panels: "14 × 620W bifacial panels",
      generation: 27.8,
      price: 467000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "For medium homes with air conditioning units",
        "14 × 620W bifacial panels (8.68 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 20 panels",
        "8 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-10kw",
      name: "10KW Hybrid System",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 9.92,
      inverter: 10,
      battery: 15.36,
      panels: "16 × 620W bifacial panels",
      generation: 31.7,
      price: 533000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "16 × 620W bifacial panels (9.92 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 25 panels",
        "10 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-12kw",
      name: "12KW Hybrid System",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 12.4,
      inverter: 12,
      battery: 15.36,
      panels: "20 × 620W bifacial panels",
      generation: 39.7,
      price: 614000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Large capacity for homes or small businesses",
        "20 × 620W bifacial panels (12.4 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 30 panels",
        "12 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-16kw",
      name: "16KW Hybrid System",
      audience: "Commercial" as const,
      type: "Hybrid" as const,
      solar: 16.12,
      inverter: 16,
      battery: 15.36,
      panels: "26 × 620W bifacial panels",
      generation: 51.6,
      price: 760000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Commercial-grade system for high energy demand",
        "26 × 620W bifacial panels (16.12 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 41 panels",
        "16 kW hybrid inverter",
        "Installation and commissioning",
      ],
    },
    {
      id: "hybrid-18kw",
      name: "18KW Hybrid ON/OFF Grid System",
      audience: "Commercial" as const,
      type: "Hybrid" as const,
      solar: 18.6,
      inverter: 18,
      battery: 15.36,
      panels: "30 × 620W bifacial panels",
      generation: 59.5,
      price: 866000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "30 × 620W bifacial panels (18.6 kWp)",
        "15.36 kWh battery (1× 300AH 51.2V)",
        "Expandable up to 42 panels",
        "18 kW hybrid on/off-grid inverter",
        "Installation and commissioning",
      ],
    },
  ],

  /**
   * Optional extras shown at the bottom of Solar Solutions.
   * `price` is the starting list price; `priceMax` is the upper bound when brands vary.
   */
  addons: [
    {
      id: "battery-module",
      name: "Extra Battery Module",
      icon: "battery",
      spec: "314–330AH 51.2V LiFePO4 | brands: SRNE, Genix, Menred, CST, Fidus, Ginza",
      description: "Add storage for heavier nighttime use, from ₱110,000 (314AH) up to ₱125,000 (Ginza 330AH).",
      price: 110000,
      priceMax: 125000,
      priceIsFrom: true,
    },
    {
      id: "panel-pair",
      name: "Additional Solar Panels (Per Pair)",
      icon: "panel",
      spec: "2 × 620W bifacial panels | OSDA, Canadian, Seraphim, Solahestia | incl. mounting + cable + labor",
      description: "Add generation capacity to your setup.",
      price: 24000,
      priceIsFrom: false,
    },
  ],

  disclaimer:
    "Preliminary estimate only. Final design, equipment, and price require a technical site assessment. Solar yield varies with weather, orientation, shading, soiling, and equipment. Backup runtime is not guaranteed.",
} as const;

export type SolarCalibration = typeof solarCalibration;
export type SystemType = "Hybrid" | "On-Grid" | "Off-Grid";
export type CoverageTierId = (typeof solarCalibration.coverageTiers)[number]["id"];
export type SolarPackage = (typeof solarCalibration.packages)[number];
export type SolarAddon = (typeof solarCalibration.addons)[number];
