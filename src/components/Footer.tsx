import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Logo from "./Logo"
import {
  getSiteSettings,
  type SiteSettings,
  getFooterMenuItems,
  type MenuItem,
} from "../lib/cms"

function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [footerMenuItems, setFooterMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [siteSettings, menuItems] = await Promise.all([
          getSiteSettings(),
          getFooterMenuItems(),
        ])
        setSettings(siteSettings)
        setFooterMenuItems(menuItems)
      } catch (err) {
        console.error("Failed to load footer data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const companyName = settings?.companyName ?? "Solar Mechanics"
  const phone = settings?.phone ?? "+63 949 929 0711"
  const email = settings?.email ?? "solarmechanics.corporation@gmail.com"
  const address = settings?.address ?? "Metro Manila, Philippines"

  // Build footer link groups from menu items
  const solutionsLinks = footerMenuItems.filter((item) =>
    [
      "/solar-solutions",
      "/solar-calculator",
      "/electrical-services",
      "/training-center",
    ].includes(item.url),
  )
  const companyLinks = footerMenuItems.filter((item) =>
    ["/about", "/projects", "/contact", "/quote"].includes(item.url),
  )

  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <Logo inverse />
          <p>
            Solar Mechanics provides solar supply and installation planning for
            homes and businesses in the Philippines. Electrical services and
            training programs are listed as planned offerings.
          </p>
        </div>
        <div>
          <h4>Solutions</h4>
          {solutionsLinks.map((item) => (
            <Link key={item.id} to={item.url}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h4>Company</h4>
          {companyLinks.map((item) => (
            <Link key={item.id} to={item.url}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h4>Contact</h4>
          <p>
            {phone}
            <br />
            {email}
            <br />
            {address}
          </p>
          <small>
            Contact channels and service coverage are subject to confirmation.
          </small>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Solar Mechanics.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  )
}

export default Footer
