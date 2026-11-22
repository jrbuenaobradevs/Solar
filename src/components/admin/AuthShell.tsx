import { ReactNode } from "react"
import { Link } from "react-router-dom"

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] bg-[#0e1730]">
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden px-12 xl:px-16 py-12 text-white"
        aria-hidden="true"
      >
        {/* Decorative background blobs */}
        <div
          className="pointer-events-none absolute -left-24 -bottom-32 h-[420px] w-[420px] rounded-[42%] border-[64px] border-white/5"
        />
        <div
          className="pointer-events-none absolute right-10 top-24 h-40 w-40 rounded-full bg-[#f5444a] opacity-30 blur-3xl"
        />
        <div
          className="pointer-events-none absolute left-20 bottom-20 h-32 w-32 rounded-full bg-primary-500 opacity-20 blur-3xl"
        />

        <Link to="/" className="relative z-10 inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1730] rounded-md">
          <img
            src="/solar-mechanics.png"
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <span>
            <strong className="block text-[13px] font-extrabold tracking-[0.08em]">
              SOLAR MECHANICS
            </strong>
            <small className="mt-1 block text-[10px] font-bold tracking-[0.12em] text-[#9eb6ff]">
              SOLAR · ELECTRICAL · TRAINING
            </small>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ff9a9e]">
            Administration
          </p>
          <h2 className="mt-4 text-4xl leading-tight text-white">
            Run the site from one place.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-[#c9d3e4]">
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-white/10 text-xs font-bold text-white" aria-hidden="true">
                1
              </span>
              Publish pages, menus, and media without leaving the dashboard.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-white/10 text-xs font-bold text-white" aria-hidden="true">
                2
              </span>
              Keep solar packages and add-ons in sync with the public catalog.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-white/10 text-xs font-bold text-white" aria-hidden="true">
                3
              </span>
              Reply to quote requests and contact inquiries as they come in.
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-[#8ea0bb]">
          Staff access only. Customer accounts are not used here.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col bg-[#f4f6fb]">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded-md -m-2 p-2"
            aria-label="Back to website home"
          >
            <img
              src="/solar-mechanics.png"
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <strong className="text-xs font-extrabold tracking-[0.06em] text-[#17233b]">
              SOLAR MECHANICS
            </strong>
          </Link>
          <Link
            to="/"
            className="ml-auto text-sm font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded-md px-2 py-1"
          >
            Back to website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[440px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f5444a]">
              Admin
            </p>
            <h1 className="mt-2 text-[32px] leading-tight text-[#17233b]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(23,35,59,0.08)] sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}