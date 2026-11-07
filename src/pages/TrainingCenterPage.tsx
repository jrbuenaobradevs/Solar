import Button from "../components/Button";
import PageHero from "../components/PageHero";
import ServiceStatusBadge from "../components/ServiceStatusBadge";
import { trainingCourses } from "../data/trainingCourses";

function TrainingCenterPage() {
  return (
    <div className="page">
      <PageHero
        kicker="Solar Training Center"
        title="Proposed courses in solar knowledge and installation skills."
        text="These topics are planned. This page is not a learning management system. No schedules, fees, duration, accreditation, or enrollment seats are published here."
      />
      <section className="section">
        <div className="shell">
          <div className="notice">
            <strong>Coming soon:</strong> Register interest through Contact Us. Student accounts, lessons, quizzes, payments, and certificates are out of scope for this release.
          </div>
          <div className="three-grid top-space">
            {trainingCourses.map((course) => (
              <article className="service-card" key={course.id}>
                <ServiceStatusBadge label="Coming Soon" />
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <small className="audience">Intended audience: {course.audience}</small>
                <Button variant="secondary" to="/contact">Register interest</Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrainingCenterPage;
