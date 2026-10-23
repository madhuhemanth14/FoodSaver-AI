import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchCurrentUser } from "../services/authService";

// ---------------------------------------------------------------------
// ONE source of truth for "who is logged in" across the whole app.
// Navbar, Sidebar, Dashboard, Profile, Notifications, and every
// protected route all read from this context instead of each rolling
// their own localStorage read. That's what fixes the "Guest" bug: a
// user is only ever "Guest" once we've actually finished checking (see
// `loading`) and there truly is no valid session — never as a flash
// state while a real session is still being restored.
// ---------------------------------------------------------------------

const AuthContext = createContext(null);

const USER_KEY = "fs_user";
const TOKEN_KEY = "authToken";

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Seed from cache so a refresh doesn't show a Login/Guest flash before
  // the /me call resolves — but `loading` still gates any authorization
  // decision (route guards) until the backend has confirmed the session.
  const [user, setUser] = useState(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setUser(nextUser);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      persistUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: freshUser } = await fetchCurrentUser();
      persistUser(freshUser);
    } catch {
      // Expired/invalid token — do not keep a stale cached user around.
      localStorage.removeItem(TOKEN_KEY);
      persistUser(null);
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Called right after a successful /auth/login or /auth/register+login.
  const login = useCallback(
    (nextUser, token) => {
      localStorage.setItem(TOKEN_KEY, token);
      persistUser(nextUser);
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback(
    (patch) => {
      persistUser({ ...(user || {}), ...patch });
    },
    [persistUser, user]
  );

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
    refresh: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
