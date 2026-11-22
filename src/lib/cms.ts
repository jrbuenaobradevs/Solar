import { supabase } from "../config/supabase.js"

// ============================================================
// CACHING & REQUEST DEDUPLICATION
// ============================================================

// In-memory cache with TTL (5 minutes default)
const cache = new Map<string, { data: any; expiry: number }>()
const pendingRequests = new Map<string, Promise<any>>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(prefix: string, params?: Record<string, any>): string {
  return prefix + (params ? ":" + JSON.stringify(params) : "")
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiry) {
    return entry.data as T
  }
  if (entry) cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, expiry: Date.now() + ttl })
}

function clearCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// ============================================================
// CACHE MANAGEMENT (for admin/refresh scenarios)
// ============================================================

/** Clear all cached CMS data */
export function clearAllCmsCache(): void {
  clearCache()
}

/** Clear cached page data */
export function clearPageCache(pageId?: string): void {
  if (pageId) {
    clearCache(`cms_page:${JSON.stringify({ path: pageId })}`)
    clearCache(`page_sections:${JSON.stringify({ pageId })}`)
  } else {
    clearCache("cms_page")
    clearCache("page_sections")
    clearCache("cms_pages")
  }
}

/** Clear cached solar packages */
export function clearSolarPackagesCache(): void {
  clearCache("solar_packages")
  clearCache("solar_packages_filtered")
}

/** Clear cached solar addons */
export function clearSolarAddonsCache(): void {
  clearCache("solar_addons")
  clearCache("solar_addons_filtered")
}

/** Clear cached menus */
export function clearMenusCache(): void {
  clearCache("menus")
  clearCache("menu_items")
}

/** Clear cached site settings */
export function clearSiteSettingsCache(): void {
  clearCache("site_setting")
  clearCache("site_settings_category")
}

/** Force refresh all CMS data on next fetch */
export function refreshAllCmsData(): void {
  clearAllCmsCache()
}

async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(key)
  if (cached !== null) return cached

  // Check if request is already in flight
  const pending = pendingRequests.get(key)
  if (pending) return pending as Promise<T>

  // Create new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

export type CmsPage = {
  id: string
  path: string
  title: string
  description: string
  sections: { id: string; heading: string; body: string; image?: string }[]
  updatedAt: string
}

export type PageSection = {
  id: string
  page_id: string
  section_type: string
  title: string
  content: Record<string, any>
  sort_order: number
  is_visible: boolean
  layout: string
  settings: Record<string, any>
  background_image_id: string | null
  created_at: string
  updated_at: string
}

export type InquiryStatus = "new" | "in_progress" | "contacted" | "completed" | "cancelled"
export type Inquiry = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: InquiryStatus
  createdAt: string
  source: "contact" | "quote"
  notes?: string
}

export type SiteSettings = {
  companyName: string
  description: string
  address: string
  phone: string
  email: string
  hours: string
  facebook: string
  instagram: string
  linkedin: string
}

export type SolarPackage = {
  id: string
  name: string
  audience: string
  type: string
  solar: number
  inverter: number
  battery: number | null
  panels: string
  generation: number
  price: number
  includes: string[]
  featured: boolean
  priceIsPlaceholder?: boolean
  warranty?: string
}

export type SolarAddon = {
  id: string
  name: string
  spec: string
  price: number
  icon?: string
  description?: string
  priceIsFrom?: boolean
}

// Menus
export type Menu = {
  id: string
  name: string
  slug: string
  description: string | null
  location: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type MenuItem = {
  id: string
  menu_id: string
  parent_id: string | null
  label: string
  url: string
  target: "_self" | "_blank"
  icon: string | null
  css_classes: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Fetch menus
export async function getMenus(): Promise<Menu[]> {
  const key = getCacheKey("menus")
  return deduplicatedFetch(key, async () => {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error
    const result = (data || []) as Menu[]
    setCache(key, result)
    return result
  })
}

// Fetch menu items for a specific menu
export async function getMenuItems(menuSlug: string): Promise<MenuItem[]> {
  const key = getCacheKey("menu_items", { menuSlug })
  return deduplicatedFetch(key, async () => {
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id")
      .eq("slug", menuSlug)
      .eq("is_active", true)
      .single()

    if (menuError) throw menuError
    if (!menu) return []

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("menu_id", menu.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error
    const result = (data || []) as MenuItem[]
    setCache(key, result)
    return result
  })
}

// Build menu tree from flat items
export function buildMenuTree(
  items: MenuItem[],
  parentId: string | null = null,
): MenuItem[] {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => ({
      ...item,
      children: buildMenuTree(items, item.id),
    }))
}

// Fetch all pages with sections
export async function getCmsPages(): Promise<CmsPage[]> {
  const key = getCacheKey("cms_pages")
  return deduplicatedFetch(key, async () => {
    const { data: pages, error } = await supabase
      .from("pages")
      .select(`
        *,
        page_sections (*)
      `)
      .eq("status", "published")
      .order("sort_order", {
        referencedTable: "page_sections",
        ascending: true,
      })

    if (error) throw error

    const result = (pages || []).map((p) => ({
      id: p.slug,
      path: p.path,
      title: p.title,
      description: p.meta_description,
      sections: (p.page_sections || []).map((s: any) => ({
        id: s.id,
        heading: s.title,
        body: s.content?.body || "",
        image: s.content?.image,
      })),
      updatedAt: p.updated_at,
    }))

    setCache(key, result)
    return result
  })
}

// Fetch site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "company")
    .single()

  if (error) throw error
  return data.value as SiteSettings
}

// Record an inquiry
export async function recordInquiry(input: {
  inquiry_type: "contact" | "quote"
  full_name: string
  email: string
  phone: string
  subject: string
  message: string
}) {
  const { data, error } = await supabase
    .from("contact_inquiries")
    .insert([
      {
        inquiry_type: input.inquiry_type,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch solar packages
export async function getSolarPackages(): Promise<SolarPackage[]> {
  const key = getCacheKey("solar_packages")
  return deduplicatedFetch(key, async () => {
    const { data, error } = await supabase
      .from("solar_packages")
      .select("*")
      .order("solar", { ascending: true })

    if (error) throw error
    const result = (data || []) as SolarPackage[]
    setCache(key, result)
    return result
  })
}

// Fetch solar addons
export async function getSolarAddons(): Promise<SolarAddon[]> {
  const key = getCacheKey("solar_addons")
  return deduplicatedFetch(key, async () => {
    const { data, error } = await supabase
      .from("solar_addons")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error
    const result = (data || []) as SolarAddon[]
    setCache(key, result)
    return result
  })
}

// Fetch a single page by path/slug
export async function getCmsPage(path: string): Promise<CmsPage | null> {
  const key = getCacheKey("cms_page", { path })
  return deduplicatedFetch(key, async () => {
    const { data: page, error } = await supabase
      .from("pages")
      .select(`
        *,
        page_sections (*)
      `)
      .eq("path", path)
      .eq("status", "published")
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }

    if (!page) return null

    const result = {
      id: page.slug,
      path: page.path,
      title: page.title,
      description: page.meta_description,
      sections: (page.page_sections || []).map((s: any) => ({
        id: s.id,
        heading: s.title,
        body: s.content?.body || "",
        image: s.content?.image,
      })),
      updatedAt: page.updated_at,
    }

    setCache(key, result)
    return result
  })
}

// Fetch page sections for a specific page
export async function getPageSections(pageId: string): Promise<PageSection[]> {
  const key = getCacheKey("page_sections", { pageId })
  return deduplicatedFetch(key, async () => {
    const { data, error } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", pageId)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })

    if (error) throw error
    const result = (data || []) as PageSection[]
    setCache(key, result)
    return result
  })
}

// Fetch site settings by key
export async function getSiteSetting(key: string): Promise<any> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .eq("is_public", true)
    .eq("is_sensitive", false)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data?.value
}

// Fetch multiple site settings by category
export async function getSiteSettingsByCategory(
  category: string,
): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("category", category)
    .eq("is_public", true)
    .eq("is_sensitive", false)

  if (error) throw error

  const result: Record<string, any> = {}
  ;(data || []).forEach((item) => {
    result[item.key] = item.value
  })
  return result
}

// Fetch solar packages with optional filter
export async function getSolarPackagesFiltered(options?: {
  isActive?: boolean
  featured?: boolean
  audience?: string
  type?: string
}): Promise<SolarPackage[]> {
  const key = getCacheKey("solar_packages_filtered", options)
  return deduplicatedFetch(key, async () => {
    let query = supabase.from("solar_packages").select("*")

    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive)
    }
    if (options?.featured !== undefined) {
      query = query.eq("featured", options.featured)
    }
    if (options?.audience) {
      query = query.eq("audience", options.audience)
    }
    if (options?.type) {
      query = query.eq("type", options.type)
    }

    query = query.order("display_order", { ascending: true })

    const { data, error } = await query
    if (error) throw error
    const result = (data || []) as SolarPackage[]
    setCache(key, result)
    return result
  })
}

// Fetch solar addons with optional filter
export async function getSolarAddonsFiltered(options?: {
  isActive?: boolean
  category?: string
}): Promise<SolarAddon[]> {
  const key = getCacheKey("solar_addons_filtered", options)
  return deduplicatedFetch(key, async () => {
    let query = supabase.from("solar_addons").select("*")

    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive)
    }
    if (options?.category) {
      query = query.eq("category", options.category)
    }

    query = query.order("display_order", { ascending: true })

    const { data, error } = await query
    if (error) throw error
    const result = (data || []) as SolarAddon[]
    setCache(key, result)
    return result
  })
}

// Fetch header menu items
export async function getHeaderMenuItems(): Promise<MenuItem[]> {
  return getMenuItems("main-navigation")
}

// Fetch footer menu items
export async function getFooterMenuItems(): Promise<MenuItem[]> {
  return getMenuItems("footer-navigation")
}

// SEO settings
export type SeoSettings = {
  site_name: string
  default_title: string
  default_description: string
  default_og_image: string | null
  twitter_handle: string
  google_site_verification: string
  robots_txt: string
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const setting = await getSiteSetting("seo")
  return setting as SeoSettings
}

// Branding settings
export type BrandingSettings = {
  logo_light: string | null
  logo_dark: string | null
  favicon: string | null
  primary_color: string
  secondary_color: string
  font_heading: string
  font_body: string
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  const setting = await getSiteSetting("branding")
  return setting as BrandingSettings
}

// Maintenance settings
export type MaintenanceSettings = {
  enabled: boolean
  message: string
  allowed_ips: string[]
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const setting = await getSiteSetting("maintenance")
  return setting as MaintenanceSettings
}

// Contact form settings
export type ContactFormSettings = {
  email: string
  phone: string
  address: string
  hours: string
  map_embed_url: string
  contact_form_enabled: boolean
  quote_form_enabled: boolean
}

export async function getContactFormSettings(): Promise<ContactFormSettings> {
  const setting = await getSiteSetting("contact")
  return setting as ContactFormSettings
}
