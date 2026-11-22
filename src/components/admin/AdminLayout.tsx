import { useEffect, useState, ReactNode } from "react"
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const SIDEBAR_KEY = "sm-admin-sidebar"

function formatRole(role?: string) {
  if (!role) return "Team member"
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function sectionForPath(pathname: string) {
  if (pathname.startsWith("/admin/content")) return "/admin/content"
  if (pathname.startsWith("/admin/solar")) return "/admin/solar"
  if (pathname.startsWith("/admin/settings")) return "/admin/settings"
  return ""
}

function pageMeta(pathname: string) {
  const rules: { test: RegExp; title: string; crumbs: string[] }[] = [
    { test: /^\/admin$/, title: "Dashboard", crumbs: ["Dashboard"] },
    {
      test: /^\/admin\/content\/pages\/[^/]+\/sections/,
      title: "Page sections",
      crumbs: ["Content", "Pages", "Sections"],
    },
    { test: /^\/admin\/content\/pages/, title: "Pages", crumbs: ["Content", "Pages"] },
    {
      test: /^\/admin\/content\/media/,
      title: "Media library",
      crumbs: ["Content", "Media library"],
    },
    { test: /^\/admin\/content\/menus/, title: "Menus", crumbs: ["Content", "Menus"] },
    {
      test: /^\/admin\/solar\/packages/,
      title: "Solar packages",
      crumbs: ["Solar catalog", "Packages"],
    },
    { test: /^\/admin\/solar\/addons/, title: "Add-ons", crumbs: ["Solar catalog", "Add-ons"] },
    { test: /^\/admin\/inquiries/, title: "Inquiries", crumbs: ["Inquiries"] },
    { test: /^\/admin\/activity/, title: "Activity logs", crumbs: ["Activity logs"] },
    {
      test: /^\/admin\/settings\/company/,
      title: "Company",
      crumbs: ["Settings", "Company"],
    },
    {
      test: /^\/admin\/settings\/branding/,
      title: "Branding",
      crumbs: ["Settings", "Branding"],
    },
    { test: /^\/admin\/settings\/seo/, title: "SEO", crumbs: ["Settings", "SEO"] },
    {
      test: /^\/admin\/settings\/maintenance/,
      title: "Maintenance",
      crumbs: ["Settings", "Maintenance"],
    },
    {
      test: /^\/admin\/settings\/admins/,
      title: "Admin accounts",
      crumbs: ["Settings", "Admin accounts"],
    },
    { test: /^\/admin\/settings/, title: "General", crumbs: ["Settings", "General"] },
  ]
  return rules.find((rule) => rule.test.test(pathname)) ?? {
    title: "Admin",
    crumbs: ["Admin"],
  }
}

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  children?: NavItem[]
  roles?: ("super_admin" | "admin" | "editor")[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Content",
    path: "/admin/content",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    children: [
      { label: "Pages", path: "/admin/content/pages", icon: <PageIcon /> },
      {
        label: "Media Library",
        path: "/admin/content/media",
        icon: <MediaIcon />,
      },
      { label: "Menus", path: "/admin/content/menus", icon: <MenuIcon /> },
    ],
  },
  {
    label: "Solar Catalog",
    path: "/admin/solar",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    children: [
      {
        label: "Packages",
        path: "/admin/solar/packages",
        icon: <PackageIcon />,
      },
      { label: "Add-ons", path: "/admin/solar/addons", icon: <AddonIcon /> },
    ],
  },
  {
    label: "Inquiries",
    path: "/admin/inquiries",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    children: [
      {
        label: "General",
        path: "/admin/settings/general",
        icon: <SettingsIcon />,
        roles: ["super_admin", "admin"],
      },
      {
        label: "Company",
        path: "/admin/settings/company",
        icon: <CompanyIcon />,
        roles: ["super_admin", "admin"],
      },
      {
        label: "Branding",
        path: "/admin/settings/branding",
        icon: <BrandingIcon />,
        roles: ["super_admin", "admin"],
      },
      {
        label: "SEO",
        path: "/admin/settings/seo",
        icon: <SeoIcon />,
        roles: ["super_admin", "admin"],
      },
      {
        label: "Maintenance",
        path: "/admin/settings/maintenance",
        icon: <MaintenanceIcon />,
        roles: ["super_admin"],
      },
      {
        label: "Admin Accounts",
        path: "/admin/settings/admins",
        icon: <AdminIcon />,
        roles: ["super_admin"],
      },
    ],
  },
  {
    label: "Activity Logs",
    path: "/admin/activity",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    roles: ["super_admin", "admin"],
  },
]

function PageIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function MediaIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21l4-4 4 4 4-4 4 4" />
    </svg>
  )
}
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
function AddonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function CompanyIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M22 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function BrandingIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function SeoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
function MaintenanceIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}
function AdminIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function SidebarItem({
  item,
  isOpen,
  onClick,
  depth = 0,
  closeMobileSidebar,
  iconRail,
  onExpandSidebar,
}: {
  item: NavItem
  isOpen: boolean
  onClick: () => void
  depth?: number
  closeMobileSidebar?: () => void
  iconRail?: boolean
  onExpandSidebar?: () => void
}) {
  const location = useLocation()
  const hasChildren = item.children && item.children.length > 0
  const { adminUser } = useAuth()
  const childActive = item.children?.some(
    (child) =>
      location.pathname === child.path ||
      location.pathname.startsWith(`${child.path}/`),
  )
  const isActive =
    item.path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)

  if (item.roles && adminUser && !item.roles.includes(adminUser.role)) {
    return null
  }
  if (item.children) {
    const hasVisibleChildren = item.children.some((child) => {
      if (!child.roles) return true
      return adminUser && child.roles.includes(adminUser.role)
    })
    if (!hasVisibleChildren) return null
  }

  const rowClass = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
      depth > 0 ? "py-2" : ""
    } ${iconRail ? "lg:justify-center lg:px-2" : ""} ${
      active
        ? "bg-primary-50 text-primary-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`

  const closeIfMobile = () => {
    if (window.innerWidth < 1024) closeMobileSidebar?.()
  }

  const handleParentClick = () => {
    if (iconRail && window.innerWidth >= 1024) {
      onExpandSidebar?.()
      if (!isOpen) onClick()
      return
    }
    onClick()
  }

  return (
    <div>
      {hasChildren ? (
        <button
          type="button"
          onClick={handleParentClick}
          className={rowClass(Boolean(childActive))}
          style={iconRail ? undefined : { paddingLeft: `${12 + depth * 16}px` }}
          aria-expanded={isOpen}
          title={item.label}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className={`flex-1 truncate ${iconRail ? "lg:sr-only" : ""}`}>
            {item.label}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""} ${
              iconRail ? "lg:hidden" : ""
            }`}
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ) : (
        <NavLink
          to={item.path}
          end={item.path === "/admin"}
          onClick={closeIfMobile}
          title={item.label}
          className={() => rowClass(isActive)}
          style={iconRail ? undefined : { paddingLeft: `${12 + depth * 16}px` }}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className={`flex-1 truncate ${iconRail ? "lg:sr-only" : ""}`}>
            {item.label}
          </span>
          {isActive && !iconRail && (
            <span className="absolute right-3 w-1 h-6 bg-primary-600 rounded-r-full" aria-hidden="true" />
          )}
        </NavLink>
      )}
      {hasChildren && isOpen && (
        <div className={`mt-1 space-y-1 ${iconRail ? "lg:hidden" : ""}`}>
          {item.children!.map((child) => (
            <SidebarItem
              key={child.path}
              item={child}
              isOpen={false}
              onClick={() => {}}
              closeMobileSidebar={closeMobileSidebar}
              depth={depth + 1}
              iconRail={iconRail}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [iconRail, setIconRail] = useState(false)
  const location = useLocation()
  const { user, profile, adminUser, signOut, isSuperAdmin } = useAuth()
  const [expandedSections, setExpandedSections] =
    useState<Record<string, boolean>>({})
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (typeof parsed.iconRail === "boolean") {
        setIconRail(parsed.iconRail)
      }
      if (typeof parsed.sidebarOpen === "boolean" && !parsed.iconRail) {
        setSidebarOpen(parsed.sidebarOpen)
      }
    }
  }, [])

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_KEY,
      JSON.stringify({ sidebarOpen, iconRail }),
    )
  }, [sidebarOpen, iconRail])

  const toggleSection = (path: string) => {
    setExpandedSections((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const filteredNavItems = navItems
    .filter((item) => {
      if (!item.roles) return true
      return adminUser && item.roles.includes(adminUser.role)
    })
    .map((item) => {
      if (!item.children) return item
      const visibleChildren = item.children.filter((child) => {
        if (!child.roles) return true
        return adminUser && child.roles.includes(adminUser.role)
      })
      return { ...item, children: visibleChildren }
    })

  const toggleSidebar = () => {
    if (iconRail) {
      setIconRail(false)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  const collapseToIconRail = () => {
    setIconRail(true)
    setSidebarOpen(true)
  }

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest("[data-profile-menu]")) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const breadcrumbs = pageMeta(location.pathname).crumbs

  return (
    <div className="min-h-screen bg-gray-50 flex" data-admin-app>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full border-r border-gray-200 transition-all duration-300 flex flex-col bg-white ${
          iconRail
            ? "w-16"
            : sidebarOpen
            ? "w-64"
            : "w-0 lg:w-0"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: iconRail ? "4rem" : sidebarOpen ? "16rem" : "0" }}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <Link
              to="/admin"
              className="flex items-center gap-2"
              aria-label="Admin dashboard home"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              {!iconRail && (
                <span className="font-bold text-lg text-gray-900 truncate">
                  Solar Mechanics
                </span>
              )}
            </Link>
            {!iconRail && (
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto p-3 space-y-1"
            role="navigation"
            aria-label="Admin sections"
          >
            {filteredNavItems.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                isOpen={expandedSections[item.path] || false}
                onClick={() => toggleSection(item.path)}
                closeMobileSidebar={() => setMobileSidebarOpen(false)}
                iconRail={iconRail}
                onExpandSidebar={collapseToIconRail}
              />
            ))}
          </nav>

          {/* Sidebar Controls - Collapse/Expand */}
          {!iconRail && (
            <div className="p-3 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={collapseToIconRail}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label="Collapse sidebar to icons"
                title="Collapse sidebar to icons"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span className="truncate">Collapse</span>
              </button>
            </div>
          )}

          {iconRail && (
            <div className="p-3 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIconRail(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="8" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span className="truncate">Expand</span>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0" data-profile-menu>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-primary-700 font-medium text-sm">
                      {profile?.full_name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
                {!iconRail && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name || user?.email || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {formatRole(adminUser?.role)}
                    </p>
                  </div>
                )}
                {!iconRail && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {profileMenuOpen && !iconRail && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-slide-up" role="menu">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name || user?.email || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {formatRole(adminUser?.role)}
                    </p>
                  </div>
                  <Link
                    to="/admin/settings/general"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    role="menuitem"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <button
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100"
                onClick={toggleSidebar}
                aria-label={iconRail ? "Expand sidebar" : sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              {/* Breadcrumbs */}
              <nav className="hidden md:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
                <Link
                  to="/admin"
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Dashboard
                </Link>
                {breadcrumbs.slice(1).map((crumb, index) => (
                  <span key={crumb} className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-400"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {index === breadcrumbs.length - 2 ? (
                      <span className="text-gray-900 font-medium">{crumb}</span>
                    ) : (
                      <Link
                        to={""}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {crumb}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}