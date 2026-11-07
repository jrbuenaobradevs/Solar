import { useState } from "react";
import PageHero from "../components/PageHero";
import { images } from "../data/images";

const data = [
  ["Residential", "5.5 kWp Hybrid", "Representative site", images.home],
  ["Commercial", "16.5 kWp On-Grid", "Representative site", images.commercial],
  ["Residential", "3.3 kWp On-Grid", "Representative site", images.install],
  ["Commercial", "11 kWp Hybrid", "Representative site", images.commercial],
] as const;

function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="page">
      <PageHero
        kicker="Projects"
        title="Representative solar installations."
        text="Photos are stock imagery used for layout. They are not verified Solar Mechanics or EEC project records and must be replaced with approved assets."
      />
      <section className="section">
        <div className="shell">
          <div className="filter-tabs">
            {["All", "Residential", "Commercial"].map((x) => (
              <button type="button" className={filter === x ? "active" : ""} key={x} onClick={() => setFilter(x)}>{x}</button>
            ))}
          </div>
          <div className="project-grid">
            {data.filter((x) => filter === "All" || x[0] === filter).map((x, i) => (
              <article className="project-card" key={`${x[1]}${i}`}>
                <img src={x[3]} alt={`Representative ${x[0]} solar installation`} />
                <span className="demo-label">Stock photo</span>
                <div>
                  <h3>{x[1]}</h3>
                  <p>{x[0]} · {x[2]}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectsPage;
