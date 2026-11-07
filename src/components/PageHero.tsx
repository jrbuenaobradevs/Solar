function PageHero({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <section className="page-hero">
      <div className="shell">
        <span>{kicker}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

export default PageHero;
