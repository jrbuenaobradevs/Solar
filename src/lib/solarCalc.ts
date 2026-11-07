import { solarCalibration, type CoverageTierId, type SystemType } from "../config/solarCalibration";
import { roundTo } from "./format";

export type ApplianceInput = {
  id: string;
  name: string;
  qty: number;
  watts: number;
  hours: number;
  notes?: string;
  critical?: boolean;
};

export type SystemPreference = SystemType | "Not sure";
export type BackupChoice = "Yes" | "No" | "Not sure";

export type EstimateInput = {
  appliances: ApplianceInput[];
  preference: SystemPreference;
  backup: BackupChoice;
  backupHours: number;
  includeAcInBackup: boolean;
  gridConnected: boolean;
  tierId: CoverageTierId;
};

export type PriceLine = { label: string; amount: number };

export type SolarEstimate = {
  connectedLoadW: number;
  dailyKwh: number;
  monthlyKwh: number;
  baseSolarKwp: number;
  solarKwp: number;
  panelCount: number;
  inverterKw: number;
  batteryKwh: number;
  recommendedType: SystemType;
  coveragePercent: number;
  estimatedDailyGenerationKwh: number;
  priceLines: PriceLine[];
  subtotal: number;
  vat: number;
  total: number;
  assumptions: string[];
};

function clampHours(hours: number) {
  if (!Number.isFinite(hours) || hours < 0) return 0;
  return Math.min(24, hours);
}

function clampPositive(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/** Daily energy (Wh) = Quantity × Wattage (W) × Daily usage hours */
export function dailyEnergyWh(appliance: ApplianceInput) {
  return clampPositive(appliance.qty) * clampPositive(appliance.watts) * clampHours(appliance.hours);
}

export function totalDailyKwh(appliances: ApplianceInput[]) {
  const wattHours = appliances.reduce((sum, item) => sum + dailyEnergyWh(item), 0);
  return wattHours / 1000;
}

export function monthlyKwh(daily: number) {
  return daily * 30;
}

export function connectedLoadW(appliances: ApplianceInput[]) {
  return appliances.reduce((sum, item) => sum + clampPositive(item.qty) * clampPositive(item.watts), 0);
}

/**
 * Estimated PV capacity (kWp) = Daily energy (kWh) / (Peak sun hours × Performance factor)
 */
export function estimatedPvKwp(daily: number) {
  const { peakSunHours, performanceFactor, minimumSolarKwp, solarDecimalPlaces } = solarCalibration;
  if (daily <= 0) return 0;
  const raw = daily / (peakSunHours * performanceFactor);
  return Math.max(minimumSolarKwp, roundTo(raw, solarDecimalPlaces));
}

export function recommendSystemType(input: Pick<EstimateInput, "preference" | "backup" | "gridConnected">): SystemType {
  if (input.preference !== "Not sure") return input.preference;
  if (!input.gridConnected) return "Off-Grid";
  if (input.backup === "Yes") return "Hybrid";
  return "On-Grid";
}

function criticalLoadW(input: EstimateInput) {
  return input.appliances
    .filter((item) => {
      if (!item.critical) return false;
      if (input.includeAcInBackup) return true;
      return !item.name.toLowerCase().includes("air");
    })
    .reduce((sum, item) => sum + clampPositive(item.qty) * clampPositive(item.watts), 0);
}

export function indicativeBatteryKwh(input: EstimateInput, type: SystemType) {
  if (type === "On-Grid" || input.backup === "No") return 0;
  const { batteryUsableDod, batteryRoundTripEfficiency, batteryDecimalPlaces } = solarCalibration;
  const energyKwh = (criticalLoadW(input) * clampHours(input.backupHours)) / 1000;
  if (energyKwh <= 0) return 0;
  const usable = batteryUsableDod * batteryRoundTripEfficiency;
  if (usable <= 0) return 0;
  return roundTo(energyKwh / usable, batteryDecimalPlaces);
}

export function indicativeInverterKw(loadW: number) {
  const { inverterLoadFactor, minimumInverterKw } = solarCalibration;
  if (loadW <= 0) return minimumInverterKw;
  return Math.max(minimumInverterKw, Math.ceil((loadW * inverterLoadFactor) / 1000));
}

export function buildEstimate(input: EstimateInput): SolarEstimate {
  const daily = totalDailyKwh(input.appliances);
  const monthly = monthlyKwh(daily);
  const loadW = connectedLoadW(input.appliances);
  const type = recommendSystemType(input);
  const tier = solarCalibration.coverageTiers.find((item) => item.id === input.tierId) ?? solarCalibration.coverageTiers[1];
  const baseSolar = estimatedPvKwp(daily);
  const solarKwp = daily <= 0 ? 0 : roundTo(baseSolar * tier.solarMultiplier, solarCalibration.solarDecimalPlaces);
  const baseBattery = indicativeBatteryKwh(input, type);
  const batteryKwh = roundTo(baseBattery * (baseBattery > 0 ? tier.batteryMultiplier : 0), solarCalibration.batteryDecimalPlaces);
  const inverterKw = indicativeInverterKw(loadW);
  const panelCount = solarKwp <= 0 ? 0 : Math.ceil((solarKwp * 1000) / solarCalibration.panelWattageW);
  const generation = roundTo(solarKwp * solarCalibration.peakSunHours * solarCalibration.performanceFactor, 1);

  const rates = solarCalibration.pricing;
  const panelCost = solarKwp * rates.solarPerKwp;
  const inverterCost = inverterKw * rates.inverterPerKw[type];
  const batteryCost = batteryKwh * rates.batteryPerKwh;
  const mounting = panelCount * rates.mountingPerPanel;
  const electrical = solarKwp > 0 ? rates.electricalFixed : 0;
  const labor = solarKwp > 0 ? rates.laborBase + solarKwp * rates.laborPerKwp : 0;

  const priceLines: PriceLine[] = [
    { label: "Solar panels", amount: panelCost },
    { label: `${type} inverter`, amount: inverterCost },
    { label: "Battery storage", amount: batteryCost },
    { label: "Mounting structures", amount: mounting },
    { label: "Protection and wiring", amount: electrical },
    { label: "Installation labor", amount: labor },
  ].filter((line) => line.amount > 0);

  const subtotal = priceLines.reduce((sum, line) => sum + line.amount, 0);
  const vat = subtotal * rates.vatRate;
  const total = subtotal + vat;

  return {
    connectedLoadW: loadW,
    dailyKwh: daily,
    monthlyKwh: monthly,
    baseSolarKwp: baseSolar,
    solarKwp,
    panelCount,
    inverterKw,
    batteryKwh,
    recommendedType: type,
    coveragePercent: tier.coveragePercent,
    estimatedDailyGenerationKwh: generation,
    priceLines,
    subtotal,
    vat,
    total,
    assumptions: [
      `Peak sun hours: ${solarCalibration.peakSunHours}`,
      `Performance factor: ${solarCalibration.performanceFactor}`,
      `Panel module: ${solarCalibration.panelWattageW} W`,
      `Battery usable DoD: ${solarCalibration.batteryUsableDod}`,
      `Battery round-trip efficiency: ${solarCalibration.batteryRoundTripEfficiency}`,
      solarCalibration.disclaimer,
    ],
  };
}

export function validateAppliance(appliance: ApplianceInput) {
  const errors: string[] = [];
  if (!appliance.name.trim()) errors.push("Appliance name is required.");
  if (!Number.isFinite(appliance.qty) || appliance.qty < 1) errors.push("Quantity must be at least 1.");
  if (!Number.isFinite(appliance.watts) || appliance.watts < 1) errors.push("Wattage must be at least 1 W.");
  if (!Number.isFinite(appliance.hours) || appliance.hours < 0 || appliance.hours > 24) {
    errors.push("Daily usage must be between 0 and 24 hours.");
  }
  return errors;
}
