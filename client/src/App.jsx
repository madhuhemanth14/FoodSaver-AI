import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

/* COMMON */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

/* HOME */
import Hero from "./components/Hero";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";

/* AUTH */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* DASHBOARD (shared components, reused across donor/ngo role-scoped routes —
   no NGO-specific dashboard exists yet, so it is mounted under /ngo/* too
   per the existing project's documented fallback rather than duplicated) */
import Dashboard from "./pages/dashboard/Dashboard";
import NgoDashboard from "./pages/dashboard/NgoDashboard";
import Notifications from "./pages/dashboard/Notifications";
import Activity from "./pages/dashboard/Activity";
import Profile from "./pages/dashboard/Profile";
import NgoProfile from "./pages/dashboard/NgoProfile";

/* FOOD DONATION */
import DonateFood from "./pages/DonateFood";
import DonationDetails from "./pages/DonationDetails";
import DonationHistory from "./pages/DonationHistory";
import DonationSuccessPage from "./pages/DonationSuccess";

/* AI FOOD ANALYSIS — not role-namespaced in the spec's route list;
   kept as shared authenticated routes rather than duplicated per role. */
import FoodAnalysis from "./pages/FoodAnalysis";
import AnalysisDetails from "./pages/AnalysisDetails";
import AnalysisHistory from "./pages/AnalysisHistory";

/* NGO DIRECTORY / MAP — likewise shared, not role-namespaced */
import NGOFinder from "./pages/ngo/NGOFinder";
import NGODetails from "./pages/ngo/NGODetails";
import NGOMap from "./pages/map/NGOMappage";

/* PICKUP */
import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";

/*
 * ADMIN
 * Admin has its own chrome (AdminSidebar + AdminNavbar, rendered inside
 * each admin page) so it is intentionally NOT nested inside SiteLayout —
 * it should not also get the public Navbar/Footer.
 */
import AdminDashboard from "./pages/admin/AdminDashboard";
import Analytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/UserManagement";
import NGOManagement from "./pages/admin/NGOManagement";
import DonationManagement from "./pages/admin/DonationManagement";
import Reports from "./pages/admin/Reports";

const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <Contact />
    </>
  );
};

/* Global site chrome: one Navbar + one Footer around every non-admin page. */
const SiteLayout = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/register"].includes(
    location.pathname
  );

  return (
    <>
      <Navbar />
      <main className={isAuthPage ? "auth-route-main" : ""}>
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Manual role selection after login has been retired — login now
              routes directly to the DB-verified role's dashboard. Old
              bookmarks/links to it are sent home instead of 404ing. */}
          <Route path="/role-select" element={<Navigate to="/" replace />} />

          {/* ============== FOOD DONOR (role-gated: "donor") ============== */}
          <Route
            path="/donor/dashboard"
            element={<ProtectedRoute allowedRoles={["donor"]}><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/donor/donate"
            element={<ProtectedRoute allowedRoles={["donor"]}><DonateFood /></ProtectedRoute>}
          />
          <Route
            path="/donor/donations"
            element={<ProtectedRoute allowedRoles={["donor"]}><DonationHistory /></ProtectedRoute>}
          />
          <Route
            path="/donor/donations/success"
            element={<ProtectedRoute allowedRoles={["donor"]}><DonationSuccessPage /></ProtectedRoute>}
          />
          <Route
            path="/donor/donations/:id"
            element={<ProtectedRoute allowedRoles={["donor"]}><DonationDetails /></ProtectedRoute>}
          />
          <Route
            path="/donor/notifications"
            element={<ProtectedRoute allowedRoles={["donor"]}><Notifications /></ProtectedRoute>}
          />
          <Route
            path="/donor/activity"
            element={<ProtectedRoute allowedRoles={["donor"]}><Activity /></ProtectedRoute>}
          />
          <Route
            path="/donor/profile"
            element={<ProtectedRoute allowedRoles={["donor"]}><Profile /></ProtectedRoute>}
          />
          <Route
            path="/donor/pickups"
            element={<ProtectedRoute allowedRoles={["donor"]}><PickupHistory /></ProtectedRoute>}
          />
          <Route
            path="/donor/pickups/request"
            element={<ProtectedRoute allowedRoles={["donor"]}><PickupRequest /></ProtectedRoute>}
          />
          <Route
            path="/donor/pickups/:id"
            element={<ProtectedRoute allowedRoles={["donor"]}><PickupTracking /></ProtectedRoute>}
          />

          {/* ============== NGO (role-gated: "ngo") ==============
              Now has its own real dashboard (NgoDashboard) backed by
              GET /api/ngos/dashboard — no longer reusing the donor
              Dashboard component. Notifications/Activity/Profile are
              still shared components since their data is already scoped
              server-side per authenticated user regardless of role. */}
          <Route
            path="/ngo/dashboard"
            element={<ProtectedRoute allowedRoles={["ngo"]}><NgoDashboard /></ProtectedRoute>}
          />
          <Route
            path="/ngo/donations"
            element={<ProtectedRoute allowedRoles={["ngo"]}><DonationHistory /></ProtectedRoute>}
          />
          <Route
            path="/ngo/donations/:id"
            element={<ProtectedRoute allowedRoles={["ngo"]}><DonationDetails /></ProtectedRoute>}
          />
          <Route
            path="/ngo/notifications"
            element={<ProtectedRoute allowedRoles={["ngo"]}><Notifications /></ProtectedRoute>}
          />
          <Route
            path="/ngo/activity"
            element={<ProtectedRoute allowedRoles={["ngo"]}><Activity /></ProtectedRoute>}
          />
          <Route
            path="/ngo/profile"
            element={<ProtectedRoute allowedRoles={["ngo"]}><NgoProfile /></ProtectedRoute>}
          />
          <Route
            path="/ngo/pickups"
            element={<ProtectedRoute allowedRoles={["ngo"]}><PickupHistory /></ProtectedRoute>}
          />
          <Route
            path="/ngo/pickups/request"
            element={<ProtectedRoute allowedRoles={["ngo"]}><PickupRequest /></ProtectedRoute>}
          />
          <Route
            path="/ngo/pickups/:id"
            element={<ProtectedRoute allowedRoles={["ngo"]}><PickupTracking /></ProtectedRoute>}
          />

          {/* ============== SHARED AUTHENTICATED ROUTES ==============
              AI analysis, NGO directory/map: not called out as
              role-namespaced in the target route structure, and available
              to any signed-in donor or NGO account. */}
          <Route
            path="/analyze"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><FoodAnalysis /></ProtectedRoute>}
          />
          <Route
            path="/analysis-history"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><AnalysisHistory /></ProtectedRoute>}
          />
          <Route
            path="/analysis/:id"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><AnalysisDetails /></ProtectedRoute>}
          />
          <Route
            path="/ngos"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><NGOFinder /></ProtectedRoute>}
          />
          <Route
            path="/ngos/:id"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><NGODetails /></ProtectedRoute>}
          />
          <Route
            path="/map"
            element={<ProtectedRoute allowedRoles={["donor", "ngo"]}><NGOMap /></ProtectedRoute>}
          />
        </Route>

        {/* ADMIN — role-gated: only a session whose DB role is "admin" can
            reach these (verified server-side via /api/auth/me + requireAuth,
            never a locally-selected value). */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/ngos" element={<AdminRoute><NGOManagement /></AdminRoute>} />
        <Route path="/admin/donations" element={<AdminRoute><DonationManagement /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
