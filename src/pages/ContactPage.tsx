import { useEffect, useState, type ReactNode } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";
import { getSiteSettings, recordInquiry, type SiteSettings } from "../lib/cms";

function Field({ label, children, required, wide }: { label: string; children: ReactNode; required?: boolean; wide?: boolean }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}{required && <b> *</b>}</span>
      {children}
    </label>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);

    try {
      await recordInquiry({
        inquiry_type: "contact",
        full_name: String(values.get("name") || ""),
        email: String(values.get("email") || ""),
        phone: String(values.get("phone") || ""),
        subject: String(values.get("subject") || "General inquiry"),
        message: String(values.get("message") || ""),
      });
      setSent(true);
    } catch (err) {
      console.error("Failed to submit contact form:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="page">
      <PageHero
        kicker="Contact Us"
        title="Tell us about your property and energy goals."
        text="For a solar quotation with your load estimate attached, use Get a Solar Quote after the calculator."
      />
      <section className="section">
        <div className="shell contact-grid">
          <div>
            <h2>Contact Solar Mechanics</h2>
            <p>{settings?.description ?? "Solar supply and installation planning for homes and businesses in the Philippines."}</p>
            <dl>
              <div><dt>Phone</dt><dd>{settings?.phone ?? "+63 917 000 0000"}</dd></div>
              <div><dt>Email</dt><dd>{settings?.email ?? "hello@solarmechanics.example"}</dd></div>
              <div><dt>Service area</dt><dd>{settings?.address ?? "Metro Manila, Philippines"}</dd></div>
            </dl>
            <div className="action-row top-space">
              <Button to="/solar-calculator">Calculate Your Solar Needs</Button>
              <Button variant="secondary" to="/quote">Get a Solar Quote</Button>
            </div>
          </div>
          {sent ? (
            <div className="success-card compact-success">
              <span><Icon name="check" /></span>
              <h2>Message sent successfully</h2>
              <p>We'll get back to you soon.</p>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <Field label="Full name" required><input name="name" required /></Field>
              <Field label="Email address" required><input name="email" type="email" required /></Field>
              <Field label="Contact number" required><input name="phone" required /></Field>
              <Field label="Topic">
                <select name="subject">
                  <option>Solar quotation</option>
                  <option>Electrical services interest</option>
                  <option>Training interest</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Message" wide><textarea name="message" rows={5} /></Field>
              <Button type="submit">Send Message <Icon name="arrow" size={17} /></Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default ContactPage;