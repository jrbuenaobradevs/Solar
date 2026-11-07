import type { BackupChoice, EstimateInput, SolarEstimate, SystemPreference } from "./solarCalc";
import type { ApplianceInput } from "./solarCalc";

const KEY = "solar-mechanics-quote-draft";

export type QuoteDraft = {
  propertyType: string;
  city: string;
  province: string;
  notes: string;
  bill: string;
  existingSolar: string;
  estimateInput: EstimateInput;
  estimate: SolarEstimate;
  preference: SystemPreference;
  backup: BackupChoice;
  appliances: ApplianceInput[];
};

export function saveQuoteDraft(draft: QuoteDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function loadQuoteDraft(): QuoteDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuoteDraft;
  } catch {
    return null;
  }
}

export function clearQuoteDraft() {
  sessionStorage.removeItem(KEY);
}
