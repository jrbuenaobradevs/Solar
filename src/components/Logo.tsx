import { Link } from "react-router-dom";

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`brand ${inverse ? "inverse" : ""}`} aria-label="Solar Mechanics home">
      <img className="brand-mark" src="/solar-mechanics.png" alt="" />
      <span>
        <strong>SOLAR MECHANICS</strong>
        <small>EEC BUILDERS CORP.</small>
      </span>
    </Link>
  );
}

export default Logo;
