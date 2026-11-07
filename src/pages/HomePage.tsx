import Button from "../components/Button";
import ContactCTA from "../components/ContactCTA";
import FAQSection from "../components/FAQSection";
import Icon from "../components/Icon";
import SectionTitle from "../components/SectionTitle";
import ServiceCard from "../components/ServiceCard";
import SolarPackageCard from "../components/SolarPackageCard";
import { solarCalibration } from "../config/solarCalibration";
import { homeFaqs } from "../data/faqs";
import { images } from "../data/images";

function HomePage() {
  const featured = solarCalibration.packages.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-shape" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Solar · Electrical · Training</span>
            <h1>Powering a Cleaner, <em>Brighter Tomorrow.</em></h1>
            <p>
              Your partner in solar power solutions, electrical services, and practical solar training.
              Explore solar systems designed around your energy needs.
            </p>
            <div className="action-row">
              <Button to="/solar-calculator">Calculate Your Solar Needs <Icon name="arrow" size={18} /></Button>
              <Button variant="secondary" to="/solar-solutions">Explore Our Services</Button>
            </div>
            <div className="benefit-strip">
              <span><Icon name="bolt" /> Solar supply and installation</span>
              <span><Icon name="building" /> Electrical services (planned)</span>
              <span><Icon name="users" /> Solar training (planned)</span>
            </div>
          </div>
          <div className="hero-media">
            <img src={images.hero} alt="Solar technician installing panels on a residential roof" />
            <span className="demo-photo">Representative solar installation photo</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionTitle kicker="What we offer" title="Three service areas. Solar is ready first." text="Solar Solutions is the functional path in this release. Electrical Services and the Solar Training Center are introduced as planned offerings." />
          <div className="three-grid">
            <ServiceCard
              icon="sun"
              title="Solar Solutions"
              description="Solar system supply, installation, energy estimation, and customized quotations."
              to="/solar-solutions"
              cta="Explore Solar Solutions"
            />
            <ServiceCard
              icon="bolt"
              title="Electrical Services"
              description="Electrical supplies and installation solutions for residential, commercial, and industrial projects."
              to="/electrical-services"
              cta="View Electrical Services"
              planned
            />
            <ServiceCard
              icon="users"
              title="Solar Training Center"
              description="Learn about solar photovoltaic systems, installation fundamentals, system sizing, and renewable-energy skills."
              to="/training-center"
              cta="Explore Training"
              planned
            />
          </div>
        </div>
      </section>

      <section className="section benefits">
        <div className="shell">
          <SectionTitle kicker="Why Solar Mechanics" title="Practical energy solutions, sized around your property." text="Every site is different. We start with your loads and usage, then a technical assessment confirms the design before any formal quotation." />
          <div className="four-grid">
            {[
              ["bolt", "Lower grid reliance", "Use more of the energy your property produces and reduce exposure to changing utility rates."],
              ["battery", "Backup when configured", "A properly sized hybrid system can keep selected critical loads running during outages. On-grid systems typically do not."],
              ["building", "Built around your property", "Residential, commercial, and industrial configurations based on consumption, goals, and site conditions."],
              ["shield", "Technical from day one", "Desktop estimates are a starting point. Installation follows engineering review and an approved quotation."],
            ].map(([icon, title, text]) => (
              <article className="benefit-card" key={title}>
                <span className="icon-box"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="shell">
          <SectionTitle
            kicker="Featured solar packages"
            title="A clear starting point for your solar journey."
            text="Placeholder catalog values from the calibration file. Final pricing requires technical assessment."
            centered
          />
          <div className="package-grid">
            {featured.map((item) => <SolarPackageCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionTitle kicker="How it works" title="From your first calculation to a formal quotation." />
          <div className="steps-grid">
            {[
              ["Calculate your energy use", "Add appliances, hours, and wattage to estimate daily and monthly consumption."],
              ["Review a preliminary system size", "See indicative PV capacity based on documented peak-sun and performance assumptions."],
              ["Request a customized quotation", "Send your estimate and contact details for technical review."],
              ["Site assessment", "An engineer validates the design before any approved quotation or installation."],
            ].map(([title, text], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FAQSection items={homeFaqs} />
      <ContactCTA />
    </>
  );
}

export default HomePage;
