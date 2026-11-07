export function peso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function roundTo(value: number, places: number) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
