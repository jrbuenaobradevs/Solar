import type { QuoteDraft } from "./quoteDraft";

export type QuoteSubmission = QuoteDraft & {
  name: string;
  email: string;
  phone: string;
  address: string;
  extraNotes: string;
};

export type QuoteResult =
  | { ok: true; reference: string; persisted: false }
  | { ok: false; error: string };

const STORE = "solar-mechanics-quotes-local";

/**
 * Development-only mock. Quotes are stored in this browser's sessionStorage
 * and are NOT sent to a server, emailed, or saved in a database.
 */
export async function submitQuote(payload: QuoteSubmission): Promise<QuoteResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!payload.name.trim() || !payload.email.trim() || !payload.phone.trim()) {
    return { ok: false, error: "Name, email, and contact number are required." };
  }

  const reference = `SM-${Date.now().toString().slice(-8)}`;
  const record = {
    reference,
    status: "Pending Review",
    submittedAt: new Date().toISOString(),
    payload,
  };

  try {
    const existing = JSON.parse(sessionStorage.getItem(STORE) || "[]") as unknown[];
    existing.push(record);
    sessionStorage.setItem(STORE, JSON.stringify(existing));
  } catch {
    return { ok: false, error: "Could not save this request in the browser. Try again." };
  }

  return { ok: true, reference, persisted: false };
}
