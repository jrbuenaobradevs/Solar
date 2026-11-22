import { useEffect, useState } from "react"
import PageHero from "../components/PageHero"
import { images } from "../data/images"
import {
  getCmsPages,
  getPageSections,
  type CmsPage,
  type PageSection,
} from "../lib/cms"
import PageSectionRenderer from "../components/cms/PageSectionRenderer"

const fallbackProjects = [
  {
    category: "Residential",
    title: "5.5 kWp Hybrid",
    location: "Representative site",
    image: images.home,
  },
  {
    category: "Commercial",
    title: "16.5 kWp On-Grid",
    location: "Representative site",
    image: images.commercial,
  },
  {
    category: "Residential",
    title: "3.3 kWp On-Grid",
    location: "Representative site",
    image: images.install,
  },
  {
    category: "Commercial",
    title: "11 kWp Hybrid",
    location: "Representative site",
    image: images.commercial,
  },
]

function ProjectsPage() {
  const [cms, setCms] = useState<CmsPage | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    Promise.all([
      getCmsPages().then((pages) => {
        const projectsPage = pages.find((p) => p.id === "projects")
        if (projectsPage) setCms(projectsPage)
      }),
      getPageSections("a0000000-0000-0000-0000-000000000009").then((sections) =>
        setSections(sections),
      ),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <PageHero
        kicker="Projects"
        title={cms?.title ?? "Representative solar installations."}
        text={
          cms?.description ??
          "Photos are stock imagery used for layout. They are not verified Solar Mechanics project records and must be replaced with approved assets."
        }
      />
      <section className="section">
        <div className="shell">
          {loading ? (
            <div className="project-grid loading">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-image" />
                  <div className="skeleton skeleton-text short" />
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
            <>
              <div className="filter-tabs">
                {["All", "Residential", "Commercial"].map((x) => (
                  <button
                    type="button"
                    className={filter === x ? "active" : ""}
                    key={x}
                    onClick={() => setFilter(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="project-grid">
                {fallbackProjects
                  .filter((x) => filter === "All" || x.category === filter)
                  .map((x, i) => (
                    <article className="project-card" key={`${x.title}${i}`}>
                      <img
                        src={x.image}
                        alt={`Representative ${x.category} solar installation`}
                      />
                      <span className="demo-label">Stock photo</span>
                      <div>
                        <h3>{x.title}</h3>
                        <p>
                          {x.category} · {x.location}
                        </p>
                      </div>
                    </article>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProjectsPage
