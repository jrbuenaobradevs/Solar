import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { supabase } from "../config/supabase.js"
import type { User, Session } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "super_admin" | "admin" | "editor"
  is_active: boolean
  last_login_at: string | null
}

interface AdminUser {
  id: string
  role: "super_admin" | "admin" | "editor"
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  adminUser: AdminUser | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin =
    adminUser?.role === "super_admin" ||
    adminUser?.role === "admin" ||
    adminUser?.role === "editor"
  const isSuperAdmin = adminUser?.role === "super_admin"

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndAdmin(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfileAndAdmin(session.user.id)
      } else {
        setProfile(null)
        setAdminUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfileAndAdmin = async (userId: string) => {
    try {
      // Fetch profile - use maybeSingle to avoid 406 when no row exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      // Fetch admin user - use maybeSingle to avoid 406 when no row exists
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      // Handle RLS errors (42501) - user exists in auth but not in admin tables yet
      if (profileError && profileError.code === "42501") {
        console.log("User not yet in profiles table (RLS)")
      }
      if (adminError && adminError.code === "42501") {
        console.log("User not yet in admin_users table (RLS)")
      }

      // Also handle PGRST116 (no rows returned for .single()) - using maybeSingle avoids this
      if (profileError && profileError.code === "PGRST116") {
        console.log("No profile found for user")
      }
      if (adminError && adminError.code === "PGRST116") {
        console.log("No admin_users entry found for user")
      }

      setProfile(profileData)
      setAdminUser(adminData)
    } catch (error) {
      console.error("Error fetching profile/admin:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Update last_login_at on successful sign in
    if (!error && data.user) {
      try {
        await supabase
          .from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", data.user.id)
      } catch (updateError) {
        console.error("Error updating last_login_at:", updateError)
      }
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setAdminUser(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    return { error }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndAdmin(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        adminUser,
        loading,
        isAdmin,
        isSuperAdmin,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
