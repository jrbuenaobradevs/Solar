import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { getSiteSettings, type SiteSettings } from "../lib/cms";

function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(s => setSettings(s)).catch(() => {});
  }, []);

  const companyName = settings?.companyName ?? "Solar Mechanics";
  const phone = settings?.phone ?? "+63 917 000 0000";
  const email = settings?.email ?? "hello@solarmechanics.example";
  const address = settings?.address ?? "Metro Manila, Philippines";

  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <Logo inverse />
          <p>
            Solar Mechanics provides solar supply and installation planning for homes and businesses
            in the Philippines. Electrical services and training programs are listed as planned
            offerings.
          </p>
        </div>
        <div>
          <h4>Solutions</h4>
          <Link to="/solar-solutions">Solar solutions</Link>
          <Link to="/solar-calculator">Solar calculator</Link>
          <Link to="/electrical-services">Electrical services</Link>
          <Link to="/training-center">Training center</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About us</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/quote">Get a solar quote</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>
            {phone}<br />
            {email}<br />
            {address}
          </p>
          <small>Contact channels and service coverage are subject to confirmation.</small>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Solar Mechanics.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
}

export default Footer;
