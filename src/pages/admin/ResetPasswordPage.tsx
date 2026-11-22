import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AuthShell from "../../components/admin/AuthShell"
import { useAuth } from "../../context/AuthContext"
import { supabase } from "../../config/supabase.js"

const fieldClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#17233b] outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 disabled:bg-slate-50"

function passwordScore(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

function getStrengthLabel(score: number) {
  const labels = ["Too short", "Weak", "Okay", "Strong", "Very strong"]
  return labels[Math.min(score, 4)]
}

function getStrengthColor(score: number) {
  if (score < 2) return "bg-red-400"
  if (score < 3) return "bg-amber-400"
  if (score < 4) return "bg-emerald-500"
  return "bg-emerald-600"
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sent, setSent] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  const [canSetPassword, setCanSetPassword] = useState(false)

  const { session, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const recoveryRequested = useMemo(() => {
    const type = searchParams.get("type")
    const code = searchParams.get("code")
    const hash = window.location.hash
    return (type === "recovery" && Boolean(code)) || hash.includes("type=recovery")
  }, [searchParams])

  useEffect(() => {
    document.title = "Reset password · Solar Mechanics Admin"
  }, [])

  useEffect(() => {
    if (!recoveryRequested) {
      setCanSetPassword(false)
      setCheckingToken(false)
      return
    }

    if (session?.user) {
      setCanSetPassword(true)
      setCheckingToken(false)
      setError("")
      return
    }

    const timer = window.setTimeout(() => {
      setCanSetPassword(false)
      setCheckingToken(false)
      setError("This reset link is invalid or has expired. Request a new one below.")
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [recoveryRequested, session])

  const requestLink = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)

    const { error: resetError } = await resetPassword(email.trim())
    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
    setInfo(`If an account exists for ${email.trim()}, a reset link is on its way.`)
  }

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Use at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Those passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      navigate("/admin", { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password"
      setError(message)
      setLoading(false)
    }
  }

  const strength = passwordScore(password)
  const strengthLabel = getStrengthLabel(strength)

  if (checkingToken) {
    return (
      <AuthShell
        title="Checking your link"
        subtitle="Hold on while we confirm this password reset is still valid."
      >
        <div className="flex items-center gap-3 py-6 text-sm text-slate-600" role="status" aria-live="polite">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" aria-hidden="true" />
          Verifying reset link…
        </div>
      </AuthShell>
    )
  }

  if (canSetPassword) {
    return (
      <AuthShell
        title="Choose a new password"
        subtitle="This replaces the password for your staff account."
      >
        <form className="space-y-5" onSubmit={updatePassword}>
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 animate-slide-down"
              role="alert"
              aria-live="assertive"
            >
              <span className="mt-0.5 font-bold flex-shrink-0" aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#17233b]">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                className={`${fieldClass} pr-16 ${confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                disabled={loading}
                aria-describedby="password-strength"
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
            <div id="password-strength" className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="grid h-1.5 flex-1 grid-cols-4 gap-1" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={`rounded-full transition-colors duration-200 ${
                      password && index < strength
                        ? getStrengthColor(strength)
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-500 min-w-[80px]">
                {password ? strengthLabel : "8+ characters"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Use 12+ characters with uppercase, lowercase, numbers, and symbols for best security.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-[#17233b]">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (error) setError("")
              }}
              className={`${fieldClass} ${confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : ""}`}
              disabled={loading}
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in" role="alert">
                Passwords do not match yet.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save new password"
            )}
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your staff account. We will send a link to choose a new password."
    >
      {sent ? (
        <div className="space-y-4 animate-slide-up" role="status" aria-live="polite">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            <svg
              className="mt-0.5 flex-shrink-0 h-5 w-5 text-emerald-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{info}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Open the message and follow the link. It expires after a short time. Check spam if it does not arrive.
          </p>
          <Link to="/admin/login" className="inline-flex text-sm font-bold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded">
            Return to sign in
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={requestLink}>
          {error && (
            <div
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 animate-slide-down"
              role="alert"
              aria-live="assertive"
            >
              <span className="mt-0.5 font-bold flex-shrink-0" aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#17233b]">
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
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Email me a reset link"
            )}
          </button>
          <p className="text-center text-sm">
            <Link to="/admin/login" className="font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}