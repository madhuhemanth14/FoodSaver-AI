import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import WhyItMatters from './components/WhyItMatters';
import Stats from './components/Stats';
import CTA from './components/CTA';
import Footer from './components/common/Footer';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Notifications from './pages/dashboard/Notifications';
import Activity from './pages/dashboard/Activity';
import Profile from './pages/dashboard/Profile';

// Donation pages
import DonateFood from './pages/DonateFood';
import FoodAnalysis from './pages/FoodAnalysis';
import AnalysisHistory from './pages/AnalysisHistory';
import AnalysisDetails from './pages/AnalysisDetails';
import DonationHistory from './pages/DonationHistory';
import DonationDetails from './pages/DonationDetails';
import DonationSuccess from './pages/DonationSuccess';

// NGO pages
import NGOFinder from './pages/ngo/NGOFinder';
import NGODetails from './pages/ngo/NGODetails';
import NGODashboard from './pages/ngo/NGODashboard';
import NGOMappage from './pages/map/NGOMappage';

// Pickup pages
import PickupRequest from './pages/pickup/PickupRequest';
import PickupTracking from './pages/pickup/PickupTracking';
import PickupHistory from './pages/pickup/PickupHistory';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import NGOManagement from './pages/admin/NGOManagement';
import DonationManagement from './pages/admin/DonationManagement';
import Analytics from './pages/admin/Analytics';
import Reports from './pages/admin/Reports';

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <WhyItMatters />
      <Stats />
      <CTA />
    </>
  );
}

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide public Navbar on dashboard/admin pages (they have their own nav)
  const hideNavbar = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/profile' ||
    location.pathname === '/notifications' ||
    location.pathname === '/activity';

  // Show footer only on public pages
  const showFooter = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8' }}>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* ========= Public Routes ========= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* ========= Protected Routes (any authenticated user) ========= */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Donation flow */}
        <Route path="/donate" element={<ProtectedRoute><DonateFood /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><FoodAnalysis /></ProtectedRoute>} />
        <Route path="/analysis-history" element={<ProtectedRoute><AnalysisHistory /></ProtectedRoute>} />
        <Route path="/analysis/:id" element={<ProtectedRoute><AnalysisDetails /></ProtectedRoute>} />
        <Route path="/donations" element={<ProtectedRoute><DonationHistory /></ProtectedRoute>} />
        <Route path="/donations/success" element={<ProtectedRoute><DonationSuccess /></ProtectedRoute>} />
        <Route path="/donations/:id" element={<ProtectedRoute><DonationDetails /></ProtectedRoute>} />

        {/* NGO pages */}
        <Route path="/ngos" element={<ProtectedRoute><NGOFinder /></ProtectedRoute>} />
        <Route path="/ngos/:id" element={<ProtectedRoute><NGODetails /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><NGOMappage /></ProtectedRoute>} />

        {/* Pickup pages */}
        <Route path="/pickup/request" element={<ProtectedRoute><PickupRequest /></ProtectedRoute>} />
        <Route path="/pickup/tracking/:id" element={<ProtectedRoute><PickupTracking /></ProtectedRoute>} />
        <Route path="/pickup/history" element={<ProtectedRoute><PickupHistory /></ProtectedRoute>} />

        {/* ========= NGO-only Routes ========= */}
        <Route path="/ngo/dashboard" element={<ProtectedRoute roles={['ngo']}><NGODashboard /></ProtectedRoute>} />

        {/* ========= Admin-only Routes ========= */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/ngos" element={<ProtectedRoute roles={['admin']}><NGOManagement /></ProtectedRoute>} />
        <Route path="/admin/donations" element={<ProtectedRoute roles={['admin']}><DonationManagement /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
      </Routes>

      {showFooter && <Footer />}
    </div>
  );
}

export default App;