import type { ApplianceInput } from "../lib/solarCalc";
import { dailyEnergyWh } from "../lib/solarCalc";
import Icon from "./Icon";

function ApplianceRow({
  item,
  onChange,
  onRemove,
}: {
  item: ApplianceInput;
  onChange: (id: string, field: keyof ApplianceInput, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
}) {
  const kwh = dailyEnergyWh(item) / 1000;
  return (
    <div className="appliance-row">
      <input aria-label="Appliance name" value={item.name} onChange={(e) => onChange(item.id, "name", e.target.value)} />
      <input aria-label={`${item.name} quantity`} type="number" min={1} value={item.qty} onChange={(e) => onChange(item.id, "qty", Number(e.target.value))} />
      <input aria-label={`${item.name} watts`} type="number" min={1} value={item.watts} onChange={(e) => onChange(item.id, "watts", Number(e.target.value))} />
      <input aria-label={`${item.name} hours per day`} type="number" min={0} max={24} step={0.5} value={item.hours} onChange={(e) => onChange(item.id, "hours", Number(e.target.value))} />
      <strong>{kwh.toFixed(2)}</strong>
      <button aria-label={`Remove ${item.name}`} type="button" onClick={() => onRemove(item.id)}>
        <Icon name="close" size={17} />
      </button>
    </div>
  );
}

export default ApplianceRow;
