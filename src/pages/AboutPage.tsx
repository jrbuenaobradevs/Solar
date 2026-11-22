import { useEffect, useState } from "react"
import ContactCTA from "../components/ContactCTA"
import Icon from "../components/Icon"
import PageHero from "../components/PageHero"
import SectionTitle from "../components/SectionTitle"
import {
  getCmsPages,
  getPageSections,
  type CmsPage,
  type PageSection,
} from "../lib/cms"
import PageSectionRenderer from "../components/cms/PageSectionRenderer"

function AboutPage() {
  const [cms, setCms] = useState<CmsPage | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCmsPages().then((pages) => {
        const aboutPage = pages.find((p) => p.id === "about")
        if (aboutPage) setCms(aboutPage)
      }),
      getPageSections("a0000000-0000-0000-0000-000000000007").then((sections) =>
        setSections(sections),
      ),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <PageHero
        kicker="About Solar Mechanics"
        title={
          cms?.title ??
          "Solar energy, electrical services, and practical training."
        }
        text={
          cms?.description ??
          "Solar Mechanics helps properties plan solar power, explore planned electrical services, and learn about practical solar training."
        }
      />
      <section className="section">
        <div className="shell about-grid">
          <div>
            {loading ? (
              <>
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
              </>
            ) : sections.length > 0 ? (
              <div className="sections-container">
                {sections.map((section) => (
                  <PageSectionRenderer key={section.id} section={section} />
                ))}
              </div>
            ) : (
              <>
                <SectionTitle
                  kicker="Who we are"
                  title="Helping properties plan cleaner power with clear estimates."
                />
                <p>
                  We help homeowners and businesses estimate solar energy needs,
                  compare system types, and request a technical quotation.
                  Electrical services and a solar training center are planned
                  alongside the solar supply and installation focus of this
                  first release.
                </p>
                <div className="notice">
                  <strong>Content still required:</strong> Add approved company
                  history, licenses, leadership, service coverage, and verified
                  project statistics before treating this as a public corporate
                  profile.
                </div>
              </>
            )}
          </div>
          <div className="value-panel">
            <h3>Focus areas</h3>
            <span>
              <Icon name="sun" /> Solar energy solutions
            </span>
            <span>
              <Icon name="bolt" /> Electrical services (planned)
            </span>
            <span>
              <Icon name="users" /> Renewable-energy education (planned)
            </span>
            <span>
              <Icon name="shield" /> Technical assessment before installation
            </span>
          </div>
        </div>
      </section>
      <ContactCTA />
    </div>
  )
}

export default AboutPage
