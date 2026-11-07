import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";
import { solarCalibration } from "../config/solarCalibration";
import { peso } from "../lib/format";
import { loadQuoteDraft } from "../lib/quoteDraft";
import { submitQuote } from "../lib/quoteService";

function Field({ label, children, required, wide }: { label: string; children: ReactNode; required?: boolean; wide?: boolean }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}{required && <b> *</b>}</span>
      {children}
    </label>
  );
}

function QuotePage() {
  const draft = loadQuoteDraft();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [extraNotes, setExtraNotes] = useState(draft?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ reference: string } | null>(null);
  const submitted = useRef(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (submitted.current || busy) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and contact number are required.");
      return;
    }
    if (!draft) {
      setError("No calculator results were found. Please complete the solar calculator first, or continue with contact-only details from the Contact page.");
      return;
    }
    setBusy(true);
    submitted.current = true;
    const response = await submitQuote({
      ...draft,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      extraNotes: extraNotes.trim(),
    });
    setBusy(false);
    if (!response.ok) {
      submitted.current = false;
      setError(response.error);
      return;
    }
    setResult({ reference: response.reference });
  };

  if (result) {
    return (
      <div className="page">
        <PageHero kicker="Quote request" title="Your request is prepared in this browser." text="This prototype does not email Solar Mechanics or save data on a server. Copy your reference if you need it." />
        <section className="section compact">
          <div className="shell">
            <div className="success-card">
              <span><Icon name="check" size={30} /></span>
              <h2>Local reference created</h2>
              <p>Reference: <strong>{result.reference}</strong> · Status: Pending Review</p>
              <p>No message was sent. Connect a backend before treating this as a live quotation channel.</p>
              <div className="action-row">
                <Button to="/">Return Home</Button>
                <Button variant="secondary" to="/solar-calculator">Run another estimate</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHero
        kicker="Get a Solar Quote"
        title="Send your estimate for technical review."
        text="Your calculator results stay on this form. Submission is stored only in this browser until a backend is connected."
      />
      <section className="section">
        <div className="shell contact-grid">
          <div>
            <h2>Estimate to include</h2>
            {draft ? (
              <div className="review-grid">
                <div>
                  <h3>Property</h3>
                  <p>{draft.propertyType}</p>
                  <p>{draft.city}, {draft.province}</p>
                  <p>{draft.appliances.length} appliances</p>
                </div>
                <div>
                  <h3>Preliminary sizing</h3>
                  <p>{draft.estimate.dailyKwh.toFixed(1)} kWh/day</p>
                  <p>{draft.estimate.solarKwp} kWp {draft.estimate.recommendedType}</p>
                  {solarCalibration.showIllustrativePricing && <p>{peso(draft.estimate.total)} illustrative</p>}
                </div>
              </div>
            ) : (
              <p>No saved calculator results. <Link to="/solar-calculator">Calculate your solar needs</Link> first so we can attach a load list to this request.</p>
            )}
            <div className="notice top-space">
              Development-only mock: quotes are not emailed and are not stored in a database.
            </div>
          </div>
          <form className="contact-form" onSubmit={onSubmit}>
            <Field label="Full name" required><input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Email address" required><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Field label="Contact number" required><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></Field>
            <Field label="Installation address" wide><textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
            <Field label="Additional requirements" wide><textarea rows={3} value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} /></Field>
            {error && <p className="field-help" role="alert">{error}</p>}
            <Button type="submit" disabled={busy || !draft}>{busy ? "Submitting…" : "Submit quote request"}</Button>
            {!draft && <small>Complete the calculator to enable submission.</small>}
          </form>
        </div>
      </section>
    </div>
  );
}

export default QuotePage;
