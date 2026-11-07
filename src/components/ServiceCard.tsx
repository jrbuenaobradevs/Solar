import { Link } from "react-router-dom";
import Icon from "./Icon";
import ServiceStatusBadge from "./ServiceStatusBadge";

function ServiceCard({
  icon,
  title,
  description,
  to,
  cta,
  planned = false,
}: {
  icon: string;
  title: string;
  description: string;
  to?: string;
  cta?: string;
  planned?: boolean;
}) {
  return (
    <article className="service-card">
      <span className="icon-box"><Icon name={icon} /></span>
      {planned && <ServiceStatusBadge />}
      <h3>{title}</h3>
      <p>{description}</p>
      {to && cta && (
        <Link to={to} className="text-link">
          {cta} <Icon name="arrow" size={16} />
        </Link>
      )}
    </article>
  );
}

export default ServiceCard;
