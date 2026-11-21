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
import { AdminRoutes, PublicAdminRoutes } from "./components/admin/AdminRoutes";

export default function App() {
  return (
    <Routes>
      {/* Public Admin Routes (Login, Reset Password) */}
      <Route element={<PublicAdminRoutes />}>
        <Route path="/admin/login" element={<ImportAdminLogin />} />
        <Route path="/admin/reset-password" element={<ImportResetPassword />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<ImportDashboard />} />
        <Route path="/admin/content/pages" element={<ImportContentPages />} />
        <Route path="/admin/content/media" element={<ImportMediaLibrary />} />
        <Route path="/admin/content/menus" element={<ImportMenus />} />
        <Route path="/admin/solar/packages" element={<ImportSolarPackages />} />
        <Route path="/admin/solar/addons" element={<ImportSolarAddons />} />
        <Route path="/admin/inquiries" element={<ImportInquiries />} />
        <Route path="/admin/settings" element={<ImportSettings />} />
        <Route path="/admin/settings/*" element={<ImportSettings />} />
        <Route path="/admin/activity" element={<ImportActivityLogs />} />
      </Route>

      {/* Public Website Routes */}
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

// Lazy load admin components for code splitting
const ImportAdminLogin = () => import("./pages/admin/LoginPage").then(m => <m.default />);
const ImportDashboard = () => import("./pages/admin/DashboardPage").then(m => <m.default />);
const ImportContentPages = () => import("./pages/admin/ContentPagesPage").then(m => <m.default />);
const ImportMediaLibrary = () => import("./pages/admin/MediaLibraryPage").then(m => <m.default />);
const ImportMenus = () => import("./pages/admin/MenusPage").then(m => <m.default />);
const ImportSolarPackages = () => import("./pages/admin/SolarPackagesPage").then(m => <m.default />);
const ImportSolarAddons = () => import("./pages/admin/SolarAddonsPage").then(m => <m.default />);
const ImportInquiries = () => import("./pages/admin/InquiriesPage").then(m => <m.default />);
const ImportSettings = () => import("./pages/admin/SettingsPage").then(m => <m.default />);
const ImportActivityLogs = () => import("./pages/admin/ActivityLogsPage").then(m => <m.default />);
const ImportResetPassword = () => import("./pages/admin/ResetPasswordPage").then(m => <m.default />);