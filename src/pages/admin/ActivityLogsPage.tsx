import { useEffect, useState } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any> | null
  created_at: string
  user_id: string | null
  admin_user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ActivityLogRaw {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any> | null
  created_at: string
  user_id: string | null
}

const actionColors: Record<string, {
  bg: string
  text: string
  icon: React.ReactNode
}> = {
  create: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  update: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  delete: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  login: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
  },
  logout: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
  publish: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  unpublish: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  },
}

const entityTypeLabels: Record<string, string> = {
  cms_pages: "Page",
  page_sections: "Section",
  site_settings: "Setting",
  solar_packages: "Solar Package",
  solar_addons: "Solar Add-on",
  contact_inquiries: "Inquiry",
  media_assets: "Media Asset",
  admin_users: "Admin User",
  menus: "Menu",
}

export default function ActivityLogsPage() {
  const { adminUser } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  const availableActions = [
    "create",
    "update",
    "delete",
    "login",
    "logout",
    "publish",
    "unpublish",
  ]

  const availableEntities = [
    "cms_pages",
    "page_sections",
    "site_settings",
    "solar_packages",
    "solar_addons",
    "contact_inquiries",
    "media_assets",
    "admin_users",
    "menus",
  ]

  useEffect(() => {
    fetchLogs()
  }, [
    actionFilter,
    entityFilter,
    dateFrom,
    dateTo,
    userFilter,
    searchQuery,
    currentPage,
  ])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter)
      }
      if (entityFilter !== "all") {
        query = query.eq("entity_type", entityFilter)
      }
      if (dateFrom) {
        query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`)
      }
      if (dateTo) {
        query = query.lte("created_at", `${dateTo}T23:59:59.999Z`)
      }
      if (searchQuery.trim()) {
        query = query.or(
          `action.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%,metadata->>description.ilike.%${searchQuery}%`,
        )
      }

      const { data, error, count } = await query

      if (error) throw error

      // Fetch admin user profiles for the logs
      let logsWithUsers = data || []
      if (data && data.length > 0) {
        const userIds = [
          ...new Set(
            data.map((log: ActivityLogRaw) => log.user_id).filter(Boolean),
          ),
        ]
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("admin_users_view")
            .select("id, full_name, avatar_url")
            .in("id", userIds)

          const profileMap = new Map(profilesData?.map((p) => [p.id, p]) || [])
          logsWithUsers = data.map((log: ActivityLogRaw) => ({
            ...log,
            admin_user: log.user_id
              ? profileMap.get(log.user_id) || null
              : null,
          }))
        }
      }

      // Apply user filter after fetching (since we can't filter on joined data easily)
      if (userFilter !== "all") {
        logsWithUsers = logsWithUsers.filter(
          (log) => log.admin_user?.id === userFilter,
        )
      }

      setLogs(logsWithUsers)
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getActionConfig = (action: string) => {
    return (
      actionColors[action] || {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
      }
    )
  }

  const getEntityLabel = (entityType: string) => {
    return entityTypeLabels[entityType] || entityType
  }

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log)
  }

  const getChangedFields = (
    oldValues: Record<string, any> | null,
    newValues: Record<string, any> | null,
  ) => {
    if (!oldValues && !newValues) return []
    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ])
    return Array.from(allKeys)
      .filter((key) => {
        const oldVal = oldValues?.[key]
        const newVal = newValues?.[key]
        return JSON.stringify(oldVal) !== JSON.stringify(newVal)
      })
      .map((key) => ({
        field: key,
        old: oldValues?.[key],
        new: newValues?.[key],
      }))
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">View and filter admin activity</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search logs..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Actions</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Entity Type
            </label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Entities</option>
              {availableEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {getEntityLabel(entity)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              User
            </label>
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">All Users</option>
              {/* Users would be loaded dynamically, for now just show filter */}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(actionFilter !== "all" ||
          entityFilter !== "all" ||
          dateFrom ||
          dateTo ||
          userFilter !== "all" ||
          searchQuery) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actionFilter !== "all" && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                Action: {actionFilter}
                <button
                  onClick={() => {
                    setActionFilter("all")
                    setCurrentPage(1)
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {entityFilter !== "all" && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                Entity: {getEntityLabel(entityFilter)}
                <button
                  onClick={() => {
                    setEntityFilter("all")
                    setCurrentPage(1)
                  }}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                From: {dateFrom}
                <button
                  onClick={() => {
                    setDateFrom("")
                    setCurrentPage(1)
                  }}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {dateTo && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                To: {dateTo}
                <button
                  onClick={() => {
                    setDateTo("")
                    setCurrentPage(1)
                  }}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="ml-1 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setActionFilter("all")
                setEntityFilter("all")
                setDateFrom("")
                setDateTo("")
                setUserFilter("all")
                setSearchQuery("")
                setCurrentPage(1)
              }}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
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
              <path d="M9 12h6" />
              <path d="M12 9v6" />
              <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No activity logs found
            </h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(log)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const actionConfig = getActionConfig(log.action)
                          return (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${actionConfig.bg} ${actionConfig.text}`}
                            >
                              {actionConfig.icon}
                              {log.action.charAt(0).toUpperCase() +
                                log.action.slice(1)}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {getEntityLabel(log.entity_type)}
                        </span>
                        {log.entity_id && (
                          <span className="ml-2 text-xs text-gray-500 font-mono">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.admin_user?.avatar_url ? (
                            <img
                              src={log.admin_user.avatar_url}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-medium text-xs">
                                {log.admin_user?.full_name
                                  ?.charAt(0)
                                  .toUpperCase() ||
                                  log.admin_user?.email
                                    ?.charAt(0)
                                    .toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-900">
                            {log.admin_user?.full_name ||
                              log.admin_user?.email ||
                              "System"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {log.ip_address || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(log)
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
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
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                  {totalCount} logs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage * itemsPerPage >= totalCount}
                    className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Activity Log Details
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedLog.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
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
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </label>
                  {(() => {
                    const actionConfig = getActionConfig(selectedLog.action)
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 mt-1 text-sm font-medium rounded-full ${actionConfig.bg} ${actionConfig.text}`}
                      >
                        {actionConfig.icon}
                        {selectedLog.action.charAt(0).toUpperCase() +
                          selectedLog.action.slice(1)}
                      </span>
                    )
                  })()}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Entity Type
                  </label>
                  <p className="text-gray-900 mt-1">
                    {getEntityLabel(selectedLog.entity_type)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">
                    {selectedLog.entity_id || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLog.admin_user?.full_name ||
                      selectedLog.admin_user?.email ||
                      "System"}
                    {selectedLog.admin_user?.email && (
                      <span className="text-gray-500 ml-2">
                        ({selectedLog.admin_user.email})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP Address
                  </label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">
                    {selectedLog.ip_address || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </label>
                  <p className="text-gray-900 mt-1">
                    {formatDate(selectedLog.created_at)}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              {selectedLog.metadata &&
                Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Metadata
                    </label>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-900 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

              {/* Changes */}
              {(selectedLog.old_values || selectedLog.new_values) &&
                (() => {
                  const changes = getChangedFields(
                    selectedLog.old_values,
                    selectedLog.new_values,
                  )
                  return (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Changes
                      </label>
                      {changes.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {changes.map(
                            (
                              change: { field: string; old: any; new: any },
                              index: number,
                            ) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                  {change.field.replace(/_/g, " ")}
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Before
                                    </p>
                                    <pre className="mt-1 text-gray-900 font-mono text-xs bg-white p-2 rounded overflow-x-auto">
                                      {change.old !== undefined
                                        ? JSON.stringify(change.old, null, 2)
                                        : "(not set)"}
                                    </pre>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      After
                                    </p>
                                    <pre className="mt-1 text-gray-900 font-mono text-xs bg-white p-2 rounded overflow-x-auto">
                                      {change.new !== undefined
                                        ? JSON.stringify(change.new, null, 2)
                                        : "(not set)"}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          No field changes detected
                        </p>
                      )}
                    </div>
                  )
                })()}

              {/* User Agent */}
              {selectedLog.user_agent && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User Agent
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono truncate">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedLog(null)}
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
