import { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "./Button";
import Icon from "./Icon";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/solar-solutions", label: "Solar Solutions" },
  { to: "/electrical-services", label: "Electrical Services" },
  { to: "/training-center", label: "Solar Training Center" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell nav">
        <Logo />
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Button to="/quote">Get a Solar Quote <Icon name="arrow" size={17} /></Button>
        <button
          className="menu"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} size={25} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
