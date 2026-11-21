import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
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

// Lazy load admin components for code splitting
const ImportAdminLogin = lazy(() => import("./pages/admin/LoginPage"));
const ImportDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const ImportContentPages = lazy(() => import("./pages/admin/ContentPagesPage"));
const ImportMediaLibrary = lazy(() => import("./pages/admin/MediaLibraryPage"));
const ImportMenus = lazy(() => import("./pages/admin/MenusPage"));
const ImportSolarPackages = lazy(() => import("./pages/admin/SolarPackagesPage"));
const ImportSolarAddons = lazy(() => import("./pages/admin/SolarAddonsPage"));
const ImportInquiries = lazy(() => import("./pages/admin/InquiriesPage"));
const ImportSettings = lazy(() => import("./pages/admin/SettingsPage"));
const ImportActivityLogs = lazy(() => import("./pages/admin/ActivityLogsPage"));
const ImportResetPassword = lazy(() => import("./pages/admin/ResetPasswordPage"));

const AdminLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <p className="text-gray-600">Loading admin dashboard...</p>
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  </div>
);

const PublicAdminLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <p className="text-gray-600">Loading...</p>
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public Admin Routes (Login, Reset Password) */}
      <Route element={<PublicAdminRoutes />}>
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PublicAdminLoadingFallback />}>
              <ImportAdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin/reset-password"
          element={
            <Suspense fallback={<PublicAdminLoadingFallback />}>
              <ImportResetPassword />
            </Suspense>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoutes />}>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportDashboard />
            </Suspense>
          }
        />
        <Route
          path="/admin/content/pages"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportContentPages />
            </Suspense>
          }
        />
        <Route
          path="/admin/content/media"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportMediaLibrary />
            </Suspense>
          }
        />
        <Route
          path="/admin/content/menus"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportMenus />
            </Suspense>
          }
        />
        <Route
          path="/admin/solar/packages"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportSolarPackages />
            </Suspense>
          }
        />
        <Route
          path="/admin/solar/addons"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportSolarAddons />
            </Suspense>
          }
        />
        <Route
          path="/admin/inquiries"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportInquiries />
            </Suspense>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportSettings />
            </Suspense>
          }
        />
        <Route
          path="/admin/settings/*"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportSettings />
            </Suspense>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ImportActivityLogs />
            </Suspense>
          }
        />
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