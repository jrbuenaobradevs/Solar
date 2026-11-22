import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import AuthShell from "../../components/admin/AuthShell"
import { useAuth } from "../../context/AuthContext"

const REMEMBER_KEY = "sm-admin-email"
const DEMO_EMAIL = "admin@solarmechanics.example"
const DEMO_PASSWORD = "password123"

const fieldClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#17233b] outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 disabled:bg-slate-50 disabled:text-slate-400"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname || "/admin"

  useEffect(() => {
    document.title = "Sign in · Solar Mechanics Admin"
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (remember) localStorage.setItem(REMEMBER_KEY, email.trim())
    else localStorage.removeItem(REMEMBER_KEY)

    const { error: signInError } = await signIn(email.trim(), password)

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password do not match. Check both fields and try again."
          : signInError.message,
      )
      setLoading(false)
      return
    }

    navigate(from, { replace: true })
  }

  const updateCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState("CapsLock"))
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your staff email to open the administration dashboard."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <div
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 animate-slide-down"
            role="alert"
            aria-live="assertive"
          >
            <span className="mt-0.5 font-bold flex-shrink-0" aria-hidden="true">
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-[#17233b]"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError("")
            }}
            className={`${fieldClass} ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}`}
            placeholder="name@company.com"
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "email-error" : undefined}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#17233b]"
            >
              Password
            </label>
            <Link
              to="/admin/reset-password"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError("")
              }}
              onKeyUp={updateCapsLock}
              onBlur={() => setCapsLock(false)}
              className={`${fieldClass} pr-16 ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}`}
              placeholder="Enter your password"
              disabled={loading}
              aria-invalid={error ? true : undefined}
              aria-describedby={capsLock ? "caps-lock-hint" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-1 right-1 rounded-md px-3 text-xs font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-100 hover:text-[#17233b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded-md"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {capsLock && (
            <p id="caps-lock-hint" className="mt-1.5 text-xs font-medium text-amber-700 animate-fade-in" role="status">
              Caps Lock is on.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
          />
          <span>Remember this email on this device</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-slate-600 list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded">
            Using the demo account?
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Email <span className="font-semibold text-[#17233b]">{DEMO_EMAIL}</span>
            <br />
            Password <span className="font-semibold text-[#17233b]">{DEMO_PASSWORD}</span>
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-bold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded"
            onClick={() => {
              setEmail(DEMO_EMAIL)
              setPassword(DEMO_PASSWORD)
              setError("")
            }}
          >
            Fill demo credentials
          </button>
        </details>
      </div>
    </AuthShell>
  )
}