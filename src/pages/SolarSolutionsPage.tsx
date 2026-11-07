import { useMemo, useState } from "react";
import Button from "../components/Button";
import ContactCTA from "../components/ContactCTA";
import FAQSection from "../components/FAQSection";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";
import SolarPackageCard from "../components/SolarPackageCard";
import { solarCalibration } from "../config/solarCalibration";
import { solarFaqs } from "../data/faqs";
import { peso } from "../lib/format";

function SolarSolutionsPage() {
  const packages = solarCalibration.packages;
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [audience, setAudience] = useState("All");
  const [sort, setSort] = useState("capacity");
  const [compare, setCompare] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);

  const shown = useMemo(() => {
    return packages
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && (type === "All" || p.type === type) && (audience === "All" || p.audience === audience))
      .slice()
      .sort((a, b) => (sort === "price" ? a.price - b.price : a.solar - b.solar));
  }, [packages, search, type, audience, sort]);

  const selected = packages.filter((p) => compare.includes(p.id));
  const chosen = packages.find((p) => p.id === detail);
  const toggle = (id: string) => setCompare((old) => old.includes(id) ? old.filter((x) => x !== id) : old.length < 3 ? [...old, id] : old);

  return (
    <div className="page">
      <PageHero
        kicker="Solar Solutions"
        title="Supply, installation, and a practical energy calculator."
        text="Compare hybrid, on-grid, and off-grid configurations, then estimate your loads. Catalog prices are placeholders until a site assessment produces a formal quotation."
      />

      <section className="section compact">
        <div className="shell">
          <div className="three-grid system-types">
            <article className="benefit-card">
              <h3>On-grid</h3>
              <p>Works with the utility. These systems typically shut down during a grid outage unless backup equipment is added.</p>
            </article>
            <article className="benefit-card">
              <h3>Hybrid</h3>
              <p>Combines solar with batteries so selected loads can continue during an outage when the system is specified for backup.</p>
            </article>
            <article className="benefit-card">
              <h3>Off-grid</h3>
              <p>Designed to operate without a utility connection. Sizing depends on loads, autonomy, and generation — not a default for every site.</p>
            </article>
          </div>

          <div className="notice top-space">
            <strong>Quotation process:</strong> Use the calculator, request a quote, then a technical assessment confirms equipment, roof conditions, permits, and price.
          </div>

          <div className="action-row top-space">
            <Button to="/solar-calculator">Open the solar calculator <Icon name="arrow" size={17} /></Button>
            <Button variant="secondary" to="/quote">Get a Solar Quote</Button>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="shell">
          <div className="filter-bar">
            <label className="search-field">
              <Icon name="search" size={18} />
              <input aria-label="Search packages" placeholder="Search packages" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <select aria-label="System type" value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option><option>On-Grid</option><option>Hybrid</option><option>Off-Grid</option>
            </select>
            <select aria-label="Property category" value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option>All</option><option>Residential</option><option>Commercial</option>
            </select>
            <select aria-label="Sort packages" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="capacity">Sort: Capacity</option>
              <option value="price">Sort: Placeholder price</option>
            </select>
          </div>
          {shown.length ? (
            <div className="package-grid">
              {shown.map((item) => (
                <SolarPackageCard key={item.id} item={item} onView={setDetail} compare={compare} toggleCompare={toggle} />
              ))}
            </div>
          ) : (
            <div className="empty-state"><h2>No matching packages</h2><p>Try changing your search or filters.</p></div>
          )}
          {selected.length > 0 && (
            <section className="comparison">
              <div className="comparison-head">
                <div><span>System comparison</span><h2>Compare selected configurations</h2></div>
                <button type="button" onClick={() => setCompare([])}>Clear comparison</button>
              </div>
              <div className="compare-table">
                <div className="compare-row compare-titles">
                  <strong>Specification</strong>
                  {selected.map((p) => <strong key={p.id}>{p.name}</strong>)}
                </div>
                {[
                  ["Placeholder price", (p: typeof selected[number]) => solarCalibration.showIllustrativePricing ? peso(p.price) : "Request a Quote"],
                  ["Solar capacity", (p: typeof selected[number]) => `${p.solar} kWp`],
                  ["Est. daily generation", (p: typeof selected[number]) => `${p.generation} kWh`],
                  ["Inverter", (p: typeof selected[number]) => `${p.inverter} kW`],
                  ["Battery", (p: typeof selected[number]) => p.battery ? `${p.battery} kWh` : "None"],
                  ["Grid during outage", (p: typeof selected[number]) => p.type === "On-Grid" ? "Typically no backup" : "Backup when specified"],
                ].map(([label, get]) => (
                  <div className="compare-row" key={String(label)}>
                    <span>{label}</span>
                    {selected.map((p) => <span key={p.id}>{(get as (pkg: typeof p) => string)(p)}</span>)}
                  </div>
                ))}
              </div>
              <p className="table-note">No system is universally best. Final selection depends on your property, usage, budget, and backup needs.</p>
            </section>
          )}
        </div>
      </section>

      {chosen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDetail(null)}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${chosen.name} details`} onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close package details" onClick={() => setDetail(null)}><Icon name="close" /></button>
            <span className="eyebrow">Package details</span>
            <h2>{chosen.name}</h2>
            <p>{chosen.panels} with a {chosen.inverter} kW {chosen.type.toLowerCase()} inverter.</p>
            <div className="detail-specs">
              <span><small>Solar</small><strong>{chosen.solar} kWp</strong></span>
              <span><small>Daily generation</small><strong>≈ {chosen.generation} kWh</strong></span>
              <span><small>Battery</small><strong>{chosen.battery ? `${chosen.battery} kWh LFP` : "Not included"}</strong></span>
            </div>
            <h3>Included services</h3>
            <ul>{chosen.includes.map((x) => <li key={x}><Icon name="check" size={16} />{x}</li>)}</ul>
            <div className="notice"><strong>Important:</strong> Equipment models, exclusions, transportation, roof work, permits, and final price are subject to technical assessment.</div>
            <Button to="/quote">Request a Formal Quote <Icon name="arrow" size={17} /></Button>
          </section>
        </div>
      )}

      <FAQSection items={solarFaqs} />
      <ContactCTA />
    </div>
  );
}

export default SolarSolutionsPage;
