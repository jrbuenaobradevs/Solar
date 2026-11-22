import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { AdminLayout } from "./AdminLayout"

export function AdminRoutes() {
  const { loading, isAdmin, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0e1730] text-white">
        <img src="/solar-mechanics.png" alt="" className="h-14 w-14 rounded-full object-cover" />
        <p className="text-sm text-[#c9d3e4]">Opening the dashboard…</p>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_14px_35px_rgba(23,35,59,0.08)]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f5444a]">
            Admin
          </p>
          <h1 className="mt-2 text-2xl text-[#17233b]">This account cannot enter</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            You are signed in, but this account is not on the staff list. Ask a super admin to grant access, or return to the website.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white hover:bg-primary-700"
          >
            Back to website
          </a>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export function PublicAdminRoutes() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6fb]">
        <img src="/solar-mechanics.png" alt="" className="h-14 w-14 rounded-full object-cover" />
        <p className="text-sm text-slate-500">Loading sign in…</p>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    )
  }

  if (user && location.pathname !== "/admin/reset-password") {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
