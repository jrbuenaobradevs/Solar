import { useState, type ReactNode } from "react";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";

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

  return (
    <div className="page">
      <PageHero
        kicker="Contact Us"
        title="Tell us about your property and energy goals."
        text="For a solar quotation with your load estimate attached, use Get a Solar Quote after the calculator. This form is a local prototype and does not send email."
      />
      <section className="section">
        <div className="shell contact-grid">
          <div>
            <h2>Contact Solar Mechanics</h2>
            <p>Replace the placeholders below with verified company channels before launch.</p>
            <dl>
              <div><dt>Phone</dt><dd>+63 917 000 0000</dd></div>
              <div><dt>Email</dt><dd>hello@solarmechanics.example</dd></div>
              <div><dt>Service area</dt><dd>To be confirmed</dd></div>
            </dl>
            <div className="action-row top-space">
              <Button to="/solar-calculator">Calculate Your Solar Needs</Button>
              <Button variant="secondary" to="/quote">Get a Solar Quote</Button>
            </div>
          </div>
          {sent ? (
            <div className="success-card compact-success">
              <span><Icon name="check" /></span>
              <h2>Message prepared locally</h2>
              <p>Prototype only — nothing was transmitted to a server.</p>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field label="Full name" required><input required /></Field>
              <Field label="Email address" required><input type="email" required /></Field>
              <Field label="Contact number" required><input required /></Field>
              <Field label="Topic">
                <select>
                  <option>Solar quotation</option>
                  <option>Electrical services interest</option>
                  <option>Training interest</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Message" wide><textarea rows={5} /></Field>
              <Button type="submit">Prepare Message <Icon name="arrow" size={17} /></Button>
              <small>Simulated form — no information will be transmitted.</small>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
