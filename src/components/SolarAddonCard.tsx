import { solarCalibration } from "../config/solarCalibration"
import { peso } from "../lib/format"
import Button from "./Button"
import Icon from "./Icon"
import type { SolarAddon } from "../lib/cms"

function SolarAddonCard({ item }: { item: SolarAddon }) {
  return (
    <article className="package-card">
      <div className="package-head">
        <span className="icon-box">
          <Icon name={item.icon || "battery"} />
        </span>
        <div>
          <small>Add-on</small>
          <h3>{item.name}</h3>
        </div>
      </div>
      <p className="addon-spec">{item.spec}</p>
      <p className="addon-copy">{item.description || ""}</p>
      <div className="price-block">
        {solarCalibration.showIllustrativePricing ? (
          <>
            <small>{item.priceIsFrom ? "From" : "Illustrative price"}</small>
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
      <div className="card-actions addon-actions">
        <Button to="/quote">Request this add-on</Button>
      </div>
    </article>
  )
}

export default SolarAddonCard
