import { solarCalibration, type SolarPackage } from "../config/solarCalibration";
import { peso } from "../lib/format";
import Button from "./Button";
import Icon from "./Icon";

function SolarPackageCard({
  item,
  onView,
  compare,
  toggleCompare,
}: {
  item: SolarPackage;
  onView?: (id: string) => void;
  compare?: string[];
  toggleCompare?: (id: string) => void;
}) {
  const showPrice = solarCalibration.showIllustrativePricing;
  return (
    <article className={`package-card ${"featured" in item && item.featured ? "featured" : ""}`}>
      {"featured" in item && item.featured && <span className="featured-tag">Popular configuration</span>}
      <div className="package-head">
        <span className="icon-box"><Icon name={item.battery ? "battery" : "panel"} /></span>
        <div>
          <small>{item.audience} · {item.type}</small>
          <h3>{item.name}</h3>
        </div>
      </div>
      <div className="spec-row">
        <span><strong>{item.solar} kWp</strong>Solar array</span>
        <span><strong>{item.inverter} kW</strong>Inverter</span>
        <span><strong>{item.battery || "—"}{item.battery ? " kWh" : ""}</strong>Battery</span>
      </div>
      <ul>
        {item.includes.map((value) => (
          <li key={value}><Icon name="check" size={16} />{value}</li>
        ))}
      </ul>
      <div className="price-block">
        {showPrice ? (
          <>
            <small>Illustrative {item.priceIsPlaceholder ? "placeholder" : ""} price</small>
            <strong>{peso(item.price)}</strong>
            <em>Not an official quotation</em>
          </>
        ) : (
          <>
            <small>Pricing</small>
            <strong>Request a Quote</strong>
            <em>Price confirmed after assessment</em>
          </>
        )}
      </div>
      <div className="card-actions">
        <Button variant="secondary" onClick={() => onView?.(item.id)}>View Package</Button>
        <Button to="/solar-calculator">Calculate My Needs</Button>
      </div>
      {toggleCompare && (
        <label className="compare-check">
          <input
            type="checkbox"
            checked={compare?.includes(item.id)}
            disabled={!compare?.includes(item.id) && (compare?.length || 0) >= 3}
            onChange={() => toggleCompare(item.id)}
          />
          Add to comparison
        </label>
      )}
    </article>
  );
}

export default SolarPackageCard;
