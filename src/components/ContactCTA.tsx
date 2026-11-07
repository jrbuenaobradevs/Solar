import Button from "./Button";
import Icon from "./Icon";

function ContactCTA() {
  return (
    <section className="final-cta">
      <div className="shell">
        <div>
          <span>Let’s plan your system</span>
          <h2>Ready to estimate your solar needs?</h2>
        </div>
        <div className="action-row">
          <Button to="/solar-calculator">Calculate Your Solar Needs</Button>
          <Button variant="light" to="/quote">Get a Solar Quote <Icon name="arrow" size={17} /></Button>
        </div>
      </div>
    </section>
  );
}

export default ContactCTA;
