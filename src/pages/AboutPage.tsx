import ContactCTA from "../components/ContactCTA";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";
import SectionTitle from "../components/SectionTitle";

function AboutPage() {
  return (
    <div className="page">
      <PageHero
        kicker="About Solar Mechanics"
        title="Solar energy, electrical services, and practical training."
        text="Solar Mechanics helps properties plan solar power, explore planned electrical services, and learn about practical solar training."
      />
      <section className="section">
        <div className="shell about-grid">
          <div>
            <SectionTitle kicker="Who we are" title="Helping properties plan cleaner power with clear estimates." />
            <p>
              We help homeowners and businesses estimate solar energy needs, compare system types,
              and request a technical quotation. Electrical services and a solar training center are
              planned alongside the solar supply and installation focus of this first release.
            </p>
            <div className="notice">
              <strong>Content still required:</strong> Add approved company history, licenses, leadership,
              service coverage, and verified project statistics before treating this as a public corporate profile.
            </div>
          </div>
          <div className="value-panel">
            <h3>Focus areas</h3>
            <span><Icon name="sun" /> Solar energy solutions</span>
            <span><Icon name="bolt" /> Electrical services (planned)</span>
            <span><Icon name="users" /> Renewable-energy education (planned)</span>
            <span><Icon name="shield" /> Technical assessment before installation</span>
          </div>
        </div>
      </section>
      <ContactCTA />
    </div>
  );
}

export default AboutPage;
