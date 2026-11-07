function ServiceStatusBadge({ label = "Planned Service" }: { label?: string }) {
  return <span className="status-badge">{label}</span>;
}

export default ServiceStatusBadge;
