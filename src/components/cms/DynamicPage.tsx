import { useEffect, useState } from "react"
import {
  getCmsPage,
  getPageSections,
  type CmsPage,
  type PageSection,
} from "../../lib/cms"
import PageHero from "../PageHero"
import PageSectionRenderer from "./PageSectionRenderer"
import ContactCTA from "../ContactCTA"

interface DynamicPageProps {
  path: string
  pageId: string
  fallbackKicker?: string
  fallbackTitle?: string
  fallbackDescription?: string
  showContactCTA?: boolean
}

export default function DynamicPage({
  path,
  pageId,
  fallbackKicker,
  fallbackTitle,
  fallbackDescription,
  showContactCTA = true,
}: DynamicPageProps) {
  const [cms, setCms] = useState<CmsPage | null>(null)
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPage() {
      try {
        const [page, pageSections] = await Promise.all([
          getCmsPage(path),
          getPageSections(pageId),
        ])

        if (!cancelled) {
          setCms(page)
          setSections(pageSections)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      cancelled = true
    }
  }, [path, pageId])

  if (loading) {
    return (
      <div className="page">
        <PageHero
          kicker={fallbackKicker || "Loading..."}
          title={fallbackTitle || "Loading page content"}
          text={
            fallbackDescription || "Please wait while we fetch the page data."
          }
        />
        <section className="section">
          <div className="shell">
            <div className="empty-state">
              <span
                className="skeleton skeleton-image"
                style={{ width: "48px", height: "48px" }}
              />
              <p>Loading page content...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHero
          kicker="Error"
          title="Failed to load page"
          text="Unable to fetch page content. Please try again later."
        />
        <section className="section">
          <div className="shell">
            <div className="empty-state">
              <span>⚠</span>
              <h2>Failed to load page</h2>
              <p>{error.message}</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHero
        kicker={fallbackKicker || ""}
        title={cms?.title ?? (fallbackTitle || "Page Title")}
        text={cms?.description ?? (fallbackDescription || "Page description.")}
      />
      <section className="section">
        <div className="shell">
          {sections.length > 0 ? (
            <div className="sections-container">
              {sections.map((section) => (
                <PageSectionRenderer key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>📄</span>
              <h2>No content available</h2>
              <p>This page has no CMS sections configured yet.</p>
            </div>
          )}
        </div>
      </section>
      {showContactCTA && <ContactCTA />}
    </div>
  )
}
