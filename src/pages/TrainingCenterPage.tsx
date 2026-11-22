import { useEffect, useState } from "react"
import Button from "../components/Button"
import PageHero from "../components/PageHero"
import ServiceStatusBadge from "../components/ServiceStatusBadge"
import {
  getCmsPages,
  getPageSections,
  type CmsPage,
  type PageSection,
} from "../lib/cms"
import PageSectionRenderer from "../components/cms/PageSectionRenderer"

function TrainingCenterPage() {
  const [cms, setCms] = useState<CmsPage | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCmsPages().then((pages) => {
        const trainingPage = pages.find((p) => p.id === "training-center")
        if (trainingPage) setCms(trainingPage)
      }),
      getPageSections("a0000000-0000-0000-0000-000000000006").then((sections) =>
        setSections(sections),
      ),
    ]).finally(() => setLoading(false))
  }, [])

  const fallbackCourses = [
    {
      id: "intro",
      title: "Introduction to Solar Photovoltaic Systems",
      audience: "Beginners and property owners",
      description:
        "Core concepts of solar PV, system components, and how a grid-tied or hybrid system is put together.",
    },
    {
      id: "install",
      title: "Solar Panel Installation Fundamentals",
      audience: "Technicians and installers in training",
      description:
        "Mounting, layout, and installation fundamentals for rooftop solar arrays.",
    },
    {
      id: "storage",
      title: "Inverter and Battery System Fundamentals",
      audience: "Technicians and designers",
      description:
        "How inverters and storage interact with solar generation and backup loads.",
    },
    {
      id: "sizing",
      title: "Solar Energy Calculation and System Sizing",
      audience: "Designers and sales engineers",
      description:
        "Load assessment, preliminary kWp sizing, and the limits of desktop estimates.",
    },
    {
      id: "maintenance",
      title: "Solar System Maintenance and Troubleshooting",
      audience: "Operations and field staff",
      description:
        "Inspection, cleaning, and common fault-finding practices for installed systems.",
    },
    {
      id: "safety",
      title: "Solar Safety and Installation Best Practices",
      audience: "All field personnel",
      description:
        "Electrical and rooftop safety practices for solar installation work.",
    },
  ]

  return (
    <div className="page">
      <PageHero
        kicker="Solar Training Center"
        title={
          cms?.title ??
          "Proposed courses in solar knowledge and installation skills."
        }
        text={
          cms?.description ??
          "These topics are planned. This page is not a learning management system. No schedules, fees, duration, accreditation, or enrollment seats are published here."
        }
      />
      <section className="section">
        <div className="shell">
          <div className="notice">
            <strong>Coming soon:</strong> Register interest through Contact Us.
            Student accounts, lessons, quizzes, payments, and certificates are
            out of scope for this release.
          </div>
          {loading ? (
            <div className="three-grid top-space">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-badge" />
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text short" />
                  <div className="skeleton skeleton-button" />
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
              {fallbackCourses.map((course) => (
                <article className="service-card" key={course.id}>
                  <ServiceStatusBadge label="Coming Soon" />
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <small className="audience">
                    Intended audience: {course.audience}
                  </small>
                  <Button variant="secondary" to="/contact">
                    Register interest
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default TrainingCenterPage
