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
  panelWattageW: 550,

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
      id: "essential",
      name: "Essential Solar",
      audience: "Residential" as const,
      type: "On-Grid" as const,
      solar: 3.3,
      inverter: 3,
      battery: 0,
      panels: "6 × 550W mono panels",
      generation: 13.2,
      price: 198000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Solar panels and grid-tied inverter",
        "Roof mounting system",
        "Electrical protection",
        "Standard installation",
      ],
    },
    {
      id: "hybrid",
      name: "Home Hybrid",
      audience: "Residential" as const,
      type: "Hybrid" as const,
      solar: 5.5,
      inverter: 5,
      battery: 10.2,
      panels: "10 × 550W mono panels",
      generation: 22,
      price: 498000,
      priceIsPlaceholder: true,
      featured: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Solar panels and hybrid inverter",
        "10.2 kWh LFP battery",
        "Backup load subpanel",
        "Installation and commissioning",
      ],
    },
    {
      id: "business",
      name: "Business Solar",
      audience: "Commercial" as const,
      type: "On-Grid" as const,
      solar: 16.5,
      inverter: 15,
      battery: 0,
      panels: "30 × 550W mono panels",
      generation: 66,
      price: 928000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "Commercial-grade solar array",
        "Three-phase inverter",
        "Monitoring and protection",
        "Engineering and installation",
      ],
    },
    {
      id: "resilience",
      name: "Resilience Plus",
      audience: "Commercial" as const,
      type: "Hybrid" as const,
      solar: 11,
      inverter: 10,
      battery: 20.4,
      panels: "20 × 550W mono panels",
      generation: 44,
      price: 1098000,
      priceIsPlaceholder: true,
      warranty: "To be confirmed on quotation",
      includes: [
        "High-efficiency solar array",
        "Hybrid three-phase inverter",
        "20.4 kWh LFP storage",
        "Priority-load integration",
      ],
    },
  ],

  disclaimer:
    "Preliminary estimate only. Final design, equipment, and price require a technical site assessment. Solar yield varies with weather, orientation, shading, soiling, and equipment. Backup runtime is not guaranteed.",
} as const;

export type SolarCalibration = typeof solarCalibration;
export type SystemType = "Hybrid" | "On-Grid" | "Off-Grid";
export type CoverageTierId = (typeof solarCalibration.coverageTiers)[number]["id"];
export type SolarPackage = (typeof solarCalibration.packages)[number];
