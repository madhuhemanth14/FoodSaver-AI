import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHomePath } from "../utils/roles";

/**
 * Real, server-verified role gate. `allowedRoles` is checked against
 * req.user.role as returned by /api/auth/me (backed by the JWT + DB
 * lookup) — never a value the frontend set itself. Also used for the
 * corresponding backend routes via requireAuth/requireRole.
 *
 * - No session yet resolved -> show nothing (avoids a Guest/redirect flash)
 * - Not logged in -> /login, remembering the page they wanted
 *   (location.state.returnTo) so Login can send them back to it — e.g.
 *   Home's "Donate Food" lands on the donation form after login, not the
 *   dashboard.
 * - Logged in but wrong role -> their own dashboard (not silently rendered)
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname + location.search }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
