import { useMemo, useState } from "react";

type Page = "home" | "packages" | "estimator" | "services" | "projects" | "about" | "contact" | "admin";
type SystemType = "Hybrid" | "On-Grid" | "Off-Grid";
type Appliance = { id: number; name: string; qty: number; watts: number; hours: number; critical: boolean };

const images = {
  hero: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&q=88&w=1600",
  home: "https://images.unsplash.com/photo-1583345237708-add35a664d77?auto=format&fit=crop&q=80&w=1000",
  commercial: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000",
  install: "https://images.unsplash.com/photo-1660330589257-813305a4a383?auto=format&fit=crop&q=80&w=1000",
};

const applianceCatalog = [
  ["Air conditioner", 1100, 8], ["Refrigerator", 150, 12], ["Electric fan", 65, 8],
  ["Television", 100, 5], ["Lighting", 12, 6], ["Desktop computer", 250, 8],
  ["Laptop", 65, 8], ["Washing machine", 500, 1], ["Water pump", 750, 2],
  ["Rice cooker", 700, 1], ["Other custom appliance", 100, 1],
] as const;

const demoPackages = [
  {
    id: "essential", name: "Essential Solar", audience: "Residential", type: "On-Grid" as SystemType,
    solar: 3.3, inverter: 3, battery: 0, panels: "6 × 550W mono panels", generation: 13.2,
    price: 198000, warranty: "12-year product / 25-year output",
    includes: ["Solar panels and grid-tied inverter", "Roof mounting system", "Electrical protection", "Standard installation"],
  },
  {
    id: "hybrid", name: "Home Hybrid", audience: "Residential", type: "Hybrid" as SystemType,
    solar: 5.5, inverter: 5, battery: 10.2, panels: "10 × 550W mono panels", generation: 22,
    price: 498000, warranty: "12-year product / 25-year output",
    includes: ["Solar panels and hybrid inverter", "10.2 kWh LFP battery", "Backup load subpanel", "Installation and commissioning"],
    featured: true,
  },
  {
    id: "business", name: "Business Solar", audience: "Commercial", type: "On-Grid" as SystemType,
    solar: 16.5, inverter: 15, battery: 0, panels: "30 × 550W mono panels", generation: 66,
    price: 928000, warranty: "12-year product / 25-year output",
    includes: ["Commercial-grade solar array", "Three-phase inverter", "Monitoring and protection", "Engineering and installation"],
  },
  {
    id: "resilience", name: "Resilience Plus", audience: "Commercial", type: "Hybrid" as SystemType,
    solar: 11, inverter: 10, battery: 20.4, panels: "20 × 550W mono panels", generation: 44,
    price: 1098000, warranty: "12-year product / 10-year battery",
    includes: ["High-efficiency solar array", "Hybrid three-phase inverter", "20.4 kWh LFP storage", "Priority-load integration"],
  },
];

const peso = (value: number) => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", maximumFractionDigits: 0,
}).format(value);

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    battery: <><rect x="3" y="6" width="17" height="12" rx="2" /><path d="M20 10h2v4h-2M7 10v4M10 12H4" /></>,
    bolt: <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />,
    building: <><path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h1M14 10h1M9 14h1M14 14h1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    minus: <path d="M5 12h14" />,
    panel: <><path d="M4 4h16l2 13H2L4 4ZM12 4v13M3 11h18M8 21h8M12 17v4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  };
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none">{paths[name]}</svg>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <span className={`brand ${inverse ? "inverse" : ""}`}>
    <img className="brand-mark" src="/eec-builders-logo.png" alt="" aria-hidden="true" />
    <span><strong>SOLAR ALL</strong><small>EEC BUILDERS CORP.</small></span>
  </span>;
}

function Button({ children, onClick, variant = "primary", type = "button", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${variant}`}>{children}</button>;
}

function Header({ page, go }: { page: Page; go: (page: Page) => void }) {
  const [open, setOpen] = useState(false);
  const links: [Page, string][] = [
    ["home", "Home"], ["packages", "Solar Packages"], ["estimator", "Solar Estimator"],
    ["services", "Services"], ["projects", "Projects"], ["about", "About Us"], ["contact", "Contact"],
  ];
  const navigate = (next: Page) => { go(next); setOpen(false); };
  return <header className="site-header">
    <div className="shell nav">
      <button className="logo-button" onClick={() => navigate("home")} aria-label="Solar All home"><Logo /></button>
      <nav className={open ? "open" : ""} aria-label="Main navigation">
        {links.map(([id, label]) => <button className={page === id ? "active" : ""} key={id} onClick={() => navigate(id)}>{label}</button>)}
      </nav>
      <Button onClick={() => navigate("contact")}>Get a Free Quote <Icon name="arrow" size={17} /></Button>
      <button className="menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} size={25} /></button>
    </div>
  </header>;
}

function Footer({ go }: { go: (page: Page) => void }) {
  return <footer>
    <div className="shell footer-grid">
      <div><Logo inverse /><p>Solar All is the renewable energy solutions brand of EEC Builders Corp., serving homes and businesses across the Philippines.</p></div>
      <div><h4>Solutions</h4><button onClick={() => go("packages")}>Solar packages</button><button onClick={() => go("estimator")}>Solar estimator</button><button onClick={() => go("services")}>Technical services</button></div>
      <div><h4>Company</h4><button onClick={() => go("about")}>About us</button><button onClick={() => go("projects")}>Demo projects</button><button onClick={() => go("contact")}>Contact</button><button onClick={() => go("admin")}>Admin prototype</button></div>
      <div><h4>Contact</h4><p>+63 917 000 0000<br />hello@solarall.example<br />Metro Manila, Philippines</p><small>Placeholder contact details</small></div>
    </div>
    <div className="shell footer-bottom"><span>© 2025 EEC Builders Corp. Prototype.</span><span>Privacy · Terms · Accessibility</span></div>
  </footer>;
}

function Home({ go }: { go: (page: Page) => void }) {
  return <>
    <section className="hero">
      <div className="hero-shape" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Engineered solar solutions for the Philippines</span>
          <h1>Power Your Future with <em>Solar All</em></h1>
          <p>Discover the right solar power solution for your home or business. Estimate your energy needs, compare solar packages, and take control of your electricity costs.</p>
          <div className="action-row"><Button onClick={() => go("estimator")}>Calculate My Solar System <Icon name="arrow" size={18} /></Button><Button variant="secondary" onClick={() => go("packages")}>Explore Solar Packages</Button></div>
          <div className="benefit-strip">
            <span><Icon name="bolt" /> Reduce Electricity Costs</span>
            <span><Icon name="battery" /> Reliable Backup Power</span>
            <span><Icon name="sun" /> Sustainable Energy</span>
          </div>
        </div>
        <div className="hero-media"><img src={images.hero} alt="Solar technician installing panels on a residential roof" /><span className="demo-photo">Representative solar installation photo</span></div>
      </div>
    </section>

    <section className="section benefits">
      <div className="shell">
        <SectionTitle kicker="Why Solar All" title="Practical energy solutions, professionally delivered." text="Every property is different. Our approach begins with your actual needs and ends with a system designed for your site." />
        <div className="four-grid">
          {[
            ["bolt", "Lower grid reliance", "Use more of the energy your property produces and reduce exposure to changing utility rates."],
            ["battery", "Backup when configured", "A properly sized hybrid system can keep selected critical loads running during outages."],
            ["building", "Built around your property", "Residential and commercial configurations based on consumption, goals, and site conditions."],
            ["shield", "Technical from day one", "Professional assessment, installation, testing, documentation, and after-sales support."],
          ].map(([icon, title, text]) => <article className="benefit-card" key={title}><span className="icon-box"><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>

    <section className="section soft-section">
      <div className="shell">
        <SectionTitle kicker="Featured packages" title="A clear starting point for your solar journey." text="Illustrative prototype prices only. Final pricing requires technical assessment and an approved EEC quotation." centered />
        <PackageCards packages={demoPackages.slice(0, 3)} onView={() => go("packages")} onCalculate={() => go("estimator")} />
      </div>
    </section>

    <section className="section">
      <div className="shell">
        <SectionTitle kicker="How it works" title="From your first calculation to system commissioning." />
        <div className="steps-grid">
          {["Calculate your energy requirements", "Explore recommended solar systems", "Request a customized quotation", "Schedule assessment and installation"].map((text, i) =>
            <article key={text}><span>0{i + 1}</span><h3>{text}</h3><p>{["Tell us about your property, bill, appliances, and backup priorities.", "Compare preliminary system sizes, capabilities, and illustrative pricing.", "Review your estimate, provide your details, and request a formal proposal.", "An engineer validates the design before any final quotation or installation."][i]}</p></article>)}
        </div>
      </div>
    </section>

    <section className="section projects-preview">
      <div className="shell">
        <SectionTitle kicker="Projects & perspectives" title="Solar solutions for real-world spaces." text="All projects and testimonials below are demo content for prototype review." />
        <div className="project-grid">
          {[["Residential hybrid", "Cavite · Demo project", images.home], ["Commercial on-grid", "Metro Manila · Demo project", images.commercial], ["Residential installation", "Laguna · Demo project", images.install]].map(([title, sub, image]) =>
            <article className="project-card" key={title}><img src={image} alt={`Representative ${title} solar project`} /><span className="demo-label">Demo project</span><div><h3>{title}</h3><p>{sub}</p></div></article>)}
        </div>
        <div className="testimonials">
          {[
            ["“The estimator helped us understand which appliances affected our system size before speaking with the technical team.”", "Sample homeowner · Replace before launch"],
            ["“The side-by-side options made the trade-offs between grid savings and backup capacity much clearer.”", "Sample business owner · Replace before launch"],
          ].map(([quote, person]) => <blockquote key={person}><span>Sample testimonial</span><p>{quote}</p><cite>{person}</cite></blockquote>)}
        </div>
      </div>
    </section>
    <Cta go={go} />
  </>;
}

function SectionTitle({ kicker, title, text, centered = false }: { kicker: string; title: string; text?: string; centered?: boolean }) {
  return <div className={`section-title ${centered ? "centered" : ""}`}><span>{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function PackageCards({ packages, onView, onCalculate, compare, toggleCompare }: {
  packages: typeof demoPackages; onView: (id: string) => void; onCalculate: () => void;
  compare?: string[]; toggleCompare?: (id: string) => void;
}) {
  return <div className="package-grid">{packages.map((item) => <article className={`package-card ${item.featured ? "featured" : ""}`} key={item.id}>
    {item.featured && <span className="featured-tag">Popular configuration</span>}
    <div className="package-head"><span className="icon-box"><Icon name={item.battery ? "battery" : "panel"} /></span><div><small>{item.audience} · {item.type}</small><h3>{item.name}</h3></div></div>
    <div className="spec-row"><span><strong>{item.solar} kWp</strong>Solar array</span><span><strong>{item.inverter} kW</strong>Inverter</span><span><strong>{item.battery || "—"}{item.battery ? " kWh" : ""}</strong>Battery</span></div>
    <ul>{item.includes.map(value => <li key={value}><Icon name="check" size={16} />{value}</li>)}</ul>
    <div className="price-block"><small>Illustrative demo price</small><strong>{peso(item.price)}</strong><em>Not an official quotation</em></div>
    <div className="card-actions"><Button onClick={() => onView(item.id)} variant="secondary">View Package</Button><Button onClick={onCalculate}>Calculate My Needs</Button></div>
    {toggleCompare && <label className="compare-check"><input type="checkbox" checked={compare?.includes(item.id)} disabled={!compare?.includes(item.id) && (compare?.length || 0) >= 3} onChange={() => toggleCompare(item.id)} /> Add to comparison</label>}
  </article>)}</div>;
}

function Packages({ go }: { go: (page: Page) => void }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [audience, setAudience] = useState("All");
  const [sort, setSort] = useState("capacity");
  const [compare, setCompare] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const shown = demoPackages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && (type === "All" || p.type === type) && (audience === "All" || p.audience === audience))
    .sort((a, b) => sort === "price" ? a.price - b.price : a.solar - b.solar);
  const selected = demoPackages.filter(p => compare.includes(p.id));
  const chosen = demoPackages.find(p => p.id === detail);
  const toggle = (id: string) => setCompare(old => old.includes(id) ? old.filter(x => x !== id) : old.length < 3 ? [...old, id] : old);
  return <div className="page">
    <PageHero kicker="Demo product catalog" title="Compare solar packages with confidence." text="Explore indicative configurations, filter by your priorities, and compare up to three systems side by side." />
    <section className="section compact"><div className="shell">
      <div className="filter-bar">
        <label className="search-field"><Icon name="search" size={18} /><input aria-label="Search packages" placeholder="Search packages" value={search} onChange={e => setSearch(e.target.value)} /></label>
        <select aria-label="System type" value={type} onChange={e => setType(e.target.value)}><option>All</option><option>On-Grid</option><option>Hybrid</option><option>Off-Grid</option></select>
        <select aria-label="Property category" value={audience} onChange={e => setAudience(e.target.value)}><option>All</option><option>Residential</option><option>Commercial</option></select>
        <select aria-label="Sort packages" value={sort} onChange={e => setSort(e.target.value)}><option value="capacity">Sort: Capacity</option><option value="price">Sort: Demo price</option></select>
      </div>
      {shown.length ? <PackageCards packages={shown} onView={setDetail} onCalculate={() => go("estimator")} compare={compare} toggleCompare={toggle} /> : <EmptyState title="No matching packages" text="Try changing your search or filters." />}
      {selected.length > 0 && <Comparison packages={selected} onClear={() => setCompare([])} />}
    </div></section>
    {chosen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setDetail(null)}><section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${chosen.name} details`} onMouseDown={e => e.stopPropagation()}>
      <button className="modal-close" aria-label="Close package details" onClick={() => setDetail(null)}><Icon name="close" /></button>
      <span className="eyebrow">Demo package details</span><h2>{chosen.name}</h2><p>{chosen.panels} with a {chosen.inverter} kW {chosen.type.toLowerCase()} inverter.</p>
      <div className="detail-specs"><span><small>Solar</small><strong>{chosen.solar} kWp</strong></span><span><small>Daily generation</small><strong>≈ {chosen.generation} kWh</strong></span><span><small>Battery</small><strong>{chosen.battery ? `${chosen.battery} kWh LFP` : "Not included"}</strong></span></div>
      <h3>Included services</h3><ul>{chosen.includes.map(x => <li key={x}><Icon name="check" size={16} />{x}</li>)}</ul>
      <div className="notice"><strong>Important:</strong> Equipment models, exclusions, transportation, roof remediation, permits, and final price are subject to technical assessment. Demo data only.</div>
      <Button onClick={() => go("contact")}>Request a Formal Quote <Icon name="arrow" size={17} /></Button>
    </section></div>}
  </div>;
}

function Comparison({ packages, onClear }: { packages: typeof demoPackages; onClear: () => void }) {
  const rows: [string, (p: typeof demoPackages[number]) => string][] = [
    ["Demo price", p => peso(p.price)], ["Solar capacity", p => `${p.solar} kWp`], ["Est. daily generation", p => `${p.generation} kWh`],
    ["Inverter", p => `${p.inverter} kW`], ["Battery", p => p.battery ? `${p.battery} kWh` : "None"],
    ["Grid dependency", p => p.type === "Off-Grid" ? "None" : p.type === "Hybrid" ? "Reduced" : "Grid connected"], ["Warranty", p => p.warranty],
  ];
  return <section className="comparison"><div className="comparison-head"><div><span>System comparison</span><h2>Compare selected configurations</h2></div><button onClick={onClear}>Clear comparison</button></div>
    <div className="compare-table"><div className="compare-row compare-titles"><strong>Specification</strong>{packages.map(p => <strong key={p.id}>{p.name}</strong>)}</div>
      {rows.map(([label, get]) => <div className="compare-row" key={label}><span>{label}</span>{packages.map(p => <span key={p.id}>{get(p)}</span>)}</div>)}
    </div><p className="table-note">No system is universally best. Final selection depends on your property, usage pattern, budget, and backup priorities.</p>
  </section>;
}

function Estimator({ go }: { go: (page: Page) => void }) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState("Residential");
  const [bill, setBill] = useState(7000);
  const [region, setRegion] = useState("National Capital Region");
  const [province, setProvince] = useState("Metro Manila");
  const [city, setCity] = useState("");
  const [systemType, setSystemType] = useState<SystemType>("Hybrid");
  const [goal, setGoal] = useState("Lower electricity costs");
  const [grid, setGrid] = useState(true);
  const [backupHours, setBackupHours] = useState(4);
  const [includeAc, setIncludeAc] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: 1, name: "Refrigerator", qty: 1, watts: 150, hours: 12, critical: true },
    { id: 2, name: "Electric fan", qty: 2, watts: 65, hours: 8, critical: true },
    { id: 3, name: "Lighting", qty: 8, watts: 12, hours: 6, critical: true },
  ]);
  const [selectedConfig, setSelectedConfig] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", schedule: "", notes: "" });
  const daily = appliances.reduce((sum, a) => sum + a.qty * a.watts * a.hours / 1000, 0);
  const monthly = daily * 30;
  const criticalWatts = appliances.filter(a => a.critical && (includeAc || !a.name.toLowerCase().includes("air"))).reduce((sum, a) => sum + a.qty * a.watts, 0);
  const criticalKwh = criticalWatts * backupHours / 1000;
  const battery = systemType === "On-Grid" ? 0 : Math.ceil((criticalKwh / .8 / .9) * 10) / 10;
  const baseSolar = Math.max(2.2, Math.ceil((daily / 4 / .8) * 10) / 10);
  const inverter = Math.max(3, Math.ceil((criticalWatts * 1.25) / 1000));
  const configs = [
    { label: "Lean", solar: +(baseSolar * .8).toFixed(1), battery: +(battery * .7).toFixed(1), coverage: 65 },
    { label: "Balanced", solar: baseSolar, battery, coverage: 82 },
    { label: "High coverage", solar: +(baseSolar * 1.25).toFixed(1), battery: +(battery * 1.3).toFixed(1), coverage: 95 },
  ];
  const config = configs[selectedConfig];
  const panels = Math.ceil(config.solar / .55);
  const panelCost = config.solar * 38000;
  const inverterCost = inverter * (systemType === "Hybrid" ? 26000 : 18000);
  const batteryCost = config.battery * 22000;
  const mounting = panels * 3500;
  const electrical = 28000;
  const labor = 45000 + config.solar * 3500;
  const subtotal = panelCost + inverterCost + batteryCost + mounting + electrical + labor;
  const tax = subtotal * .12;
  const total = subtotal + tax;
  const updateAppliance = (id: number, field: keyof Appliance, value: string | number | boolean) => setAppliances(old => old.map(a => a.id === id ? { ...a, [field]: value } : a));
  const addAppliance = (name: string) => {
    const preset = applianceCatalog.find(a => a[0] === name) || applianceCatalog[10];
    setAppliances(old => [...old, { id: Date.now(), name: preset[0], qty: 1, watts: preset[1], hours: preset[2], critical: false }]);
  };
  const canContinue = step !== 1 || Boolean(city && bill >= 500);
  if (submitted) return <div className="page"><PageHero kicker="Estimate complete" title="Your solar estimate is ready." text="This prototype has simulated your request locally. No data was sent to a real EEC backend." /><section className="section compact"><div className="shell"><div className="success-card"><span><Icon name="check" size={30} /></span><h2>Request prepared successfully</h2><p>Placeholder reference: <strong>SOLAR-DEMO-2025-001</strong></p><ol><li>An EEC representative would review your requirements.</li><li>A technical assessment would validate the preliminary sizing.</li><li>An approved formal quotation would be prepared after site assessment.</li></ol><div className="action-row"><Button onClick={() => window.print()}>Print / Download Estimate</Button><Button variant="secondary" onClick={() => go("home")}>Return Home</Button></div></div></div></section></div>;
  return <div className="page estimator-page">
    <PageHero kicker="Guided solar estimator" title="Build a preliminary system around your needs." text="Six guided steps turn your property details, appliances, and backup priorities into an indicative system recommendation." />
    <section className="estimator-shell shell">
      <div className="progress" aria-label={`Estimator step ${step} of 6`}>
        {[1,2,3,4,5,6].map(n => <button key={n} className={n === step ? "active" : n < step ? "done" : ""} onClick={() => n < step && setStep(n)}><span>{n < step ? "✓" : n}</span><small>{["Details","Appliances","Backup","System","Price","Request"][n-1]}</small></button>)}
      </div>
      <div className="estimator-layout">
        <div className="estimator-panel">
          {step === 1 && <Step title="Customer and property details" note="Start with the information that most affects system design.">
            <div className="form-grid">
              <Field label="Customer type"><Segment options={["Residential","Commercial"]} value={customer} set={setCustomer} /></Field>
              <Field label="Property type"><select><option>Single detached home</option><option>Townhouse</option><option>Office</option><option>Retail / commercial space</option><option>Industrial facility</option></select></Field>
              <Field label="Region"><select value={region} onChange={e => setRegion(e.target.value)}><option>National Capital Region</option><option>CALABARZON</option><option>Central Luzon</option><option>Central Visayas</option><option>Davao Region</option><option>Other region</option></select></Field>
              <Field label="Province"><input value={province} onChange={e => setProvince(e.target.value)} /></Field>
              <Field label="City / municipality" required><input required placeholder="e.g. Quezon City" value={city} onChange={e => setCity(e.target.value)} />{!city && <small className="field-help">Required to continue</small>}</Field>
              <Field label="Average monthly electricity bill"><div className="money-input"><span>₱</span><input type="number" min="500" value={bill} onChange={e => setBill(+e.target.value)} /></div></Field>
              <Field label="Preferred system type"><select value={systemType} onChange={e => setSystemType(e.target.value as SystemType)}><option>Hybrid</option><option>On-Grid</option><option>Off-Grid</option></select></Field>
              <Field label="Primary goal"><select value={goal} onChange={e => setGoal(e.target.value)}><option>Lower electricity costs</option><option>Backup power</option><option>Energy independence</option></select></Field>
            </div>
          </Step>}
          {step === 2 && <Step title="Appliance calculator" note="Add, edit, and review the devices that make up your daily energy use.">
            <div className="add-appliance"><select id="add-appliance"><option value="">Choose an appliance…</option>{applianceCatalog.map(a => <option key={a[0]}>{a[0]}</option>)}</select><Button onClick={() => { const el = document.getElementById("add-appliance") as HTMLSelectElement; if (el.value) { addAppliance(el.value); el.value = ""; } }}><Icon name="plus" size={17} /> Add appliance</Button></div>
            <div className="appliance-table">
              <div className="appliance-row table-header"><span>Appliance</span><span>Qty</span><span>Watts</span><span>Hours/day</span><span>kWh/day</span><span /></div>
              {appliances.map(a => <div className="appliance-row" key={a.id}>
                <input aria-label="Appliance name" value={a.name} onChange={e => updateAppliance(a.id, "name", e.target.value)} />
                <input aria-label={`${a.name} quantity`} type="number" min="1" value={a.qty} onChange={e => updateAppliance(a.id, "qty", +e.target.value)} />
                <input aria-label={`${a.name} watts`} type="number" min="1" value={a.watts} onChange={e => updateAppliance(a.id, "watts", +e.target.value)} />
                <input aria-label={`${a.name} hours per day`} type="number" min="0" max="24" step=".5" value={a.hours} onChange={e => updateAppliance(a.id, "hours", +e.target.value)} />
                <strong>{(a.qty * a.watts * a.hours / 1000).toFixed(2)}</strong>
                <button aria-label={`Remove ${a.name}`} onClick={() => setAppliances(old => old.filter(x => x.id !== a.id))}><Icon name="close" size={17} /></button>
              </div>)}
            </div>
            <div className="usage-visual"><div><strong>{daily.toFixed(1)} kWh</strong><span>Daily use</span></div><div><strong>{monthly.toFixed(0)} kWh</strong><span>Monthly use</span></div><div className="usage-bar"><span style={{ width: `${Math.min(100, daily / 40 * 100)}%` }} /></div></div>
            <p className="disclaimer-box">Nameplate wattage and actual electricity consumption may differ based on device efficiency, cycling, temperature, and usage behavior.</p>
          </Step>}
          {step === 3 && <Step title="Backup power requirements" note="Choose the essential loads you want to keep running during an outage.">
            <div className="critical-list">{appliances.map(a => <label key={a.id}><input type="checkbox" checked={a.critical} onChange={e => updateAppliance(a.id, "critical", e.target.checked)} /><span>{a.name}<small>{a.qty * a.watts} W connected load</small></span></label>)}</div>
            <div className="form-grid top-space">
              <Field label="Required backup duration"><input type="range" min="1" max="12" value={backupHours} onChange={e => setBackupHours(+e.target.value)} /><strong>{backupHours} hours</strong></Field>
              <Field label="Utility grid connection"><Segment options={["Connected","Not connected"]} value={grid ? "Connected" : "Not connected"} set={v => setGrid(v === "Connected")} /></Field>
              <Field label="Include air conditioning in backup?"><Segment options={["No","Yes"]} value={includeAc ? "Yes" : "No"} set={v => setIncludeAc(v === "Yes")} /></Field>
            </div>
            <div className="recommendation-strip"><span><small>Critical load</small><strong>{criticalWatts.toLocaleString()} W</strong></span><span><small>Energy needed</small><strong>{criticalKwh.toFixed(1)} kWh</strong></span><span><small>Preliminary battery</small><strong>{battery || 0} kWh</strong></span><span><small>Suggested inverter</small><strong>{inverter} kW</strong></span></div>
            <p className="disclaimer-box">Battery sizing assumes 90% system efficiency and 80% usable depth of discharge. Motor and compressor surge loads require final engineering validation.</p>
          </Step>}
          {step === 4 && <Step title="Recommended solar system" note="Compare three preliminary configurations. Select one to carry into pricing.">
            <div className="config-grid">{configs.map((c, i) => <button className={selectedConfig === i ? "selected" : ""} key={c.label} onClick={() => setSelectedConfig(i)}>
              <small>{c.label}</small><strong>{c.solar} kWp</strong><span>{Math.ceil(c.solar/.55)} × 550W panels</span><span>{inverter} kW inverter</span><span>{c.battery ? `${c.battery} kWh battery` : "No battery"}</span><em>≈ {c.coverage}% energy coverage</em>
            </button>)}</div>
            <div className="system-summary"><div><Icon name="sun" /><span><small>Est. daily generation</small><strong>{(config.solar * 4 * .8).toFixed(1)} kWh</strong></span></div><div><Icon name="panel" /><span><small>Panel count</small><strong>{panels} panels</strong></span></div><div><Icon name="bolt" /><span><small>Grid reliance</small><strong>{config.coverage > 90 ? "Low" : config.coverage > 75 ? "Moderate" : "Higher"}</strong></span></div><div><Icon name="battery" /><span><small>System type</small><strong>{systemType}</strong></span></div></div>
            <p className="disclaimer-box">Preliminary sizing only—not an engineered design or performance guarantee. Solar yield varies by weather, orientation, shading, soiling, and equipment.</p>
          </Step>}
          {step === 5 && <Step title="Illustrative package estimate" note="Review a transparent cost model based on demo catalog rates.">
            <div className="price-table">
              {[["Solar panels", panelCost], [`${systemType} inverter`, inverterCost], ["Battery storage", batteryCost], ["Mounting structures", mounting], ["Protection and wiring", electrical], ["Installation labor", labor]].filter(([,v]) => Number(v) > 0).map(([label,value]) => <div key={String(label)}><span>{label}</span><strong>{peso(Number(value))}</strong></div>)}
              <div className="subtotal"><span>Equipment and services subtotal</span><strong>{peso(subtotal)}</strong></div>
              <div><span>Illustrative VAT and fees (12%)</span><strong>{peso(tax)}</strong></div>
              <div className="total"><span>Illustrative estimated total</span><strong>{peso(total)}</strong></div>
            </div>
            <div className="notice"><strong>Demo pricing notice:</strong> These values are generated from a configurable prototype catalog and are not approved EEC prices or an official quotation. Transportation, permits, roof work, utility fees, and site conditions may change the total. Price upon assessment.</div>
            <div className="upgrade-grid"><label><input type="checkbox" /> Premium panel upgrade <small>Price upon assessment</small></label><label><input type="checkbox" /> Additional battery module <small>Price upon assessment</small></label></div>
          </Step>}
          {step === 6 && <Step title={review ? "Final review" : "Request a formal quote"} note={review ? "Confirm your information before preparing this simulated request." : "Tell us how to reach you and when you would prefer to speak."}>
            {!review ? <div className="form-grid">
              <Field label="Full name" required><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></Field>
              <Field label="Email address" required><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></Field>
              <Field label="Contact number" required><input type="tel" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></Field>
              <Field label="Preferred consultation schedule"><input type="datetime-local" value={form.schedule} onChange={e => setForm({...form, schedule:e.target.value})} /></Field>
              <Field label="Installation / service address" wide><textarea rows={3} value={form.address} onChange={e => setForm({...form, address:e.target.value})} /></Field>
              <Field label="Additional requirements" wide><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} /></Field>
            </div> : <div className="review-grid">
              <Review title="Customer" lines={[form.name || "Not provided", form.email, form.phone, `${customer} · ${city}, ${province}`]} />
              <Review title="Energy profile" lines={[`${daily.toFixed(1)} kWh/day`, `${monthly.toFixed(0)} kWh/month`, `${backupHours} hours requested backup`, `${appliances.length} configured appliances`]} />
              <Review title="Selected configuration" lines={[`${config.label} · ${config.solar} kWp`, `${panels} solar panels`, `${inverter} kW inverter`, `${config.battery} kWh battery`]} />
              <Review title="Illustrative estimate" lines={[peso(total), "Demo pricing only", "Final engineering and formal quote required"]} />
            </div>}
            {!review && <div className="notice"><strong>Prototype mode:</strong> Continuing creates a local review screen only. It will not send personal information to a server.</div>}
          </Step>}
          <div className="step-actions">
            <Button variant="secondary" onClick={() => review ? setReview(false) : setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
            {step < 6 ? <Button onClick={() => canContinue && setStep(step + 1)} disabled={!canContinue}>Continue <Icon name="arrow" size={17} /></Button> :
              review ? <Button onClick={() => setSubmitted(true)}>Confirm Simulated Request <Icon name="check" size={17} /></Button> :
              <Button onClick={() => form.name && form.email && form.phone && setReview(true)} disabled={!form.name || !form.email || !form.phone}>Review Request <Icon name="arrow" size={17} /></Button>}
          </div>
        </div>
        <aside className="live-summary">
          <span>Live estimate</span><h3>{config.solar.toFixed(1)} kWp {systemType}</h3>
          <dl><div><dt>Daily use</dt><dd>{daily.toFixed(1)} kWh</dd></div><div><dt>Monthly use</dt><dd>{monthly.toFixed(0)} kWh</dd></div><div><dt>Solar panels</dt><dd>{panels} × 550W</dd></div><div><dt>Inverter</dt><dd>{inverter} kW</dd></div><div><dt>Battery</dt><dd>{config.battery || "None"}{config.battery ? " kWh" : ""}</dd></div></dl>
          {step >= 5 ? <div className="summary-total"><small>Illustrative total</small><strong>{peso(total)}</strong><em>Not an official quote</em></div> : <p>Complete the sizing steps to see an illustrative price breakdown.</p>}
        </aside>
      </div>
    </section>
  </div>;
}

function Step({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <div className="step-content"><div className="step-heading"><h2>{title}</h2><p>{note}</p></div>{children}</div>;
}
function Field({ label, children, required, wide }: { label: string; children: React.ReactNode; required?: boolean; wide?: boolean }) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}{required && <b> *</b>}</span>{children}</label>;
}
function Segment({ options, value, set }: { options: string[]; value: string; set: (v: string) => void }) {
  return <div className="segment">{options.map(option => <button type="button" className={value === option ? "active" : ""} key={option} onClick={() => set(option)}>{option}</button>)}</div>;
}
function Review({ title, lines }: { title: string; lines: string[] }) {
  return <div><h3>{title}</h3>{lines.filter(Boolean).map(line => <p key={line}>{line}</p>)}</div>;
}

function Services({ go }: { go: (page: Page) => void }) {
  const services = [["home","Residential Solar Installation"],["building","Commercial Solar Installation"],["sun","Hybrid Solar Systems"],["battery","Battery Storage Solutions"],["panel","Solar System Assessment"],["shield","Maintenance and Technical Support"]];
  return <div className="page"><PageHero kicker="Capabilities to verify with EEC" title="Solar services built around technical clarity." text="The following service list is prototype content and should be confirmed by EEC Builders Corp. before launch." /><section className="section"><div className="shell three-grid">{services.map(([icon,title]) => <article className="service-card" key={title}><span className="icon-box"><Icon name={icon} /></span><h3>{title}</h3><p>Professional evaluation, transparent recommendations, and technical support tailored to your property and requirements.</p><button onClick={() => go("contact")}>Discuss this service <Icon name="arrow" size={16} /></button></article>)}</div></section><Cta go={go} /></div>;
}

function Projects() {
  const [filter, setFilter] = useState("All");
  const data = [
    ["Residential","5.5 kWp Hybrid","Cavite",images.home],["Commercial","16.5 kWp On-Grid","Metro Manila",images.commercial],
    ["Residential","3.3 kWp On-Grid","Laguna",images.install],["Commercial","33 kWp On-Grid","Pampanga",images.commercial],
  ];
  return <div className="page"><PageHero kicker="Demo project gallery" title="Representative solar installations." text="All entries are clearly marked demo content and must be replaced with verified EEC project information." /><section className="section"><div className="shell"><div className="filter-tabs">{["All","Residential","Commercial"].map(x => <button className={filter === x ? "active" : ""} key={x} onClick={() => setFilter(x)}>{x}</button>)}</div><div className="project-grid">{data.filter(x => filter === "All" || x[0] === filter).map((x,i) => <article className="project-card" key={`${x[1]}${i}`}><img src={x[3]} alt={`Representative ${x[0]} solar installation`} /><span className="demo-label">Demo project</span><div><h3>{x[1]}</h3><p>{x[0]} · {x[2]}</p></div></article>)}</div></div></section></div>;
}

function About({ go }: { go: (page: Page) => void }) {
  return <div className="page"><PageHero kicker="About EEC Builders Corp." title="Building practical paths to cleaner energy." text="Solar All is presented as the solar solutions brand of EEC Builders Corp. Company history and credentials below are placeholders pending verification." /><section className="section"><div className="shell about-grid"><div><SectionTitle kicker="Our prototype story" title="Engineering-led solar, made easier to understand." /><p>We believe customers should be able to understand how a solar system is sized, what it includes, and which assumptions affect its value. This prototype combines guided energy planning with a clear route to technical assessment.</p><div className="notice"><strong>Content verification required:</strong> Add approved company history, PCAB details, certifications, leadership, service coverage, and verified project statistics here.</div></div><div className="value-panel"><h3>What the brand stands for</h3><span><Icon name="shield" /> Technical integrity</span><span><Icon name="panel" /> Transparent system design</span><span><Icon name="users" /> Responsive customer support</span><span><Icon name="sun" /> Long-term energy thinking</span></div></div></section><Cta go={go} /></div>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  return <div className="page"><PageHero kicker="Start a conversation" title="Tell us about your property and energy goals." text="This prototype form simulates a request only. Connect it to the future Node.js, Express, and MongoDB backend before production use." /><section className="section"><div className="shell contact-grid"><div><h2>Contact Solar All</h2><p>For verified contact channels, service areas, and office hours, replace the placeholders below with approved EEC information.</p><dl><div><dt>Phone</dt><dd>+63 917 000 0000</dd></div><div><dt>Email</dt><dd>hello@solarall.example</dd></div><div><dt>Service area</dt><dd>Metro Manila and selected provinces</dd></div></dl></div>{sent ? <div className="success-card compact-success"><span><Icon name="check" /></span><h2>Message prepared</h2><p>Prototype only—nothing was sent to a backend.</p></div> : <form className="contact-form" onSubmit={e => { e.preventDefault(); setSent(true); }}><Field label="Full name" required><input required /></Field><Field label="Email address" required><input type="email" required /></Field><Field label="Contact number" required><input required /></Field><Field label="Property type"><select><option>Residential</option><option>Commercial</option></select></Field><Field label="Message" wide><textarea rows={5} /></Field><Button type="submit">Prepare Message <Icon name="arrow" size={17} /></Button><small>Simulated form—no information will be transmitted.</small></form>}</div></section></div>;
}

function Admin() {
  const [tab, setTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const nav = ["Overview","Solar Products","Packages and Pricing","Appliance Catalog","Estimator Settings","Quotations","Customers","Projects and Gallery","Content Management","User Management","Settings"];
  const quotes = [
    ["SOL-25031","Maria Santos","Quezon City","5.5 kWp","₱498,000","New"],
    ["SOL-25030","ABC Retail Demo","Makati City","16.5 kWp","₱928,000","Under Review"],
    ["SOL-25029","Jose Reyes","Imus, Cavite","3.3 kWp","₱198,000","Site Assessment"],
    ["SOL-25028","Demo Foods Inc.","Pasig City","11 kWp","₱1,098,000","Quotation Prepared"],
  ].filter(row => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <div className="admin">
    <aside><Logo inverse /><span className="demo-admin">Prototype admin · Sample data</span><nav>{nav.map(x => <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>{x}</button>)}</nav><div className="admin-user"><span>SA</span><div><strong>Sample Admin</strong><small>System Administrator</small></div></div></aside>
    <main><header><div><small>Solar All Administration</small><h1>{tab}</h1></div><span className="sample-pill">Sample data</span></header>
      {tab === "Overview" && <><div className="admin-stats">{[["Total quotation requests","128","+12 this month"],["New inquiries","14","Requires review"],["Awaiting review","9","Technical queue"],["Approved quotations","31","Demo total"],["Estimated quote value","₱12.8M","Illustrative"]].map(x => <article key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong><span>{x[2]}</span></article>)}</div><div className="admin-panels"><section><h2>Inquiry trend</h2><div className="fake-chart">{[32,48,38,67,55,78,64,82,70,92,76,88].map((n,i) => <i key={i} style={{height:`${n}%`}} />)}</div><small>Illustrative chart · Last 12 months</small></section><section><h2>Popular packages</h2>{demoPackages.slice(0,3).map((p,i) => <div className="popular-row" key={p.id}><span>{p.name}</span><div><i style={{width:`${85-i*20}%`}} /></div><strong>{42-i*9}</strong></div>)}</section></div></>}
      {tab === "Quotations" && <section className="admin-table-card"><div className="table-toolbar"><label className="search-field"><Icon name="search" size={17} /><input placeholder="Search quotations" value={query} onChange={e => setQuery(e.target.value)} /></label><Button>Export Demo</Button></div><div className="admin-table"><div className="admin-tr head"><span>Reference</span><span>Customer</span><span>Location</span><span>System</span><span>Estimate</span><span>Status</span></div>{quotes.map(row => <button className="admin-tr" key={row[0]}>{row.map((cell,i) => <span key={cell} className={i === 5 ? "status" : ""}>{cell}</span>)}</button>)}</div></section>}
      {(tab === "Solar Products" || tab === "Packages and Pricing") && <section className="admin-table-card"><div className="table-toolbar"><div><h2>{tab}</h2><p>Demo catalog values power the prototype estimator.</p></div><Button onClick={() => setEditing(true)}><Icon name="plus" size={17} /> Add item</Button></div><div className="product-list">{demoPackages.map(p => <article key={p.id}><span className="icon-box"><Icon name="panel" /></span><div><strong>{p.name}</strong><small>{p.solar} kWp · {p.type}</small></div><b>{peso(p.price)}</b><span className="enabled">Enabled</span><button onClick={() => setEditing(true)}>Edit</button></article>)}</div></section>}
      {!["Overview","Quotations","Solar Products","Packages and Pricing"].includes(tab) && <EmptyState title={`${tab} prototype`} text="This management area is prepared for role-based backend integration. Empty, loading, error, and saved states would be connected here." />}
    </main>
    {editing && <div className="modal-backdrop"><section className="detail-modal admin-edit"><button className="modal-close" onClick={() => setEditing(false)}><Icon name="close" /></button><span className="eyebrow">Simulated editing state</span><h2>Edit catalog item</h2><div className="form-grid"><Field label="Product name"><input defaultValue="Home Hybrid" /></Field><Field label="Status"><select><option>Enabled</option><option>Disabled</option></select></Field><Field label="Cost price"><input type="number" defaultValue="390000" /></Field><Field label="Selling price"><input type="number" defaultValue="498000" /></Field></div><div className="notice">Saving is simulated locally and will not persist after refresh. Production use requires authorization and an audit trail.</div><Button onClick={() => setEditing(false)}>Simulate Save <Icon name="check" size={17} /></Button></section></div>}
  </div>;
}

function PageHero({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return <section className="page-hero"><div className="shell"><span>{kicker}</span><h1>{title}</h1><p>{text}</p></div></section>;
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span><Icon name="search" /></span><h2>{title}</h2><p>{text}</p></div>;
}
function Cta({ go }: { go: (page: Page) => void }) {
  return <section className="final-cta"><div className="shell"><div><span>Let’s plan your system</span><h2>Ready to Make the Switch to Solar?</h2></div><div className="action-row"><Button onClick={() => go("estimator")}>Start Solar Estimator</Button><Button variant="light" onClick={() => go("contact")}>Contact Our Team</Button></div></div></section>;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const go = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <>{page !== "admin" && <Header page={page} go={go} />}
    {page === "home" && <Home go={go} />}
    {page === "packages" && <Packages go={go} />}
    {page === "estimator" && <Estimator go={go} />}
    {page === "services" && <Services go={go} />}
    {page === "projects" && <Projects />}
    {page === "about" && <About go={go} />}
    {page === "contact" && <Contact />}
    {page === "admin" && <Admin />}
    {page !== "admin" && <Footer go={go} />}
  </>;
}
