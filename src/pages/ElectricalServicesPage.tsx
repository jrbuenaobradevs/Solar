import { useEffect, useState } from "react";
import Button from "../components/Button";
import PageHero from "../components/PageHero";
import ServiceCard from "../components/ServiceCard";
import { electricalServices } from "../data/electricalServices";
import { getCmsPages, type CmsPage } from "../lib/cms";

function ElectricalServicesPage() {
  const [cms, setCms] = useState<CmsPage | null>(null);

  useEffect(() => {
    getCmsPages().then(pages => {
      const electricalPage = pages.find(p => p.id === 'electrical-services');
      if (electricalPage) setCms(electricalPage);
    });
  }, []);

  return (
    <div className="page">
      <PageHero
        kicker="Electrical Services"
        title={cms?.title ?? "Planned electrical supply and installation support."}
        text={cms?.description ?? "This page introduces future electrical service categories. It is not a booking, ordering, or work-order system. Availability of regulated electrical work is subject to confirmation."}
      />
      <section className="section">
        <div className="shell">
          <div className="notice">
            <strong>Planned services:</strong> The cards below are a service plan for later development. They do not confirm that each offering is currently available.
          </div>
          <div className="three-grid top-space">
            {electricalServices.map((item) => (
              <ServiceCard
                key={item.id}
                icon={item.icon}
                title={item.title}
                description={item.description}
                planned
              />
            ))}
          </div>
          <div className="action-row top-space">
            <Button to="/contact">Request information</Button>
            <Button variant="secondary" to="/quote">Get a Solar Quote</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ElectricalServicesPage;