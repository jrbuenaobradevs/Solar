import { useEffect, useRef, useState, useCallback } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"
import { AdminLayout } from "../../components/admin/AdminLayout"

interface SolarAddon {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  price_type: "fixed" | "per_kw" | "per_panel" | "percentage"
  compatible_packages: string[]
  features: string[]
  specifications: Record<string, any>
  warranty_years: number | null
  image_url: string | null
  gallery_images: string[]
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface AddonFormData {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  price_type: "fixed" | "per_kw" | "per_panel" | "percentage"
  compatible_packages: string
  features: string
  specifications: Record<string, any>
  warranty_years: number | null
  image_url: string
  gallery_images: string
  is_active: boolean
  is_featured: boolean
  display_order: number
}

interface Toast {
  id: number
  type: "success" | "error" | "info"
  message: string
}

interface SolarPackage {
  id: string
  name: string
}

const priceTypes = [
  { value: "fixed", label: "Fixed Price" },
  { value: "per_kw", label: "Per kW" },
  { value: "per_panel", label: "Per Panel" },
  { value: "percentage", label: "Percentage of Package" },
]

const priceTypeColors: Record<string, string> = {
  fixed: "bg-green-100 text-green-700",
  per_kw: "bg-blue-100 text-blue-700",
  per_panel: "bg-amber-100 text-amber-700",
  percentage: "bg-purple-100 text-purple-700",
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idCounter = useRef(0)

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++idCounter.current
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return { toasts, showToast }
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  loading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  loading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          <p id="confirm-message" className="text-gray-600">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                {confirmText}...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SolarAddonsPage() {
  const { adminUser } = useAuth()
  const [addons, setAddons] = useState<SolarAddon[]>([])
  const [packages, setPackages] = useState<SolarPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddon, setEditingAddon] = useState<SolarAddon | null>(null)
  const [formData, setFormData] = useState<AddonFormData>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    price_type: "fixed",
    compatible_packages: "",
    features: "",
    specifications: {},
    warranty_years: null,
    image_url: "",
    gallery_images: "",
    is_active: true,
    is_featured: false,
    display_order: 0,
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddonFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const { toasts, showToast } = useToast()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Focus trap for modal
  useEffect(() => {
    if (showForm) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector("input, select, textarea") as HTMLInputElement | null
        firstInput?.focus()
      }, 0)
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [showForm])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showForm) return
    if (e.key === "Escape") {
      setShowForm(false)
      return
    }
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements?.length) return
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [addonsRes, packagesRes] = await Promise.all([
        supabase.from("solar_addons").select("*").order("display_order", { ascending: true }),
        supabase.from("solar_packages").select("id, name").eq("is_active", true).order("name"),
      ])

      if (addonsRes.error) throw addonsRes.error
      if (packagesRes.error) throw packagesRes.error

      setAddons(addonsRes.data || [])
      setPackages(packagesRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("error", "Failed to load add-ons")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: 0,
      price_type: "fixed",
      compatible_packages: packages.length > 0 ? "" : packages.map((p) => p.id).join("\n"),
      features: "",
      specifications: {},
      warranty_years: null,
      image_url: "",
      gallery_images: "",
      is_active: true,
      is_featured: false,
      display_order: addons.length,
    })
    setFormErrors({})
    setEditingAddon(null)
  }

  const handleNewAddon = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditAddon = (addon: SolarAddon) => {
    setFormData({
      name: addon.name,
      slug: addon.slug,
      description: addon.description,
      short_description: addon.short_description,
      price: addon.price,
      price_type: addon.price_type,
      compatible_packages: addon.compatible_packages.join("\n"),
      features: addon.features.join("\n"),
      specifications: addon.specifications,
      warranty_years: addon.warranty_years,
      image_url: addon.image_url || "",
      gallery_images: addon.gallery_images.join("\n"),
      is_active: addon.is_active,
      is_featured: addon.is_featured,
      display_order: addon.display_order,
    })
    setEditingAddon(addon)
    setShowForm(true)
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof AddonFormData, string>> = {}

    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.slug.trim()) errors.slug = "Slug is required"
    if (formData.price < 0) errors.price = "Price cannot be negative"
    if (formData.price_type === "fixed" && formData.price <= 0)
      errors.price = "Price must be greater than 0 for fixed price"
    if (formData.display_order < 0) errors.display_order = "Display order cannot be negative"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      showToast("error", "Please fix the validation errors")
      return
    }

    setSubmitting(true)
    try {
      const addonData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        price: formData.price,
        price_type: formData.price_type,
        compatible_packages: formData.compatible_packages
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        specifications: formData.specifications,
        warranty_years: formData.warranty_years,
        image_url: formData.image_url || null,
        gallery_images: formData.gallery_images
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
      }

      if (editingAddon) {
        const { error } = await supabase.from("solar_addons").update(addonData).eq("id", editingAddon.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("solar_addons").insert([addonData])
        if (error) throw error
      }

      await fetchData()
      setShowForm(false)
      resetForm()
      showToast("success", `Add-on ${editingAddon ? "updated" : "created"} successfully!`)
    } catch (error: any) {
      if (error.code === "23505") {
        setFormErrors({ slug: "An addon with this slug already exists" })
      }
      console.error("Error saving addon:", error)
      showToast("error", `Failed to save addon: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAddon = async (addon: SolarAddon) => {
    if (!confirm(`Are you sure you want to delete "${addon.name}"?`)) return

    try {
      const { error } = await supabase.from("solar_addons").delete().eq("id", addon.id)
      if (error) throw error
      await fetchData()
      showToast("success", "Add-on deleted successfully")
    } catch (error) {
      console.error("Error deleting addon:", error)
      showToast("error", "Failed to delete addon")
    }
  }

  const handleToggleActive = async (addon: SolarAddon) => {
    try {
      const { error } = await supabase
        .from("solar_addons")
        .update({ is_active: !addon.is_active })
        .eq("id", addon.id)
      if (error) throw error
      await fetchData()
      showToast("success", addon.is_active ? "Deactivated" : "Activated")
    } catch (error) {
      console.error("Error toggling addon:", error)
      showToast("error", "Failed to toggle status")
    }
  }

  const handleToggleFeatured = async (addon: SolarAddon) => {
    try {
      const { error } = await supabase
        .from("solar_addons")
        .update({ is_featured: !addon.is_featured })
        .eq("id", addon.id)
      if (error) throw error
      await fetchData()
      showToast("success", addon.is_featured ? "Removed from featured" : "Marked as featured")
    } catch (error) {
      console.error("Error toggling featured:", error)
      showToast("error", "Failed to toggle featured status")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPriceTypeLabel = (type: string) => priceTypes.find((t) => t.value === type)?.label || type

  const getCompatiblePackageNames = (packageIds: string[]) => {
    if (packageIds.length === 0) return "All packages"
    return packageIds.map((id) => packages.find((p) => p.id === id)?.name || id).join(", ")
  }

  const handleSlugAutoGenerate = () => {
    if (formData.name && !formData.slug.trim()) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleKeyDownForm = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setShowForm(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6" onKeyDown={handleKeyDownForm}>
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-label="Notifications">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-down min-w-[300px] max-w-md ${
                toast.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : toast.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
              role="alert"
            >
              {toast.type === "success" && (
                <svg className="flex-shrink-0 h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="flex-shrink-0 h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="flex-shrink-0 h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm flex-1">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solar Add-ons</h1>
          <p className="text-gray-600 mt-1">Manage additional solar products and services</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">{addons.length}</p>
            <p className="text-sm text-gray-500">Total Add-ons</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {addons.filter((a) => a.is_active).length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {addons.filter((a) => a.is_featured).length}
            </p>
            <p className="text-sm text-gray-500">Featured</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <button
              onClick={handleNewAddon}
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
              New Add-on
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center" role="status" aria-live="polite">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading add-ons...</p>
            </div>
          ) : addons.length === 0 ? (
            <div className="p-12 text-center animate-slide-up">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto text-gray-300 mb-4"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No add-ons yet</h3>
              <p className="text-gray-500 mb-4">Create your first solar add-on to get started</p>
              <button
                onClick={handleNewAddon}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Create Add-on
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Add-on
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Compatible With
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {addons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {addon.image_url ? (
                            <img
                              src={addon.image_url}
                              alt={addon.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <span className="text-primary-700 font-medium text-sm">
                                {addon.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{addon.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{addon.short_description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{formatCurrency(addon.price)}</div>
                        {addon.price_type !== "fixed" && (
                          <p className="text-xs text-gray-500">
                            {addon.price_type === "percentage" ? `${addon.price}%` : `${addon.price}/unit`}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priceTypeColors[addon.price_type]}`}>
                          {getPriceTypeLabel(addon.price_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={getCompatiblePackageNames(addon.compatible_packages)}>
                          {getCompatiblePackageNames(addon.compatible_packages)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {addon.warranty_years ? (
                          <span className="text-sm text-gray-600">{addon.warranty_years} years</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              addon.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {addon.is_active ? "Active" : "Inactive"}
                          </span>
                          {addon.is_featured && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {addon.display_order}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(addon)}
                            className={`p-2 rounded-lg transition-colors ${
                              addon.is_active
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                            title={addon.is_active ? "Deactivate" : "Activate"}
                            aria-pressed={addon.is_active}
                          >
                            {addon.is_active ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(addon)}
                            className={`p-2 rounded-lg transition-colors ${
                              addon.is_featured
                                ? "text-yellow-600 hover:bg-yellow-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                            title={addon.is_featured ? "Remove from featured" : "Mark as featured"}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={addon.is_featured ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditAddon(addon)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAddon(addon)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Overlay with Focus Management */}
        {showForm && (
          <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={() => setShowForm(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            aria-describedby="form-description"
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 id="form-title" className="text-xl font-semibold text-gray-900">
                  {editingAddon ? "Edit Add-on" : "New Add-on"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close form"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} id="addon-form" className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4" role="tabpanel" tabIndex={0}>
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="addon-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        id="addon-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onBlur={() => handleSlugAutoGenerate()}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                          formErrors.name ? "border-red-300 focus:border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Add-on name"
                        aria-invalid={!!formErrors.name}
                        aria-describedby={formErrors.name ? "addon-name-error" : undefined}
                      />
                      {formErrors.name && (
                        <p id="addon-name-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="addon-slug" className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        id="addon-slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                          formErrors.slug ? "border-red-300 focus:border-red-500" : "border-gray-300"
                        }`}
                        placeholder="addon-slug"
                        aria-invalid={!!formErrors.slug}
                        aria-describedby={formErrors.slug ? "addon-slug-error" : undefined}
                      />
                      {formErrors.slug && (
                        <p id="addon-slug-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                          {formErrors.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="addon-price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        id="addon-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                          formErrors.price ? "border-red-300 focus:border-red-500" : "border-gray-300"
                        }`}
                        aria-invalid={!!formErrors.price}
                        aria-describedby={formErrors.price ? "addon-price-error" : undefined}
                      />
                      {formErrors.price && (
                        <p id="addon-price-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                          {formErrors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="addon-price-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Price Type
                      </label>
                      <select
                        id="addon-price-type"
                        value={formData.price_type}
                        onChange={(e) => setFormData({ ...formData, price_type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      >
                        {priceTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="addon-warranty" className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty (years)
                      </label>
                      <input
                        id="addon-warranty"
                        type="number"
                        min="0"
                        value={formData.warranty_years || ""}
                        onChange={(e) => setFormData({ ...formData, warranty_years: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        placeholder="e.g., 25"
                      />
                    </div>
                    <div>
                      <label htmlFor="addon-display-order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        id="addon-display-order"
                        type="number"
                        min="0"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        aria-invalid={!!formErrors.display_order}
                        aria-describedby={formErrors.display_order ? "addon-display-order-error" : undefined}
                      />
                      {formErrors.display_order && (
                        <p id="addon-display-order-error" className="mt-1 text-sm text-red-600 animate-fade-in" role="alert">
                          {formErrors.display_order}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="addon-short-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      id="addon-short-description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-y"
                      placeholder="Brief description for cards and listings"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label htmlFor="addon-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                    </label>
                    <textarea
                      id="addon-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-y"
                      placeholder="Detailed add-on description"
                    />
                  </div>

                  {/* Price Details Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Pricing Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">Price: <strong>{formatCurrency(formData.price)}</strong></p>
                      <p className="text-xs text-gray-500">Type: {getPriceTypeLabel(formData.price_type)}</p>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label htmlFor="addon-image-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Main Image URL
                    </label>
                    <input
                      id="addon-image-url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label htmlFor="addon-features" className="block text-sm font-medium text-gray-700 mb-1">
                      Features (one per line)
                    </label>
                    <textarea
                      id="addon-features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors font-mono text-sm resize-y"
                      placeholder="Battery backup&#10;Smart monitoring&#10;Extended warranty"
                    />
                  </div>

                  {/* Toggle Switches */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {formData.image_url ? (
                            <img src={formData.image_url} alt={formData.name} className="w-10 h-10 object-cover rounded-lg" />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <span className="text-primary-700 font-medium text-sm">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : "+"}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{formData.name || "Add-on Name"}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{formData.short_description || "Brief description"}</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Featured on Homepage</p>
                          <p className="text-xs text-gray-500">Will appear in featured sections</p>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Featured</span>
                        </label>
                      </div>
                    </div>
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
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : editingAddon ? (
                      "Update Add-on"
                    ) : (
                      "Create Add-on"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}