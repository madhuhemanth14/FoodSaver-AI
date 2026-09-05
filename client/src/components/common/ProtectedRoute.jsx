import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
        <p style={{ marginLeft: 12, color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths = {
      donor: '/dashboard',
      ngo: '/ngo/dashboard',
      admin: '/admin'
    };
    return <Navigate to={dashboardPaths[user?.role] || '/'} replace />;
  }

  return children;
}
