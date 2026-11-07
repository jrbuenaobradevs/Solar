import { describe, expect, it } from "vitest";
import { solarCalibration } from "../config/solarCalibration";
import {
  buildEstimate,
  connectedLoadW,
  dailyEnergyWh,
  estimatedPvKwp,
  monthlyKwh,
  recommendSystemType,
  totalDailyKwh,
  validateAppliance,
} from "./solarCalc";

const fridge = { id: "1", name: "Refrigerator", qty: 1, watts: 150, hours: 12, critical: true };

describe("energy formulas", () => {
  it("computes daily Wh as qty × watts × hours", () => {
    expect(dailyEnergyWh(fridge)).toBe(1800);
  });

  it("rejects hours above 24", () => {
    expect(dailyEnergyWh({ ...fridge, hours: 30 })).toBe(150 * 1 * 24);
  });

  it("treats negative inputs as zero", () => {
    expect(dailyEnergyWh({ ...fridge, qty: -2, watts: -10, hours: -3 })).toBe(0);
  });

  it("sums daily kWh and monthly kWh", () => {
    const daily = totalDailyKwh([fridge, { id: "2", name: "Fan", qty: 2, watts: 65, hours: 8 }]);
    expect(daily).toBeCloseTo(2.84, 5);
    expect(monthlyKwh(daily)).toBeCloseTo(85.2, 5);
  });

  it("computes connected load in watts", () => {
    expect(connectedLoadW([fridge, { id: "2", name: "Fan", qty: 2, watts: 65, hours: 8 }])).toBe(280);
  });

  it("sizes PV from daily kWh / (PSH × performance factor)", () => {
    const daily = 16;
    const expected = daily / (solarCalibration.peakSunHours * solarCalibration.performanceFactor);
    expect(estimatedPvKwp(daily)).toBeGreaterThanOrEqual(expected);
    expect(estimatedPvKwp(0)).toBe(0);
  });
});

describe("system recommendation", () => {
  it("keeps an explicit preference", () => {
    expect(recommendSystemType({ preference: "Off-Grid", backup: "No", gridConnected: true })).toBe("Off-Grid");
  });

  it("recommends hybrid when backup is requested and preference is unsure", () => {
    expect(recommendSystemType({ preference: "Not sure", backup: "Yes", gridConnected: true })).toBe("Hybrid");
  });

  it("recommends off-grid when there is no utility connection", () => {
    expect(recommendSystemType({ preference: "Not sure", backup: "No", gridConnected: false })).toBe("Off-Grid");
  });
});

describe("buildEstimate", () => {
  it("returns zero solar when there are no appliances", () => {
    const estimate = buildEstimate({
      appliances: [],
      preference: "On-Grid",
      backup: "No",
      backupHours: 4,
      includeAcInBackup: false,
      gridConnected: true,
      tierId: "balanced",
    });
    expect(estimate.solarKwp).toBe(0);
    expect(estimate.total).toBe(0);
  });

  it("applies VAT to the subtotal when pricing is generated", () => {
    const estimate = buildEstimate({
      appliances: [fridge],
      preference: "Hybrid",
      backup: "Yes",
      backupHours: 4,
      includeAcInBackup: false,
      gridConnected: true,
      tierId: "balanced",
    });
    expect(estimate.subtotal).toBeGreaterThan(0);
    expect(estimate.vat).toBeCloseTo(estimate.subtotal * solarCalibration.pricing.vatRate, 6);
    expect(estimate.total).toBeCloseTo(estimate.subtotal + estimate.vat, 6);
  });
});

describe("validateAppliance", () => {
  it("flags empty name, low qty, and hours over 24", () => {
    const errors = validateAppliance({ id: "x", name: " ", qty: 0, watts: 0, hours: 25 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
