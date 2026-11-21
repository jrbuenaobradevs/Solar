import { supabase } from "../config/supabase";

export type CmsPage = {
  id: string;
  path: string;
  title: string;
  description: string;
  sections: { id: string; heading: string; body: string; image?: string }[];
  updatedAt: string
};

export type InquiryStatus = "new" | "in_progress" | "contacted" | "completed" | "cancelled";
export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  source: "contact" | "quote"
};

export type SiteSettings = {
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  facebook: string;
  instagram: string;
  linkedin: string
};

export type SolarPackage = {
  id: string;
  name: string;
  audience: string;
  type: string;
  solar: number;
  inverter: number;
  battery: number | null;
  panels: string;
  generation: number;
  price: number;
  includes: string[];
  featured: boolean;
};

export type SolarAddon = {
  id: string;
  name: string;
  spec: string;
  price: number;
  icon?: string;
  description?: string;
  priceIsFrom?: boolean;
};

// Fetch all pages with sections
export async function getCmsPages(): Promise<CmsPage[]> {
  const { data: pages, error } = await supabase
    .from('pages')
    .select(`
      *,
      page_sections (*)
    `)
    .eq('status', 'published')
    .order('sort_order', { referencedTable: 'page_sections', ascending: true });

  if (error) throw error;

  return (pages || []).map(p => ({
    id: p.slug, // Using slug as ID to match legacy structure
    path: p.path,
    title: p.title,
    description: p.meta_description,
    sections: (p.page_sections || []).map((s: any) => ({
      id: s.id,
      heading: s.title,
      body: s.content?.body || "",
      image: s.content?.image
    })),
    updatedAt: p.updated_at
  }));
}

// Fetch site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'company')
    .single();

  if (error) throw error;
  return data.value as SiteSettings;
}

// Record an inquiry
export async function recordInquiry(input: {
  inquiry_type: "contact" | "quote";
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('contact_inquiries')
    .insert([{
      inquiry_type: input.inquiry_type,
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch solar packages
export async function getSolarPackages(): Promise<SolarPackage[]> {
  const { data, error } = await supabase
    .from('solar_packages')
    .select('*')
    .order('solar', { ascending: true });

  if (error) throw error;
  return (data || []) as SolarPackage[];
}

// Fetch solar addons
export async function getSolarAddons(): Promise<SolarAddon[]> {
  const { data, error } = await supabase
    .from('solar_addons')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as SolarAddon[];
}

// ============================================================
// LOCAL-ONLY ADMIN FUNCTIONS (localStorage-based, for AdminPage.tsx prototype)
// These are NOT connected to Supabase and only persist in this browser.
// ============================================================

export type CmsData = {
  pages: CmsPage[];
  settings: SiteSettings;
  inquiries: Inquiry[];
};

// Local storage key
const LOCAL_CMS_KEY = "solmech_cms_v1";

// Default CMS data for local development
const defaultCmsData: CmsData = {
  pages: [
    {
      id: "home",
      path: "/",
      title: "Powering a Cleaner, Brighter Tomorrow.",
      description: "Your partner in solar power solutions, electrical services, and practical solar training.",
      sections: [
        { id: "offer", heading: "Three service areas. Solar is ready first.", body: "Solar Solutions is the functional path in this release. Electrical Services and the Training Center are introduced as planned offerings.", image: "" },
        { id: "why", heading: "Practical energy solutions, sized around your property.", body: "Every site is different. We start with your loads and usage, then a technical assessment confirms the design before any formal quotation.", image: "" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "solar-solutions",
      path: "/solar-solutions",
      title: "Supply, installation, and a practical energy calculator.",
      description: "Compare hybrid, on-grid, and off-grid configurations, then estimate your loads. Catalog prices are placeholders until a site assessment produces a formal quotation.",
      sections: [
        { id: "types", heading: "Solar system types", body: "On-grid, hybrid, and off-grid solutions with technical assessment before quotation.", image: "" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "solar-calculator",
      path: "/solar-calculator",
      title: "Estimate your energy use, then request a quotation.",
      description: "Add appliances first. Contact details are collected only when you request a quote.",
      sections: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "quote",
      path: "/quote",
      title: "Send your estimate for technical review.",
      description: "Your calculator results stay on this form. Submit for review.",
      sections: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "electrical-services",
      path: "/electrical-services",
      title: "Planned electrical supply and installation support.",
      description: "This page introduces future electrical service categories. It is not a booking, ordering, or work-order system. Availability of regulated electrical work is subject to confirmation.",
      sections: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "training-center",
      path: "/training-center",
      title: "Proposed courses in solar knowledge and installation skills.",
      description: "These topics are planned. This page is not a learning management system. No schedules, fees, duration, accreditation, or enrollment seats are published here.",
      sections: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "about",
      path: "/about",
      title: "Solar energy, electrical services, and practical training.",
      description: "Solar Mechanics helps properties plan solar power and electrical services.",
      sections: [
        { id: "who", heading: "Helping properties plan cleaner power with clear estimates.", body: "We help homeowners and businesses estimate solar energy needs, compare system types, and request a technical quotation.", image: "" }
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: "contact",
      path: "/contact",
      title: "Tell us about your property and energy goals.",
      description: "Get in touch with Solar Mechanics for your solar and electrical inquiries.",
      sections: [],
      updatedAt: new Date().toISOString()
    },
    {
      id: "projects",
      path: "/projects",
      title: "Representative solar installations.",
      description: "Photos are stock imagery used for layout. They are not verified Solar Mechanics project records and must be replaced with approved assets.",
      sections: [],
      updatedAt: new Date().toISOString()
    }
  ],
  settings: {
    companyName: "Solar Mechanics",
    description: "Solar supply and installation planning for homes and businesses in the Philippines.",
    address: "Metro Manila, Philippines",
    phone: "+63 917 000 0000",
    email: "hello@solarmechanics.example",
    hours: "To be confirmed",
    facebook: "",
    instagram: "",
    linkedin: ""
  },
  inquiries: []
};

// Local getCms - for AdminPage only (localStorage)
export function getCms(): CmsData {
  try {
    const stored = localStorage.getItem(LOCAL_CMS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all pages have updatedAt
      parsed.pages = parsed.pages.map((p: CmsPage) => ({
        ...p,
        updatedAt: p.updatedAt || new Date().toISOString()
      }));
      return parsed;
    }
  } catch {}
  return defaultCmsData;
}

// Local saveCms - for AdminPage only (localStorage)
export function saveCms(data: CmsData) {
  localStorage.setItem(LOCAL_CMS_KEY, JSON.stringify(data));
}

// Local getPage - for AdminPage only (localStorage)
export function getPage(slug: string): CmsPage | undefined {
  return getCms().pages.find(p => p.id === slug);
}
