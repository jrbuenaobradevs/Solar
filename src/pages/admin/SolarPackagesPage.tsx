import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface SolarPackage {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price: number | null
  capacity_kw: number
  panel_count: number
  inverter_type: string
  battery_capacity_kwh: number | null
  features: string[]
  specifications: Record<string, any>
  includes_installation: boolean
  includes_permits: boolean
  includes_monitoring: boolean
  warranty_years: number
  financing_available: boolean
  estimated_savings_per_year: number | null
  co2_offset_tons_per_year: number | null
  image_url: string | null
  gallery_images: string[]
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface PackageFormData {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price: number | null
  capacity_kw: number
  panel_count: number
  inverter_type: string
  battery_capacity_kwh: number | null
  features: string
  specifications: Record<string, any>
  includes_installation: boolean
  includes_permits: boolean
  includes_monitoring: boolean
  warranty_years: number
  financing_available: boolean
  estimated_savings_per_year: number | null
  co2_offset_tons_per_year: number | null
  image_url: string
  gallery_images: string
  is_active: boolean
  is_featured: boolean
  display_order: number
}

const inverterTypes = [
  "String Inverter",
  "Microinverter",
  "Hybrid Inverter",
  "Power Optimizer",
  "Central Inverter",
]

export default function SolarPackagesPage() {
  const { adminUser } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<SolarPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<SolarPackage | null>(
    null,
  )
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: 0,
    original_price: null,
    capacity_kw: 0,
    panel_count: 0,
    inverter_type: "",
    battery_capacity_kwh: null,
    features: "",
    specifications: {},
    includes_installation: true,
    includes_permits: true,
    includes_monitoring: true,
    warranty_years: 25,
    financing_available: true,
    estimated_savings_per_year: null,
    co2_offset_tons_per_year: null,
    image_url: "",
    gallery_images: "",
    is_active: true,
    is_featured: false,
    display_order: 0,
  })
  const [formErrors, setFormErrors] =
    useState<Partial<Record<keyof PackageFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("solar_packages")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error("Error fetching packages:", error)
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
      original_price: null,
      capacity_kw: 0,
      panel_count: 0,
      inverter_type: "",
      battery_capacity_kwh: null,
      features: "",
      specifications: {},
      includes_installation: true,
      includes_permits: true,
      includes_monitoring: true,
      warranty_years: 25,
      financing_available: true,
      estimated_savings_per_year: null,
      co2_offset_tons_per_year: null,
      image_url: "",
      gallery_images: "",
      is_active: true,
      is_featured: false,
      display_order: packages.length,
    })
    setFormErrors({})
    setEditingPackage(null)
  }

  const handleNewPackage = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEditPackage = (pkg: SolarPackage) => {
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      short_description: pkg.short_description,
      price: pkg.price,
      original_price: pkg.original_price,
      capacity_kw: pkg.capacity_kw,
      panel_count: pkg.panel_count,
      inverter_type: pkg.inverter_type,
      battery_capacity_kwh: pkg.battery_capacity_kwh,
      features: pkg.features.join("\n"),
      specifications: pkg.specifications,
      includes_installation: pkg.includes_installation,
      includes_permits: pkg.includes_permits,
      includes_monitoring: pkg.includes_monitoring,
      warranty_years: pkg.warranty_years,
      financing_available: pkg.financing_available,
      estimated_savings_per_year: pkg.estimated_savings_per_year,
      co2_offset_tons_per_year: pkg.co2_offset_tons_per_year,
      image_url: pkg.image_url || "",
      gallery_images: pkg.gallery_images.join("\n"),
      is_active: pkg.is_active,
      is_featured: pkg.is_featured,
      display_order: pkg.display_order,
    })
    setEditingPackage(pkg)
    setShowForm(true)
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof PackageFormData, string>> = {}
    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.slug.trim()) errors.slug = "Slug is required"
    if (formData.price <= 0) errors.price = "Price must be greater than 0"
    if (formData.capacity_kw <= 0)
      errors.capacity_kw = "Capacity must be greater than 0"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const packageData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        price: formData.price,
        original_price: formData.original_price,
        capacity_kw: formData.capacity_kw,
        panel_count: formData.panel_count,
        inverter_type: formData.inverter_type,
        battery_capacity_kwh: formData.battery_capacity_kwh,
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        specifications: formData.specifications,
        includes_installation: formData.includes_installation,
        includes_permits: formData.includes_permits,
        includes_monitoring: formData.includes_monitoring,
        warranty_years: formData.warranty_years,
        financing_available: formData.financing_available,
        estimated_savings_per_year: formData.estimated_savings_per_year,
        co2_offset_tons_per_year: formData.co2_offset_tons_per_year,
        image_url: formData.image_url || null,
        gallery_images: formData.gallery_images
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
      }

      if (editingPackage) {
        const { error } = await supabase
          .from("solar_packages")
          .update(packageData)
          .eq("id", editingPackage.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("solar_packages")
          .insert([packageData])
        if (error) throw error
      }

      await fetchPackages()
      setShowForm(false)
      resetForm()
    } catch (error: any) {
      if (error.code === "23505") {
        setFormErrors({ slug: "A package with this slug already exists" })
      } else {
        console.error("Error saving package:", error)
        alert("Failed to save package: " + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePackage = async (pkg: SolarPackage) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return

    try {
      const { error } = await supabase
        .from("solar_packages")
        .delete()
        .eq("id", pkg.id)
      if (error) throw error
      await fetchPackages()
    } catch (error) {
      console.error("Error deleting package:", error)
      alert("Failed to delete package")
    }
  }

  const handleToggleActive = async (pkg: SolarPackage) => {
    try {
      const { error } = await supabase
        .from("solar_packages")
        .update({ is_active: !pkg.is_active })
        .eq("id", pkg.id)
      if (error) throw error
      await fetchPackages()
    } catch (error) {
      console.error("Error toggling package:", error)
    }
  }

  const handleToggleFeatured = async (pkg: SolarPackage) => {
    try {
      const { error } = await supabase
        .from("solar_packages")
        .update({ is_featured: !pkg.is_featured })
        .eq("id", pkg.id)
      if (error) throw error
      await fetchPackages()
    } catch (error) {
      console.error("Error toggling featured:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solar Packages</h1>
          <p className="text-gray-600 mt-1">
            Manage solar panel packages and offerings
          </p>
        </div>
        <button
          onClick={handleNewPackage}
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
          New Package
        </button>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No packages yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first solar package
            </p>
            <button
              onClick={handleNewPackage}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create Package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Inverter
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
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pkg.image_url && (
                          <img
                            src={pkg.image_url}
                            alt={pkg.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {pkg.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {pkg.short_description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pkg.capacity_kw} kW
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.panel_count} panels
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(pkg.price)}
                      </div>
                      {pkg.original_price && pkg.original_price > pkg.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(pkg.original_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pkg.inverter_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pkg.warranty_years} years
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            pkg.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {pkg.is_active ? "Active" : "Inactive"}
                        </span>
                        {pkg.is_featured && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pkg.display_order}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(pkg)}
                          className={`p-2 rounded-lg transition-colors ${
                            pkg.is_active
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={pkg.is_active ? "Deactivate" : "Activate"}
                        >
                          {pkg.is_active ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(pkg)}
                          className={`p-2 rounded-lg transition-colors ${
                            pkg.is_featured
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={
                            pkg.is_featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={pkg.is_featured ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
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
                          onClick={() => handleDeletePackage(pkg)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPackage ? "Edit Package" : "New Package"}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Package Name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.slug ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="package-slug"
                  />
                  {formErrors.slug && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.slug}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.price ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (kW) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.capacity_kw}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity_kw: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      formErrors.capacity_kw
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.capacity_kw && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.capacity_kw}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Panel Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.panel_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        panel_count: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inverter Type
                  </label>
                  <select
                    value={formData.inverter_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inverter_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select inverter type</option>
                    {inverterTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery Capacity (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.battery_capacity_kwh || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        battery_capacity_kwh: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.warranty_years}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warranty_years: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        short_description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description for cards and listings"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed package description"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features (one per line)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="High efficiency panels&#10;25-year warranty&#10;Professional installation"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specifications (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(formData.specifications, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({
                          ...formData,
                          specifications: JSON.parse(e.target.value),
                        })
                      } catch {
                        // Ignore invalid JSON during typing
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder='{"panel_brand": "SunPower", "inverter_brand": "Enphase"}'
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gallery Images (one URL per line)
                  </label>
                  <textarea
                    value={formData.gallery_images}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gallery_images: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Annual Savings ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estimated_savings_per_year || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_savings_per_year: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CO2 Offset (tons/year)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.co2_offset_tons_per_year || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        co2_offset_tons_per_year: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="lg:col-span-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includes_installation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          includes_installation: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Includes Installation
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includes_permits}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          includes_permits: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Includes Permits
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.includes_monitoring}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          includes_monitoring: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Includes Monitoring
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.financing_available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          financing_available: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Financing Available
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
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
                  ) : editingPackage ? (
                    "Update Package"
                  ) : (
                    "Create Package"
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
