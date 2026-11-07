function SectionTitle({
  kicker,
  title,
  text,
  centered = false,
}: {
  kicker: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <div className={`section-title ${centered ? "centered" : ""}`}>
      <span>{kicker}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default SectionTitle;
