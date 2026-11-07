import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ElectricalServicesPage from "./pages/ElectricalServicesPage";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import QuotePage from "./pages/QuotePage";
import SolarCalculatorPage from "./pages/SolarCalculatorPage";
import SolarSolutionsPage from "./pages/SolarSolutionsPage";
import TrainingCenterPage from "./pages/TrainingCenterPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/solar-solutions" element={<SolarSolutionsPage />} />
        <Route path="/solar-calculator" element={<SolarCalculatorPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/electrical-services" element={<ElectricalServicesPage />} />
        <Route path="/training-center" element={<TrainingCenterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/packages" element={<Navigate to="/solar-solutions" replace />} />
        <Route path="/estimator" element={<Navigate to="/solar-calculator" replace />} />
        <Route path="/services" element={<Navigate to="/electrical-services" replace />} />
      </Route>
    </Routes>
  );
}
