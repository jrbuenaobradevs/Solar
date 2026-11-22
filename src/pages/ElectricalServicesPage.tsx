import { useEffect, useState } from "react"
import Button from "../components/Button"
import PageHero from "../components/PageHero"
import ServiceCard from "../components/ServiceCard"
import {
  getCmsPages,
  getPageSections,
  type CmsPage,
  type PageSection,
} from "../lib/cms"
import PageSectionRenderer from "../components/cms/PageSectionRenderer"

function ElectricalServicesPage() {
  const [cms, setCms] = useState<CmsPage | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCmsPages().then((pages) => {
        const electricalPage = pages.find((p) => p.id === "electrical-services")
        if (electricalPage) setCms(electricalPage)
      }),
      getPageSections("a0000000-0000-0000-0000-000000000005").then((sections) =>
        setSections(sections),
      ),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <PageHero
        kicker="Electrical Services"
        title={
          cms?.title ?? "Planned electrical supply and installation support."
        }
        text={
          cms?.description ??
          "This page introduces future electrical service categories. It is not a booking, ordering, or work-order system. Availability of regulated electrical work is subject to confirmation."
        }
      />
      <section className="section">
        <div className="shell">
          <div className="notice">
            <strong>Planned services:</strong> The cards below are a service
            plan for later development. They do not confirm that each offering
            is currently available.
          </div>
          {loading ? (
            <div className="three-grid top-space">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-icon" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text short" />
                </div>
              ))}
            </div>
          ) : sections.length > 0 ? (
            <div className="sections-container">
              {sections.map((section) => (
                <PageSectionRenderer key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="three-grid top-space">
              <ServiceCard
                icon="bolt"
                title="Electrical Supply and Materials"
                description="Sourcing and supply of electrical materials for residential, commercial, and industrial projects."
                planned
              />
              <ServiceCard
                icon="home"
                title="Residential Electrical Installation"
                description="Planned installation support for homes, including distribution and general power circuits."
                planned
              />
              <ServiceCard
                icon="building"
                title="Commercial Electrical Installation"
                description="Planned electrical fit-out support for offices, retail, and other commercial spaces."
                planned
              />
            </div>
          )}
          <div className="action-row top-space">
            <Button to="/contact">Request information</Button>
            <Button variant="secondary" to="/quote">
              Get a Solar Quote
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ElectricalServicesPage
