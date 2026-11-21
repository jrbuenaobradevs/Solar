import type { QuoteDraft } from "./quoteDraft";
import { recordInquiry } from "./cms";

export type QuoteSubmission = QuoteDraft & {
  name: string;
  email: string;
  phone: string;
  address: string;
  extraNotes: string;
};

export type QuoteResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

/**
 * Submits a quote request to Supabase.
 */
export async function submitQuote(payload: QuoteSubmission): Promise<QuoteResult> {
  if (!payload.name.trim() || !payload.email.trim() || !payload.phone.trim()) {
    return { ok: false, error: "Name, email, and contact number are required." };
  }

  const reference = `SM-${Date.now().toString().slice(-8)}`;
  const message = `Address: ${payload.address || "Not provided"}\n${payload.extraNotes || ""}\nEstimate: ${payload.estimate.dailyKwh.toFixed(1)} kWh/day, ${payload.estimate.solarKwp} kWp ${payload.estimate.recommendedType}.`;

  try {
    await recordInquiry({
      inquiry_type: "quote",
      full_name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      subject: "Solar quote request",
      message,
    });
  } catch (err) {
    console.error("Failed to submit quote:", err);
    return { ok: false, error: "Could not save this request. Please try again." };
  }

  return { ok: true, reference };
}