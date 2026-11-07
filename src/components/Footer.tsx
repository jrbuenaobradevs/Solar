import { Link } from "react-router-dom";
import Logo from "./Logo";

function Footer() {
  return (
    <footer>
      <div className="shell footer-grid">
        <div>
          <Logo inverse />
          <p>
            Solar Mechanics provides solar supply and installation planning for homes and businesses
            in the Philippines, presented in association with EEC Builders Corp. Electrical services
            and training programs are listed as planned offerings.
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
            +63 917 000 0000<br />
            hello@solarmechanics.example<br />
            Metro Manila, Philippines
          </p>
          <small>Placeholder contact details — replace with verified company information.</small>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Solar Mechanics. Associated with EEC Builders Corp.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
}

export default Footer;
