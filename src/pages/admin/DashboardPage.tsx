import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface StatCard {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  href: string
  color: string
  bgColor: string
}

interface RecentInquiry {
  id: string
  full_name: string
  email: string
  subject: string
  inquiry_type: "contact" | "quote"
  status: string
  created_at: string
}

interface RecentActivity {
  id: string
  action: string
  entity_type: string
  description: string
  created_at: string
  user_id: string | null
  user_full_name: string | null
}

interface ActivityLogRaw {
  id: string
  action: string
  entity_type: string
  description: string
  created_at: string
  user_id: string | null
  user_full_name?: string | null
}

export default function DashboardPage() {
  const { adminUser } = useAuth()
  const [stats, setStats] = useState<StatCard[]>([])
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats in parallel
      const [
        pagesCount,
        inquiriesCount,
        newInquiriesCount,
        packagesCount,
        addonsCount,
        mediaCount,
        recentInquiriesData,
        recentActivityData,
      ] = await Promise.all([
        supabase
          .from("pages")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("contact_inquiries")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("contact_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("solar_packages")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("solar_addons")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("media_assets")
          .select("*", { count: "exact", head: true })
          .eq("is_public", true),
        supabase
          .from("contact_inquiries")
          .select(
            "id, full_name, email, subject, inquiry_type, status, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("activity_logs")
          .select("id, action, entity_type, description, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      // Fetch user profiles for activity logs separately (since activity_logs.user_id references auth.users, not profiles directly)
      let recentActivityWithNames = recentActivityData.data || []
      if (recentActivityData.data && recentActivityData.data.length > 0) {
        const userIds = [
          ...new Set(
            recentActivityData.data
              .map((log: ActivityLogRaw) => log.user_id)
              .filter(Boolean),
          ),
        ]
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)

          const profileMap = new Map(
            profilesData?.map((p) => [p.id, p.full_name]) || [],
          )
          recentActivityWithNames = recentActivityData.data.map(
            (log: ActivityLogRaw) => ({
              ...log,
              user_full_name: log.user_id
                ? profileMap.get(log.user_id) || null
                : null,
            }),
          )
        }
      }

      setStats([
        {
          label: "Published Pages",
          value: pagesCount.count || 0,
          change: "+12% from last month",
          changeType: "positive",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          ),
          href: "/admin/content/pages",
          color: "bg-blue-500",
          bgColor: "bg-blue-100",
        },
        {
          label: "Total Inquiries",
          value: inquiriesCount.count || 0,
          change: "+8% from last month",
          changeType: "positive",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          ),
          href: "/admin/inquiries",
          color: "bg-green-500",
          bgColor: "bg-green-100",
        },
        {
          label: "New Inquiries",
          value: newInquiriesCount.count || 0,
          change:
            newInquiriesCount.count && newInquiriesCount.count > 0
              ? "Requires attention"
              : "All caught up",
          changeType:
            newInquiriesCount.count && newInquiriesCount.count > 0
              ? "negative"
              : "positive",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          href: "/admin/inquiries?status=new",
          color: "bg-red-500",
          bgColor: "bg-red-100",
        },
        {
          label: "Solar Packages",
          value: packagesCount.count || 0,
          change: "Active packages",
          changeType: "neutral",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          ),
          href: "/admin/solar/packages",
          color: "bg-yellow-500",
          bgColor: "bg-yellow-100",
        },
        {
          label: "Add-ons",
          value: addonsCount.count || 0,
          change: "Available add-ons",
          changeType: "neutral",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ),
          href: "/admin/solar/addons",
          color: "bg-purple-500",
          bgColor: "bg-purple-100",
        },
        {
          label: "Media Assets",
          value: mediaCount.count || 0,
          change: "Public assets",
          changeType: "neutral",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21l4-4 4 4 4-4 4 4" />
            </svg>
          ),
          href: "/admin/content/media",
          color: "bg-indigo-500",
          bgColor: "bg-indigo-100",
        },
      ])

      setRecentInquiries(recentInquiriesData.data || [])
      setRecentActivity(recentActivityWithNames as RecentActivity[])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-red-100 text-red-700"
      case "in_progress":
        return "bg-yellow-100 text-yellow-700"
      case "contacted":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-green-100 text-green-700"
      case "cancelled":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "INSERT":
        return "text-green-500 bg-green-100"
      case "UPDATE":
        return "text-blue-500 bg-blue-100"
      case "DELETE":
        return "text-red-500 bg-red-100"
      default:
        return "text-gray-500 bg-gray-100"
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {adminUser?.role || "Administrator"}. Here's what's
            happening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/content/pages/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
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
            New Page
          </Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-label="Refresh dashboard data"
            aria-busy={refreshing}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={refreshing ? "animate-spin" : ""}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        role="region"
        aria-label="Dashboard statistics"
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label={`View ${stat.label} - ${stat.value}`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                {stat.change && (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.changeType === "positive" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <polyline points="23 6 13.5 15.5 8.5 10.5" />
                        <line x1="17" y1="6" x2="23" y2="6" />
                        <line x1="17" y1="6" x2="17" y2="12" />
                      </svg>
                    )}
                    {stat.changeType === "negative" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <polyline points="1 18 10.5 8.5 15.5 13.5" />
                        <line x1="7" y1="18" x2="1" y2="18" />
                        <line x1="7" y1="18" x2="7" y2="12" />
                      </svg>
                    )}
                    {stat.change}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <span className={`text-white ${stat.color.replace("bg-", "text-")}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
            <Link
              to="/admin/inquiries"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            ) : recentInquiries.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-gray-300 mb-3"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No inquiries yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Contact and quote requests will appear here.
                </p>
                <Link
                  to="/admin/inquiries"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
                >
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
                  View Inquiries
                </Link>
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  to={`/admin/inquiries/${inquiry.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 truncate">
                          {inquiry.full_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}
                        >
                          {inquiry.status.replace("_", " ")}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          {inquiry.inquiry_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {inquiry.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {inquiry.subject}
                      </p>
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap mt-1">
                      {formatDate(inquiry.created_at)}
                    </time>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/admin/activity"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-gray-300 mb-3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No recent activity
                </h3>
                <p className="text-gray-500 mb-4">
                  Admin actions will appear here.
                </p>
                <Link
                  to="/admin/activity"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
                >
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
                  View Activity Log
                </Link>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${getActionIcon(activity.action)} flex-shrink-0`}
                      aria-label={`Action: ${activity.action}`}
                    >
                      {activity.action === "INSERT" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                      {activity.action === "UPDATE" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      )}
                      {activity.action === "DELETE" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.entity_type} •{" "}
                        {activity.user_full_name || "System"} •{" "}
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/content/pages/new"
            className="group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="p-3 bg-blue-100 rounded-lg w-fit group-hover:bg-blue-200 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mt-3">Create New Page</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add a new page to the website
            </p>
          </Link>
          <Link
            to="/admin/solar/packages/new"
            className="group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="p-3 bg-yellow-100 rounded-lg w-fit group-hover:bg-yellow-200 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-yellow-600"
                aria-hidden="true"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mt-3">
              Add Solar Package
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Create a new solar package
            </p>
          </Link>
          <Link
            to="/admin/content/media"
            className="group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="p-3 bg-purple-100 rounded-lg w-fit group-hover:bg-purple-200 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-600"
                aria-hidden="true"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21l4-4 4 4 4-4 4 4" />
                <line x1="12" y1="17" x2="12" y2="11" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mt-3">Upload Media</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add images to the media library
            </p>
          </Link>
          <Link
            to="/admin/settings/general"
            className="group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <div className="p-3 bg-gray-100 rounded-lg w-fit group-hover:bg-gray-200 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mt-3">Site Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure general settings
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}