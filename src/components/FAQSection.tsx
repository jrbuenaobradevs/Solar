function FAQSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-title">
          <span>Questions</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
