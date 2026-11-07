import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ApplianceRow from "../components/ApplianceRow";
import Button from "../components/Button";
import Icon from "../components/Icon";
import PageHero from "../components/PageHero";
import SolarEstimateSummary from "../components/SolarEstimateSummary";
import { solarCalibration, type CoverageTierId } from "../config/solarCalibration";
import { applianceCatalog } from "../data/appliances";
import { peso } from "../lib/format";
import { saveQuoteDraft } from "../lib/quoteDraft";
import {
  buildEstimate,
  type ApplianceInput,
  type BackupChoice,
  type SystemPreference,
} from "../lib/solarCalc";

const defaultAppliances: ApplianceInput[] = [
  { id: "1", name: "Refrigerator", qty: 1, watts: 150, hours: 12, critical: true },
  { id: "2", name: "Electric fan", qty: 2, watts: 65, hours: 8, critical: true },
  { id: "3", name: "Lighting", qty: 8, watts: 12, hours: 6, critical: true },
];

function Field({ label, children, required, wide }: { label: string; children: ReactNode; required?: boolean; wide?: boolean }) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}{required && <b> *</b>}</span>
      {children}
    </label>
  );
}

function SolarCalculatorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("Residential");
  const [province, setProvince] = useState("Metro Manila");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [bill, setBill] = useState("");
  const [existingSolar, setExistingSolar] = useState("No");
  const [preference, setPreference] = useState<SystemPreference>("Not sure");
  const [backup, setBackup] = useState<BackupChoice>("Not sure");
  const [backupHours, setBackupHours] = useState(4);
  const [includeAc, setIncludeAc] = useState(false);
  const [grid, setGrid] = useState(true);
  const [tierId, setTierId] = useState<CoverageTierId>("balanced");
  const [appliances, setAppliances] = useState<ApplianceInput[]>(defaultAppliances);
  const [addName, setAddName] = useState("");

  const estimateInput = {
    appliances,
    preference,
    backup,
    backupHours,
    includeAcInBackup: includeAc,
    gridConnected: grid,
    tierId,
  };
  const estimate = useMemo(() => buildEstimate(estimateInput), [appliances, preference, backup, backupHours, includeAc, grid, tierId]);

  const updateAppliance = (id: string, field: keyof ApplianceInput, value: string | number | boolean) => {
    setAppliances((old) => old.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const addAppliance = () => {
    const preset = applianceCatalog.find((item) => item.name === addName) ?? applianceCatalog[applianceCatalog.length - 1];
    setAppliances((old) => [
      ...old,
      { id: crypto.randomUUID(), name: preset.name, qty: 1, watts: preset.watts, hours: preset.hours, critical: false },
    ]);
    setAddName("");
  };

  const canLeaveProperty = Boolean(city.trim());
  const canLeaveAppliances = appliances.length > 0;

  const requestQuote = () => {
    saveQuoteDraft({
      propertyType,
      city,
      province,
      notes,
      bill,
      existingSolar,
      estimateInput,
      estimate,
      preference,
      backup,
      appliances,
    });
    navigate("/quote");
  };

  return (
    <div className="page estimator-page">
      <PageHero
        kicker="Solar energy calculator"
        title="Estimate your energy use, then request a quotation."
        text="Add appliances first. Contact details are collected only when you request a quote. Results are a preliminary estimate, not a final engineering design."
      />
      <section className="estimator-shell shell">
        <div className="progress" aria-label={`Calculator step ${step} of 4`}>
          {["Property", "Appliances", "Preference", "Results"].map((label, i) => {
            const n = i + 1;
            return (
              <button key={label} type="button" className={n === step ? "active" : n < step ? "done" : ""} onClick={() => n < step && setStep(n)}>
                <span>{n < step ? "✓" : n}</span>
                <small>{label}</small>
              </button>
            );
          })}
        </div>
        <div className="estimator-layout">
          <div className="estimator-panel">
            {step === 1 && (
              <div className="step-content">
                <div className="step-heading">
                  <h2>Property details</h2>
                  <p>You can calculate energy use before sharing personal contact information.</p>
                </div>
                <div className="form-grid">
                  <Field label="Property type">
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Industrial</option>
                    </select>
                  </Field>
                  <Field label="Province">
                    <input value={province} onChange={(e) => setProvince(e.target.value)} />
                  </Field>
                  <Field label="City / municipality" required>
                    <input required placeholder="e.g. Quezon City" value={city} onChange={(e) => setCity(e.target.value)} />
                    {!city.trim() && <small className="field-help">Required to continue</small>}
                  </Field>
                  <Field label="Average monthly bill (PHP, optional)">
                    <div className="money-input"><span>₱</span><input type="number" min={0} value={bill} onChange={(e) => setBill(e.target.value)} /></div>
                  </Field>
                  <Field label="Existing solar installation?">
                    <select value={existingSolar} onChange={(e) => setExistingSolar(e.target.value)}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </Field>
                  <Field label="Project notes (optional)" wide>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <div className="step-heading">
                  <h2>Appliance-based energy estimate</h2>
                  <p>Suggested wattages are examples only. Edit them to match the rating on your equipment. Hours cannot exceed 24.</p>
                </div>
                <div className="add-appliance">
                  <select aria-label="Choose an appliance" value={addName} onChange={(e) => setAddName(e.target.value)}>
                    <option value="">Choose an appliance…</option>
                    {applianceCatalog.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                  </select>
                  <Button onClick={addAppliance} disabled={!addName}><Icon name="plus" size={17} /> Add appliance</Button>
                </div>
                <div className="appliance-table">
                  <div className="appliance-row table-header">
                    <span>Appliance</span><span>Qty</span><span>Watts</span><span>Hours/day</span><span>kWh/day</span><span />
                  </div>
                  {appliances.map((item) => (
                    <ApplianceRow key={item.id} item={item} onChange={updateAppliance} onRemove={(id) => setAppliances((old) => old.filter((row) => row.id !== id))} />
                  ))}
                </div>
                {appliances.length === 0 && <p className="disclaimer-box">Add at least one appliance to estimate energy use.</p>}
                <div className="usage-visual">
                  <div><strong>{estimate.dailyKwh.toFixed(1)} kWh</strong><span>Daily use</span></div>
                  <div><strong>{estimate.monthlyKwh.toFixed(0)} kWh</strong><span>Monthly use</span></div>
                  <div className="usage-bar"><span style={{ width: `${Math.min(100, estimate.dailyKwh / 40 * 100)}%` }} /></div>
                </div>
                <p className="disclaimer-box">Daily energy (Wh) = quantity × wattage × hours. Monthly energy = daily kWh × 30. Connected load is not the same as actual consumption.</p>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <div className="step-heading">
                  <h2>System preference</h2>
                  <p>Choose a direction. If you are not sure, we recommend a type from your backup and grid answers.</p>
                </div>
                <div className="form-grid">
                  <Field label="Preferred system" wide>
                    <select value={preference} onChange={(e) => setPreference(e.target.value as SystemPreference)}>
                      <option>Not sure</option>
                      <option>Hybrid</option>
                      <option>On-Grid</option>
                      <option>Off-Grid</option>
                    </select>
                  </Field>
                  <Field label="Battery backup required?">
                    <select value={backup} onChange={(e) => setBackup(e.target.value as BackupChoice)}>
                      <option>Not sure</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Utility grid connection">
                    <select value={grid ? "Connected" : "Not connected"} onChange={(e) => setGrid(e.target.value === "Connected")}>
                      <option>Connected</option>
                      <option>Not connected</option>
                    </select>
                  </Field>
                  <Field label="Backup duration (hours)">
                    <input type="range" min={1} max={12} value={backupHours} onChange={(e) => setBackupHours(Number(e.target.value))} />
                    <strong>{backupHours} hours</strong>
                  </Field>
                  <Field label="Include air conditioning in backup?">
                    <select value={includeAc ? "Yes" : "No"} onChange={(e) => setIncludeAc(e.target.value === "Yes")}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </Field>
                </div>
                <div className="critical-list top-space">
                  {appliances.map((item) => (
                    <label key={item.id}>
                      <input type="checkbox" checked={Boolean(item.critical)} onChange={(e) => updateAppliance(item.id, "critical", e.target.checked)} />
                      <span>{item.name}<small>{item.qty * item.watts} W connected load</small></span>
                    </label>
                  ))}
                </div>
                <p className="disclaimer-box">On-grid systems typically do not run during an outage. Battery and inverter figures below are indicative and require engineering validation, especially for motors and compressors.</p>
              </div>
            )}

            {step === 4 && (
              <div className="step-content">
                <div className="step-heading">
                  <h2>Results summary</h2>
                  <p>Energy demand is calculated from your appliances. Capacity and price are preliminary estimates using the calibration file.</p>
                </div>
                <div className="config-grid">
                  {solarCalibration.coverageTiers.map((tier) => (
                    <button type="button" className={tierId === tier.id ? "selected" : ""} key={tier.id} onClick={() => setTierId(tier.id)}>
                      <small>{tier.label}</small>
                      <strong>{buildEstimate({ ...estimateInput, tierId: tier.id }).solarKwp} kWp</strong>
                      <em>≈ {tier.coveragePercent}% energy coverage</em>
                    </button>
                  ))}
                </div>
                <div className="review-grid">
                  <div>
                    <h3>Energy demand</h3>
                    <p>{estimate.dailyKwh.toFixed(1)} kWh/day</p>
                    <p>{estimate.monthlyKwh.toFixed(0)} kWh/month</p>
                    <p>{estimate.connectedLoadW.toLocaleString()} W connected load</p>
                  </div>
                  <div>
                    <h3>Preliminary capacity</h3>
                    <p>{estimate.solarKwp} kWp PV · {estimate.recommendedType}</p>
                    <p>{estimate.panelCount} × {solarCalibration.panelWattageW}W panels</p>
                    <p>Inverter {estimate.inverterKw} kW (indicative)</p>
                    <p>Battery {estimate.batteryKwh ? `${estimate.batteryKwh} kWh indicative` : "requires technical assessment"}</p>
                  </div>
                </div>
                {solarCalibration.showIllustrativePricing && estimate.total > 0 && (
                  <div className="price-table">
                    {estimate.priceLines.map((line) => (
                      <div key={line.label}><span>{line.label}</span><strong>{peso(line.amount)}</strong></div>
                    ))}
                    <div className="subtotal"><span>Subtotal</span><strong>{peso(estimate.subtotal)}</strong></div>
                    <div><span>Illustrative VAT ({solarCalibration.pricing.vatRate * 100}%)</span><strong>{peso(estimate.vat)}</strong></div>
                    <div className="total"><span>Illustrative estimated total</span><strong>{peso(estimate.total)}</strong></div>
                  </div>
                )}
                <div className="notice">
                  <strong>Assumptions:</strong> PV kWp = daily kWh ÷ (peak sun hours {solarCalibration.peakSunHours} × performance factor {solarCalibration.performanceFactor}). {solarCalibration.disclaimer}
                </div>
              </div>
            )}

            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
              {step === 2 && <Button variant="secondary" onClick={() => setStep(2)}>Edit Appliance List</Button>}
              {step < 4 ? (
                <Button
                  onClick={() => {
                    if (step === 1 && !canLeaveProperty) return;
                    if (step === 2 && !canLeaveAppliances) return;
                    setStep(step + 1);
                  }}
                  disabled={(step === 1 && !canLeaveProperty) || (step === 2 && !canLeaveAppliances)}
                >
                  Continue <Icon name="arrow" size={17} />
                </Button>
              ) : (
                <div className="action-row">
                  <Button variant="secondary" onClick={() => setStep(2)}>Edit Appliance List</Button>
                  <Button variant="secondary" onClick={() => setStep(1)}>Recalculate</Button>
                  <Button onClick={requestQuote}>Request a Quote <Icon name="arrow" size={17} /></Button>
                </div>
              )}
            </div>
          </div>
          <SolarEstimateSummary estimate={estimate} />
        </div>
      </section>
    </div>
  );
}

export default SolarCalculatorPage;
