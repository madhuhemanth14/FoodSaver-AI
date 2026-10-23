import ProtectedRoute from "./ProtectedRoute";

/**
 * Admin gate. Backed by AuthContext, which restores its `user` from
 * GET /api/auth/me — a call that verifies the JWT and reads the role
 * straight from the database. A Food Donor or NGO cannot reach this by
 * selecting "Admin" on the frontend; only an account whose DB role is
 * actually "admin" passes. Backend admin endpoints must additionally
 * enforce requireRole("admin") themselves -- this only guards the UI.
 */
const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export default AdminRoute;
