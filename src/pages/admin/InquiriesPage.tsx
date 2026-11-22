import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

type InquiryStatus = "new" | "in_progress" | "contacted" | "completed" | "cancelled"
type InquiryType = "contact" | "quote" | "general"

interface ContactInquiry {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  inquiry_type: InquiryType
  status: InquiryStatus
  assigned_to: string | null
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface InquiryDetail extends ContactInquiry {
  admin_users_view?: {
    id: string
    full_name: string | null
    admin_role: "super_admin" | "admin" | "editor"
  } | null
}

const statusConfig: Record<InquiryStatus, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  new: { label: "New", color: "text-red-700", bgColor: "bg-red-100", icon: "🔴" },
  in_progress: { label: "In Progress", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: "🟡" },
  contacted: { label: "Contacted", color: "text-blue-700", bgColor: "bg-blue-100", icon: "🔵" },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100", icon: "🟢" },
  cancelled: { label: "Cancelled", color: "text-gray-700", bgColor: "bg-gray-100", icon: "⚪" },
}

const typeConfig: Record<InquiryType, {
  label: string
  color: string
  bgColor: string
}> = {
  contact: { label: "Contact Form", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  quote: { label: "Quote Request", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  general: { label: "General", color: "text-gray-700", bgColor: "bg-gray-100" },
}

const STATUS_OPTIONS: { value: InquiryStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  ...Object.entries(statusConfig).map(([key, config]) => ({ value: key as InquiryStatus, label: config.label })),
]

const TYPE_OPTIONS: { value: InquiryType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  ...Object.entries(typeConfig).map(([key, config]) => ({ value: key as InquiryType, label: config.label })),
]

export default function InquiriesPage() {
  const { adminUser } = useAuth()
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<InquiryType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [savingNote, setSavingNote] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [bulkAction, setBulkAction] = useState<InquiryStatus | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch inquiries when filters change
  useEffect(() => {
    fetchInquiries()
  }, [statusFilter, typeFilter, debouncedSearch, currentPage])

  // Handle keyboard navigation in table
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (selectedInquiry) {
        if (e.key === "Escape") setSelectedInquiry(null)
        return
      }
      if (e.key === "/" && searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedInquiry])

  // Focus trap for modal
  useEffect(() => {
    if (selectedInquiry && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      firstElement?.focus()

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      modalRef.current.addEventListener("keydown", handleTab)
      return () => modalRef.current?.removeEventListener("keydown", handleTab)
    }
  }, [selectedInquiry])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("contact_inquiries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }
      if (typeFilter !== "all") {
        query = query.eq("inquiry_type", typeFilter)
      }
      if (debouncedSearch.trim()) {
        query = query.or(
          `full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,subject.ilike.%${debouncedSearch}%,message.ilike.%${debouncedSearch}%`,
        )
      }

      const { data, error, count } = await query

      if (error) throw error
      setInquiries(data || [])
      setTotalCount(count || 0)
      // Reset selection when data changes
      setSelectedIds(new Set())
      setSelectAll(false)
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInquiryDetail = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*, admin_users_view!inner(id, full_name, admin_role)")
        .eq("id", id)
        .single()

      if (error) throw error
      setSelectedInquiry(data)
    } catch (error) {
      console.error("Error fetching inquiry detail:", error)
    }
  }, [])

  const handleStatusChange = async (
    inquiry: ContactInquiry,
    newStatus: InquiryStatus,
  ) => {
    setUpdatingStatus(inquiry.id)
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({
          status: newStatus,
          assigned_to:
            newStatus !== "new" && !inquiry.assigned_to
              ? adminUser?.id
              : inquiry.assigned_to,
        })
        .eq("id", inquiry.id)

      if (error) throw error

      // Update local state
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inquiry.id
            ? {
                ...i,
                status: newStatus,
                assigned_to:
                  newStatus !== "new" && !inquiry.assigned_to
                    ? (adminUser?.id ?? null)
                    : inquiry.assigned_to,
              }
            : i,
        ),
      )

      // Refresh detail if open
      if (selectedInquiry?.id === inquiry.id) {
        fetchInquiryDetail(inquiry.id)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleBulkStatusChange = async (newStatus: InquiryStatus) => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)

    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({
          status: newStatus,
          assigned_to:
            newStatus !== "new" ? adminUser?.id : null,
        })
        .in("id", ids)

      if (error) throw error
      await fetchInquiries()
      setBulkAction(null)
    } catch (error) {
      console.error("Error bulk updating status:", error)
      alert("Failed to update status for selected inquiries")
    }
  }

  const handleAddNote = async (inquiryId: string, note: string) => {
    setSavingNote(inquiryId)
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .update({ notes: note })
        .eq("id", inquiryId)

      if (error) throw error

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, notes: note })
      }
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, notes: note } : i)),
      )
    } catch (error) {
      console.error("Error adding note:", error)
      alert("Failed to add note")
    } finally {
      setSavingNote(null)
    }
  }

  const handleDeleteInquiry = async (inquiry: ContactInquiry) => {
    setShowDeleteConfirm(null)
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .delete()
        .eq("id", inquiry.id)
      if (error) throw error
      await fetchInquiries()
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(null)
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error)
      alert("Failed to delete inquiry")
    }
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDateShort(dateString)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRowClick = (inquiry: ContactInquiry, e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "SELECT" ||
      target.tagName === "A" ||
      target.closest("button") ||
      target.closest("select")
    ) {
      return
    }
    fetchInquiryDetail(inquiry.id)
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(inquiries.map((i) => i.id)))
    } else {
      setSelectedIds(new Set())
    }
    setSelectAll(checked)
  }

  const filteredInquiries = inquiries

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || debouncedSearch.trim() !== ""

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-1">
            Manage contact form submissions and quote requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, subject, message…"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Search inquiries"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[150px]"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[150px]"
              aria-label="Filter by type"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("all")
                  setTypeFilter("all")
                  setSearchQuery("")
                }}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 animate-slide-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                id="bulk-select-all"
              />
              <label htmlFor="bulk-select-all" className="text-sm font-medium text-gray-900">
                {selectedIds.size} selected
              </label>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction || ""}
                onChange={(e) => setBulkAction(e.target.value as InquiryStatus || null)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Bulk action"
                disabled={!bulkAction && selectedIds.size === 0}
              >
                <option value="">Bulk action…</option>
                {(Object.keys(statusConfig) as InquiryStatus[]).map((status) => (
                  <option key={status} value={status}>
                    Mark as {statusConfig[status].label}
                  </option>
                ))}
              </select>
              {bulkAction && (
                <button
                  onClick={() => handleBulkStatusChange(bulkAction)}
                  className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
              )}
              <button
                onClick={() => handleSelectAll(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && inquiries.length === 0 ? (
          <div className="p-8 text-center" role="status" aria-live="polite">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading inquiries…</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-gray-300 mb-4"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {hasActiveFilters ? "No matching inquiries" : "No inquiries yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Contact and quote requests will appear here"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("all")
                  setTypeFilter("all")
                  setSearchQuery("")
                }}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="grid">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll && inquiries.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                        aria-label="Select all inquiries on this page"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inquiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedInquiry?.id === inquiry.id ? "bg-primary-50" : ""
                      } ${selectedIds.has(inquiry.id) ? "bg-primary-50/50" : ""}`}
                      onClick={(e) => handleRowClick(inquiry, e)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          fetchInquiryDetail(inquiry.id)
                        }
                      }}
                      aria-selected={selectedInquiry?.id === inquiry.id}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inquiry.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleCheckboxChange(inquiry.id, e.target.checked)
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                          aria-label={`Select inquiry from ${inquiry.full_name}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-sm">
                              {getInitials(inquiry.full_name)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{inquiry.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{inquiry.email}</div>
                        {inquiry.phone && (
                          <div className="text-xs text-gray-500">{inquiry.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${typeConfig[inquiry.inquiry_type].bgColor} ${typeConfig[inquiry.inquiry_type].color}`}
                        >
                          {typeConfig[inquiry.inquiry_type].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs" title={inquiry.subject}>
                          {inquiry.subject}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inquiry.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleStatusChange(inquiry, e.target.value as InquiryStatus)
                          }}
                          disabled={updatingStatus === inquiry.id}
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig[inquiry.status].bgColor} ${statusConfig[inquiry.status].color} border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500`}
                          aria-label={`Change status for ${inquiry.full_name}`}
                        >
                          {(Object.keys(statusConfig) as InquiryStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status].label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus === inquiry.id && (
                          <span className="ml-2 text-xs text-gray-500">Saving…</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <span title={formatDate(inquiry.created_at)}>
                          {formatRelativeTime(inquiry.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              fetchInquiryDetail(inquiry.id)
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            aria-label={`View details for ${inquiry.full_name}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(inquiry.id)
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            aria-label={`Delete inquiry from ${inquiry.full_name}`}
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

            {/* Pagination */}
            {totalCount > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                  <strong>{Math.min(currentPage * itemsPerPage, totalCount)}</strong> of{" "}
                  <strong>{totalCount}</strong> inquiries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage * itemsPerPage >= totalCount}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          onClick={() => setShowDeleteConfirm(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 id="delete-confirm-title" className="text-lg font-semibold text-gray-900 mb-2">
                Delete inquiry?
              </h2>
              <p className="text-gray-500">
                This action cannot be undone. The inquiry will be permanently removed.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInquiry(inquiries.find(i => i.id === showDeleteConfirm)!)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          onClick={() => setSelectedInquiry(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-detail-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 id="inquiry-detail-title" className="text-xl font-semibold text-gray-900">
                  {selectedInquiry.subject}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedInquiry.full_name} • {formatDate(selectedInquiry.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close inquiry details"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status & Type Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${statusConfig[selectedInquiry.status].bgColor} ${statusConfig[selectedInquiry.status].color}`}
                >
                  <span aria-hidden="true">{statusConfig[selectedInquiry.status].icon}</span>
                  {statusConfig[selectedInquiry.status].label}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${typeConfig[selectedInquiry.inquiry_type].bgColor} ${typeConfig[selectedInquiry.inquiry_type].color}`}
                >
                  {typeConfig[selectedInquiry.inquiry_type].label}
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                  <p className="text-gray-900 mt-1">{selectedInquiry.full_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                  <p className="text-gray-900 mt-1">
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary-600 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                  <p className="text-gray-900 mt-1">
                    {selectedInquiry.phone ? (
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary-600 hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    ) : "—"}
                  </p>
                </div>
              </div>

              {/* UTM Parameters - from metadata jsonb */}
              {(selectedInquiry.metadata?.utm_source ||
                selectedInquiry.metadata?.utm_medium ||
                selectedInquiry.metadata?.utm_campaign) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    UTM Parameters
                  </label>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-gray-500">Source</p>
                      <p className="text-gray-900 font-mono text-xs">
                        {selectedInquiry.metadata?.utm_source || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Medium</p>
                      <p className="text-gray-900 font-mono text-xs">
                        {selectedInquiry.metadata?.utm_medium || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Campaign</p>
                      <p className="text-gray-900 font-mono text-xs">
                        {selectedInquiry.metadata?.utm_campaign || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-900 max-h-64 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Notes</label>
                <textarea
                  value={selectedInquiry.notes || ""}
                  onChange={(e) => handleAddNote(selectedInquiry.id, e.target.value)}
                  rows={4}
                  disabled={savingNote === selectedInquiry.id}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add internal notes…"
                  aria-label="Internal notes for this inquiry"
                />
                {savingNote === selectedInquiry.id && (
                  <p className="mt-1 text-xs text-gray-500">Saving…</p>
                )}
              </div>

              {/* Assigned To */}
              {selectedInquiry.assigned_to && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {selectedInquiry.admin_users_view?.full_name
                          ?.charAt(0)
                          .toUpperCase() || "A"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {selectedInquiry.admin_users_view?.full_name || "Administrator"}
                      </p>
                      <p className="text-xs text-gray-500">Assigned to</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}