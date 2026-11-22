import { useEffect, useRef, useState, useCallback } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"
import { AdminLayout } from "../../components/admin/AdminLayout"

type SettingsTab = "general" | "company" | "branding" | "seo" | "maintenance" | "admin-accounts"

interface SiteSetting {
  id: string
  key: string
  value: any
  category: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  admin_role: "super_admin" | "admin" | "editor"
  profile_role: "super_admin" | "admin" | "editor"
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
  admin_created_at: string
  admin_updated_at: string
}

interface Toast {
  id: number
  type: "success" | "error" | "info"
  message: string
}

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "company",
    label: "Company",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 21H2" />
        <path d="M10 17H4" />
        <path d="M20 17h-6" />
        <path d="M3 7V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    id: "branding",
    label: "Branding",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: "seo",
    label: "SEO",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: "admin-accounts",
    label: "Admin Accounts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const defaultSettings: Record<SettingsTab, Array<{
  key: string
  label: string
  type: string
  description: string
  options?: string[]
}>> = {
  general: [
    { key: "site_name", label: "Site Name", type: "text", description: "The name of your website" },
    { key: "site_tagline", label: "Site Tagline", type: "text", description: "A brief tagline or slogan" },
    { key: "default_language", label: "Default Language", type: "select", options: ["en", "es", "fr", "de"], description: "Default site language" },
    { key: "timezone", label: "Timezone", type: "text", description: "Site timezone (e.g., America/New_York)" },
    { key: "date_format", label: "Date Format", type: "select", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], description: "Date display format" },
    { key: "currency", label: "Currency", type: "select", options: ["USD", "EUR", "GBP", "CAD", "AUD"], description: "Default currency" },
  ],
  company: [
    { key: "company_name", label: "Company Name", type: "text", description: "Legal company name" },
    { key: "company_address", label: "Address", type: "textarea", description: "Physical address" },
    { key: "company_phone", label: "Phone", type: "tel", description: "Main contact phone" },
    { key: "company_email", label: "Email", type: "email", description: "Main contact email" },
    { key: "company_license", label: "License Number", type: "text", description: "Business license number" },
    { key: "company_certifications", label: "Certifications", type: "textarea", description: "List of certifications (one per line)" },
  ],
  branding: [
    { key: "logo_url", label: "Logo URL", type: "url", description: "Main logo image URL" },
    { key: "logo_dark_url", label: "Dark Mode Logo URL", type: "url", description: "Logo for dark mode" },
    { key: "favicon_url", label: "Favicon URL", type: "url", description: "Favicon image URL" },
    { key: "primary_color", label: "Primary Color", type: "color", description: "Primary brand color (hex)" },
    { key: "secondary_color", label: "Secondary Color", type: "color", description: "Secondary brand color (hex)" },
    { key: "accent_color", label: "Accent Color", type: "color", description: "Accent color (hex)" },
    { key: "font_heading", label: "Heading Font", type: "text", description: "Font family for headings" },
    { key: "font_body", label: "Body Font", type: "text", description: "Font family for body text" },
  ],
  seo: [
    { key: "meta_title", label: "Default Meta Title", type: "text", description: "Default page title for SEO" },
    { key: "meta_description", label: "Default Meta Description", type: "textarea", description: "Default meta description" },
    { key: "meta_keywords", label: "Meta Keywords", type: "text", description: "Comma-separated keywords" },
    { key: "og_image_url", label: "Open Graph Image", type: "url", description: "Default social sharing image" },
    { key: "twitter_handle", label: "Twitter Handle", type: "text", description: "@username for Twitter cards" },
    { key: "google_analytics_id", label: "Google Analytics ID", type: "text", description: "GA4 Measurement ID (G-XXXXXXXXXX)" },
    { key: "google_tag_manager_id", label: "Google Tag Manager ID", type: "text", description: "GTM Container ID (GTM-XXXXXXX)" },
    { key: "facebook_pixel_id", label: "Facebook Pixel ID", type: "text", description: "Meta Pixel ID" },
  ],
  "admin-accounts": [],
  maintenance: [
    { key: "maintenance_mode", label: "Maintenance Mode", type: "boolean", description: "Enable maintenance mode" },
    { key: "maintenance_message", label: "Maintenance Message", type: "textarea", description: "Message shown during maintenance" },
    { key: "maintenance_allowed_ips", label: "Allowed IPs", type: "textarea", description: "IP addresses that can bypass maintenance (one per line)" },
    { key: "maintenance_end_time", label: "Scheduled End", type: "datetime-local", description: "When maintenance should auto-disable" },
  ],
}

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
] as const

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-emerald-100 text-emerald-700",
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
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
  variant = "danger",
  loading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  variant?: "danger" | "primary"
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary-600 text-white hover:bg-primary-700"
            } disabled:opacity-50`}
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

export default function SettingsPage() {
  const { adminUser } = useAuth()
  const { toasts, showToast } = useToast()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({})
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "editor">("editor")
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "super_admin" | "admin" | "editor">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Focus trap for modal
  useEffect(() => {
    if (showAddAdmin) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setTimeout(() => firstFocusableRef.current?.focus(), 0)
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [showAddAdmin])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAddAdmin) return
    if (e.key === "Escape") {
      setShowAddAdmin(false)
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e as any)
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [showAddAdmin])

  useEffect(() => {
    loadSettings()
    if (activeTab === "admin-accounts") {
      loadAdminUsers()
    }
  }, [activeTab])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const keys = defaultSettings[activeTab].map((s) => s.key)
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", keys)

      if (error) throw error

      const settingsMap: Record<string, SiteSetting> = {}
      ;(data || []).forEach((s: SiteSetting) => (settingsMap[s.key] = s))
      setSettings(settingsMap)

      const formValues: Record<string, any> = {}
      defaultSettings[activeTab].forEach((s: { key: string }) => {
        formValues[s.key] = settingsMap[s.key]?.value ?? ""
      })
      setFormData(formValues)
      setErrors({})
      setTouched({})
    } catch (error) {
      console.error("Error loading settings:", error)
      showToast("error", "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users_view")
        .select("*")
        .order("admin_created_at", { ascending: false })

      if (error) throw error

      const mappedUsers = (data || []).map((u: any) => ({
        id: u.id,
        email: "",
        full_name: u.full_name,
        admin_role: u.admin_role,
        profile_role: u.profile_role,
        avatar_url: u.avatar_url,
        is_active: u.is_active,
        last_login_at: u.last_login_at,
        admin_created_at: u.admin_created_at,
        admin_updated_at: u.admin_updated_at,
      }))
      setAdminUsers(mappedUsers)
    } catch (error) {
      console.error("Error loading admin users:", error)
      showToast("error", "Failed to load admin users")
    }
  }

  const validateField = (key: string, value: any): string | null => {
    const setting = defaultSettings[activeTab].find((s) => s.key === key)
    if (!setting) return null

    if (setting.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address"
    }
    if (setting.type === "url" && value && !/^https?:\/\/.+/.test(value)) {
      return "Please enter a valid URL starting with http:// or https://"
    }
    if (setting.type === "color" && value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return "Please enter a valid hex color (e.g., #1606b8)"
    }
    if (setting.key === "timezone" && value) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value })
      } catch {
        return "Please enter a valid IANA timezone (e.g., America/New_York)"
      }
    }
    return null
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    const error = validateField(key, value)
    setErrors((prev) => ({ ...prev, [key]: error || "" }))
  }

  const handleBlur = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    const error = validateField(key, formData[key])
    setErrors((prev) => ({ ...prev, [key]: error || "" }))
  }

  const hasErrors = Object.values(errors).some((e) => e)
  const hasTouchedErrors = Object.keys(errors).some((k) => touched[k] && errors[k])

  const handleSave = async () => {
    // Validate all fields before saving
    const newErrors: Record<string, string> = {}
    defaultSettings[activeTab].forEach((s) => {
      const error = validateField(s.key, formData[s.key])
      if (error) newErrors[s.key] = error
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
      showToast("error", "Please fix the validation errors before saving")
      return
    }

    setSaving(activeTab)
    try {
      const updates = defaultSettings[activeTab].map((s) => ({
        key: s.key,
        value: formData[s.key] ?? "",
        category: activeTab,
      }))

      const { error } = await supabase
        .from("site_settings")
        .upsert(updates, { onConflict: "key" })

      if (error) throw error

      await loadSettings()
      showToast("success", "Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      showToast("error", "Failed to save settings")
    } finally {
      setSaving(null)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return
    const emailError = validateField("email", newAdminEmail)
    if (emailError) {
      showToast("error", emailError)
      return
    }

    try {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(newAdminEmail, {
        redirectTo: `${window.location.origin}/admin/login`,
      })

      if (inviteError) throw inviteError

      setShowAddAdmin(false)
      setNewAdminEmail("")
      await loadAdminUsers()
      showToast("success", "Invitation sent! The user will be added as an admin when they sign up.")
    } catch (error: any) {
      console.error("Error inviting admin:", error)
      showToast("error", `Failed to send invitation: ${error.message}`)
    }
  }

  const handleToggleAdminActive = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !user.is_active })
        .eq("id", user.id)

      if (error) throw error
      await loadAdminUsers()
      showToast("success", `Admin ${user.is_active ? "deactivated" : "activated"}`)
    } catch (error) {
      console.error("Error toggling admin:", error)
      showToast("error", "Failed to update admin status")
    }
  }

  const handleUpdateAdminRole = async (
    user: AdminUser,
    role: "super_admin" | "admin" | "editor",
  ) => {
    if (user.id === adminUser?.id && role !== "super_admin") {
      showToast("error", "You cannot change your own role from Super Admin")
      return
    }
    try {
      const { error: adminError } = await supabase
        .from("admin_users")
        .update({ role })
        .eq("id", user.id)

      if (adminError) throw adminError

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user.id)

      if (profileError) throw profileError

      await loadAdminUsers()
      showToast("success", "Role updated successfully")
    } catch (error) {
      console.error("Error updating role:", error)
      showToast("error", "Failed to update role")
    }
  }

  const handleDeleteAdmin = async () => {
    if (!deleteConfirm) return
    if (deleteConfirm.id === adminUser?.id) {
      showToast("error", "You cannot delete your own account")
      setDeleteConfirm(null)
      return
    }

    setDeleteLoading(true)
    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", deleteConfirm.id)

      if (error) throw error
      await loadAdminUsers()
      showToast("success", "Admin removed successfully")
    } catch (error) {
      console.error("Error deleting admin:", error)
      showToast("error", "Failed to remove admin")
    } finally {
      setDeleteLoading(false)
      setDeleteConfirm(null)
    }
  }

  const filteredUsers = adminUsers
    .filter((user) => {
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase()
        const name = (user.full_name || "").toLowerCase()
        return name.includes(search)
      }
      return true
    })
    .filter((user) => {
      if (roleFilter !== "all") return user.admin_role === roleFilter
      return true
    })
    .filter((user) => {
      if (statusFilter !== "all") return statusFilter === "active" ? user.is_active : !user.is_active
      return true
    })

  const renderInput = (setting: typeof defaultSettings.general[0]) => {
    const value = formData[setting.key] ?? ""
    const error = errors[setting.key]
    const showError = touched[setting.key] && error
    const commonProps = {
      value,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => handleChange(setting.key, e.target.value),
      onBlur: () => handleBlur(setting.key),
      className: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
        showError
          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
          : "border-gray-300"
      }`,
      "aria-invalid": showError ? true : false,
      "aria-describedby": showError ? `${setting.key}-error` : setting.description ? `${setting.key}-help` : undefined,
    }

    switch (setting.type) {
      case "textarea":
        return (
          <>
            <textarea {...commonProps} rows={3} id={setting.key} />
            {setting.description && !showError && (
              <p id={`${setting.key}-help`} className="mt-1 text-xs text-gray-500">
                {setting.description}
              </p>
            )}
            {showError && (
              <p id={`${setting.key}-error`} className="mt-1 text-xs text-red-600 animate-fade-in" role="alert">
                {error}
              </p>
            )}
          </>
        )
      case "select":
        return (
          <>
            <select {...commonProps} id={setting.key}>
              {setting.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {setting.description && !showError && (
              <p id={`${setting.key}-help`} className="mt-1 text-xs text-gray-500">
                {setting.description}
              </p>
            )}
            {showError && (
              <p id={`${setting.key}-error`} className="mt-1 text-xs text-red-600 animate-fade-in" role="alert">
                {error}
              </p>
            )}
          </>
        )
      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true || value === "true"}
              onChange={(e) => handleChange(setting.key, e.target.checked)}
              onBlur={() => handleBlur(setting.key)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        )
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...commonProps}
              style={{ width: "50px", height: "36px", padding: 0, borderRadius: "8px", cursor: "pointer" }}
              id={setting.key}
            />
            <input
              type="text"
              {...commonProps}
              placeholder="#000000"
              style={{ flex: 1 }}
              id={`${setting.key}-text`}
            />
            {setting.description && !showError && (
              <p id={`${setting.key}-help`} className="mt-1 text-xs text-gray-500">
                {setting.description}
              </p>
            )}
            {showError && (
              <p id={`${setting.key}-error`} className="mt-1 text-xs text-red-600 animate-fade-in" role="alert">
                {error}
              </p>
            )}
          </div>
        )
      default:
        return (
          <>
            <input type={setting.type} {...commonProps} id={setting.key} />
            {setting.description && !showError && (
              <p id={`${setting.key}-help`} className="mt-1 text-xs text-gray-500">
                {setting.description}
              </p>
            )}
            {showError && (
              <p id={`${setting.key}-error`} className="mt-1 text-xs text-red-600 animate-fade-in" role="alert">
                {error}
              </p>
            )}
          </>
        )
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6" onKeyDown={handleKeyDown}>
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your website settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex gap-1 px-2" role="tablist" aria-label="Settings categories">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <span className="sr-only">Loading settings...</span>
              </div>
            ) : activeTab === "admin-accounts" ? (
              // Admin Accounts Tab
              <div id="panel-admin-accounts" role="tabpanel" className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Admin Accounts</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage administrator access and roles</p>
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(true)}
                    ref={firstFocusableRef}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Invite Admin
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Search admins"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by role"
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 animate-slide-up">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto text-gray-300 mb-4"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "No matching admins"
                        : "No admin users"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Invite your first admin user"}
                    </p>
                    <button
                      onClick={() => setShowAddAdmin(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Invite Admin
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" role="grid">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="text-primary-700 font-medium text-sm">
                                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.full_name || "Unnamed User"}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">{user.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={user.admin_role}
                                onChange={(e) => handleUpdateAdminRole(user, e.target.value as any)}
                                className={`px-2 py-1 text-xs font-medium rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${roleColors[user.admin_role]}`}
                                aria-label={`Role for ${user.full_name || user.id}`}
                              >
                                {roleOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleAdminActive(user)}
                                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                  user.is_active
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                aria-label={user.is_active ? "Deactivate admin" : "Activate admin"}
                                aria-pressed={user.is_active}
                              >
                                {user.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatRelativeTime(user.last_login_at)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setDeleteConfirm(user)}
                                disabled={user.id === adminUser?.id}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label={user.id === adminUser?.id ? "Cannot delete your own account" : `Remove ${user.full_name || "this admin"}`}
                                title={user.id === adminUser?.id ? "Cannot delete your own account" : "Remove Admin"}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="8.5" cy="7" r="4" />
                                  <line x1="23" y1="21" x2="17" y2="15" />
                                  <line x1="17" y1="21" x2="23" y2="15" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              // Settings Form
              <form
                id={`panel-${activeTab}`}
                role="tabpanel"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
                className="space-y-6 max-w-3xl animate-fade-in"
              >
                {defaultSettings[activeTab].map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.label}
                      {setting.type !== "boolean" && (
                        <span className="text-gray-400 ml-1">({setting.type})</span>
                      )}
                    </label>
                    {renderInput(setting)}
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving === activeTab || hasTouchedErrors}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving === activeTab ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Invite Admin Modal */}
      {showAddAdmin && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          onClick={() => setShowAddAdmin(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          aria-describedby="invite-modal-description"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 id="invite-modal-title" className="text-xl font-semibold text-gray-900">Invite Admin</h2>
              <button
                onClick={() => setShowAddAdmin(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p id="invite-modal-description" className="text-gray-600">
                Enter the email address of the person you want to invite as an admin. They will receive an email to sign up.
              </p>
              <div>
                <label htmlFor="new-admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="new-admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                    touched.email && errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-300"
                  }`}
                  placeholder="admin@example.com"
                  autoFocus
                  aria-invalid={touched.email && errors.email ? "true" : "false"}
                  aria-describedby={touched.email && errors.email ? "new-admin-email-error" : undefined}
                />
                {touched.email && errors.email && (
                  <p id="new-admin-email-error" className="mt-1 text-xs text-red-600 animate-fade-in" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="new-admin-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="new-admin-role"
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddAdmin(false)}
                  ref={lastFocusableRef}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteAdmin}
        title="Remove Admin"
        message={`Are you sure you want to remove this admin? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}