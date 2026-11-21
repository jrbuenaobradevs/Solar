# Super Admin Setup Procedure

This document describes how to create the first Super Admin user for the Solar Mechanics Admin Dashboard.

## Prerequisites

- Supabase project set up and running
- Database migrations applied (see `supabase/migrations/20261121000000_unified_solar_mechanics_cms.sql`)
- Admin authentication system deployed

## Step 1: Create Auth User

1. Go to your Supabase Dashboard → **Authentication** → **Users**
2. Click **"Invite User"** or **"Add User"**
3. Enter the email for the Super Admin (e.g., `admin@solarmechanics.example`)
4. Set a temporary password (or let Supabase send an invite email)
5. Copy the **User UUID** from the user details after creation

## Step 2: Run Bootstrap SQL

In the Supabase **SQL Editor**, run the following SQL (replace `YOUR-AUTH-USER-UUID` with the actual UUID from Step 1):

```sql
-- Insert into admin_users table
INSERT INTO public.admin_users (id, role, is_active)
VALUES ('YOUR-AUTH-USER-UUID', 'super_admin', true)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();

-- Insert into profiles table
INSERT INTO public.profiles (id, full_name, role, is_active)
VALUES ('YOUR-AUTH-USER-UUID', 'Super Admin', 'super_admin', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Super Admin',
  role = 'super_admin',
  is_active = true,
  updated_at = NOW();
```

## Step 3: Verify Setup

1. Go to `/admin/login` on your deployed site
2. Sign in with the Super Admin email and password
3. You should be redirected to `/admin` (Dashboard)
4. Verify you can access **Settings → Admin Accounts** tab
5. You should see your account listed with "Super Admin" role

## Step 4: Invite Additional Admins (Optional)

As a Super Admin, you can invite additional admin users:

1. Go to **Settings → Admin Accounts**
2. Click **"Invite Admin"**
3. Enter the new admin's email and select role (Admin or Editor)
4. The invitee will receive an email to sign up
5. After they sign up, their account will be automatically added to `admin_users` with the assigned role

## Role Permissions

| Role | Dashboard | Content | Solar | Inquiries | Settings | Admin Accounts | Activity Logs |
|------|-----------|---------|-------|-----------|----------|----------------|---------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

## Troubleshooting

### "useAuth must be used within an AuthProvider"
Ensure `AuthProvider` wraps your `App` in `src/main.tsx`:
```tsx
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### Reset password link doesn't work
1. Check that the redirect URL in `AuthContext.resetPassword()` matches your deployed URL:
   ```typescript
   redirectTo: `${window.location.origin}/admin/reset-password`
   ```
2. In Supabase Dashboard → **Authentication** → **URL Configuration**, ensure:
   - Site URL is set to your production URL
   - Redirect URLs include `https://yourdomain.com/admin/reset-password`

### Admin user not appearing in Settings
1. Check the `admin_users` table in Supabase
2. Verify the user's `id` matches the auth user's `id`
3. Check RLS policies allow the Super Admin to read `admin_users`

### RLS Policy Errors
Ensure the following policies exist (from migration):
```sql
-- admin_users policies
CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins can manage admin users" ON admin_users FOR ALL USING (public.is_super_admin());

-- profiles policies  
CREATE POLICY "Admins can view profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Super admins can manage profiles" ON profiles FOR ALL USING (public.is_super_admin());
```

## Security Notes

- The `admin_users` table uses RLS - only authenticated admins can access it
- Password reset uses Supabase's secure token-based flow
- All admin routes are protected by `AdminRoutes` component requiring valid admin session
- Service role key is **never** used in frontend code
- The `is_super_admin()` and `is_admin()` database functions check roles server-side

## Database Schema Reference

Key tables for admin auth:
- `auth.users` - Supabase Auth users (managed by Supabase)
- `public.profiles` - Extended user profile data (full_name, avatar, role, last_login_at)
- `public.admin_users` - Admin-specific data (role, is_active, linked to auth.users via id)
- `public.activity_logs` - Audit trail for admin actions

Triggers:
- `on_auth_user_created` - Auto-creates profile and admin_users entry on signup
- `update_updated_at_column` - Auto-updates `updated_at` timestamp