import { solarCalibration } from "../config/solarCalibration";
import { peso } from "../lib/format";
import type { SolarEstimate } from "../lib/solarCalc";

function SolarEstimateSummary({ estimate }: { estimate: SolarEstimate }) {
  return (
    <aside className="live-summary">
      <span>Live estimate</span>
      <h3>{estimate.solarKwp.toFixed(1)} kWp {estimate.recommendedType}</h3>
      <dl>
        <div><dt>Daily use</dt><dd>{estimate.dailyKwh.toFixed(1)} kWh</dd></div>
        <div><dt>Monthly use</dt><dd>{estimate.monthlyKwh.toFixed(0)} kWh</dd></div>
        <div><dt>Connected load</dt><dd>{estimate.connectedLoadW.toLocaleString()} W</dd></div>
        <div><dt>Solar panels</dt><dd>{estimate.panelCount} × {solarCalibration.panelWattageW}W</dd></div>
        <div><dt>Inverter (indicative)</dt><dd>{estimate.inverterKw} kW</dd></div>
        <div><dt>Battery (indicative)</dt><dd>{estimate.batteryKwh || "Assessment"}{estimate.batteryKwh ? " kWh" : ""}</dd></div>
      </dl>
      {solarCalibration.showIllustrativePricing && estimate.total > 0 ? (
        <div className="summary-total">
          <small>Illustrative total</small>
          <strong>{peso(estimate.total)}</strong>
          <em>Not an official quote</em>
        </div>
      ) : (
        <p>Complete the sizing steps to review capacity. Final price requires a quotation.</p>
      )}
    </aside>
  );
}

export default SolarEstimateSummary;
