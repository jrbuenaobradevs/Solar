import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface Section {
  id: string
  page_id: string
  section_type: string
  title: string
  subtitle: string
  content: Record<string, any>
  settings: Record<string, any>
  sort_order: number
  is_visible: boolean
  background_image_id: string | null
  background_color: string
  background_overlay: string
  created_at: string
  updated_at: string
}

interface SectionFormData {
  section_type: string
  title: string
  subtitle: string
  content: Record<string, any>
  settings: Record<string, any>
  sort_order: number
  is_visible: boolean
  background_color: string
  background_overlay: string
}

const sectionTypes = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features Grid" },
  { value: "content", label: "Content Block" },
  { value: "gallery", label: "Image Gallery" },
  { value: "testimonials", label: "Testimonials" },
  { value: "cta", label: "Call to Action" },
  { value: "contact_form", label: "Contact Form" },
  { value: "quote_form", label: "Quote Form" },
  { value: "solar_calculator", label: "Solar Calculator" },
  { value: "packages", label: "Packages Grid" },
  { value: "addons", label: "Add-ons Grid" },
  { value: "projects", label: "Projects Showcase" },
  { value: "team", label: "Team Members" },
  { value: "stats", label: "Statistics" },
  { value: "faq", label: "FAQ" },
  { value: "rich_text", label: "Rich Text" },
  { value: "html", label: "Custom HTML" },
]

export default function PageSectionsPage() {
  const { pageId } = useParams<{ pageId: string }>()
  const navigate = useNavigate()
  const { adminUser } = useAuth()
  const [page, setPage] = useState<{
    id: string
    title: string
    path: string
  } | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [formData, setFormData] = useState<SectionFormData>({
    section_type: "content",
    title: "",
    subtitle: "",
    content: {},
    settings: {},
    sort_order: 0,
    is_visible: true,
    background_color: "",
    background_overlay: "",
  })
  const [formErrors, setFormErrors] =
    useState<Partial<Record<keyof SectionFormData, string>>>(
      {} as Partial<Record<keyof SectionFormData, string>>,
    )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (pageId) {
      fetchPageAndSections()
    }
  }, [pageId])

  const fetchPageAndSections = async () => {
    try {
      const [pageRes, sectionsRes] = await Promise.all([
        supabase
          .from("pages")
          .select("id, title, path")
          .eq("id", pageId)
          .single(),
        supabase
          .from("page_sections")
          .select("*")
          .eq("page_id", pageId)
          .order("sort_order", { ascending: true }),
      ])

      if (pageRes.error) throw pageRes.error
      if (sectionsRes.error) throw sectionsRes.error

      setPage(pageRes.data)
      setSections(sectionsRes.data || [])
    } catch (error) {
      console.error("Error fetching page/sections:", error)
      navigate("/admin/content/pages")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      section_type: "content",
      title: "",
      subtitle: "",
      content: {},
      settings: {},
      sort_order: sections.length,
      is_visible: true,
      background_color: "",
      background_overlay: "",
    })
    setFormErrors({})
    setEditingSection(null)
  }

  const handleNewSection = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditSection = (section: Section) => {
    setFormData({
      section_type: section.section_type,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      settings: section.settings,
      sort_order: section.sort_order,
      is_visible: section.is_visible,
      background_color: section.background_color,
      background_overlay: section.background_overlay,
    })
    setEditingSection(section)
    setShowForm(true)
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof SectionFormData, string>> = {}
    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.section_type.trim())
      errors.section_type = "Section type is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !pageId) return

    setSubmitting(true)
    try {
      const sectionData = {
        page_id: pageId,
        section_type: formData.section_type,
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        settings: formData.settings,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
        background_color: formData.background_color || null,
        background_overlay: formData.background_overlay || null,
      }

      if (editingSection) {
        const { error } = await supabase
          .from("page_sections")
          .update(sectionData)
          .eq("id", editingSection.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("page_sections")
          .insert([sectionData])
        if (error) throw error
      }

      await fetchPageAndSections()
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error("Error saving section:", error)
      alert("Failed to save section")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSection = async (section: Section) => {
    if (!confirm(`Are you sure you want to delete "${section.title}"?`)) return

    try {
      const { error } = await supabase
        .from("page_sections")
        .delete()
        .eq("id", section.id)
      if (error) throw error
      await fetchPageAndSections()
    } catch (error) {
      console.error("Error deleting section:", error)
      alert("Failed to delete section")
    }
  }

  const handleReorderSections = async (
    sectionId: string,
    direction: "up" | "down",
  ) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const index = sections.findIndex((s) => s.id === sectionId)
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const targetSection = sections[targetIndex]

    try {
      await Promise.all([
        supabase
          .from("page_sections")
          .update({ sort_order: targetSection.sort_order })
          .eq("id", section.id),
        supabase
          .from("page_sections")
          .update({ sort_order: section.sort_order })
          .eq("id", targetSection.id),
      ])
      await fetchPageAndSections()
    } catch (error) {
      console.error("Error reordering sections:", error)
    }
  }

  const getSectionTypeLabel = (type: string) => {
    return sectionTypes.find((t) => t.value === type)?.label || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading sections...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/content/pages"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sections: {page?.title}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage page sections and their content
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSection}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Section
        </button>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sections.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-gray-300 mb-4"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No sections yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add sections to build your page content
            </p>
            <button
              onClick={handleNewSection}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {section.title}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        {getSectionTypeLabel(section.section_type)}
                      </span>
                      {!section.is_visible && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Hidden
                        </span>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    onClick={() => handleReorderSections(section.id, "up")}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleReorderSections(section.id, "down")}
                    disabled={index === sections.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditSection(section)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSection ? "Edit Section" : "New Section"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Type *
                  </label>
                  <select
                    value={formData.section_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        section_type: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.section_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    {sectionTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.section_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.section_type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Section Title"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Section subtitle (optional)"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(formData.content, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({
                          ...formData,
                          content: JSON.parse(e.target.value),
                        })
                        setFormErrors({ ...formErrors, content: undefined })
                      } catch {
                        setFormErrors({
                          ...formErrors,
                          content: "Invalid JSON",
                        })
                      }
                    }}
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm ${
                      formErrors.content ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder='{"heading": "Welcome", "description": "..."}'
                  />
                  {formErrors.content && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.content}
                    </p>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Settings (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(formData.settings, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({
                          ...formData,
                          settings: JSON.parse(e.target.value),
                        })
                      } catch {
                        // Ignore invalid JSON during typing
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder='{"columns": 3, "showIcons": true}'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.background_color || "#ffffff"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_color: e.target.value,
                      })
                    }
                    className="w-full h-10 px-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Overlay
                  </label>
                  <input
                    type="color"
                    value={formData.background_overlay || "#000000"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_overlay: e.target.value,
                      })
                    }
                    className="w-full h-10 px-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_visible: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Visible on page
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : editingSection ? (
                    "Update Section"
                  ) : (
                    "Create Section"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
