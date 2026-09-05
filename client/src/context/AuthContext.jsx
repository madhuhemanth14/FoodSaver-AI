import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext(null);

// Configure axios defaults
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Axios interceptor: attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodsaver_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor: handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("foodsaver_token");
      localStorage.removeItem("foodsaver_user");
      // Don't redirect here — let the auth context handle it
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("foodsaver_token"));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (error) {
      console.error("Failed to load user:", error.message);
      localStorage.removeItem("foodsaver_token");
      localStorage.removeItem("foodsaver_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userData, token: newToken } = res.data.data;

    localStorage.setItem("foodsaver_token", newToken);
    localStorage.setItem("foodsaver_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await api.post("/auth/register", formData);
    const { user: userData, token: newToken } = res.data.data;

    localStorage.setItem("foodsaver_token", newToken);
    localStorage.setItem("foodsaver_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("foodsaver_token");
    localStorage.removeItem("foodsaver_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.put("/auth/profile", data);
    const updatedUser = res.data.data;
    setUser(updatedUser);
    localStorage.setItem("foodsaver_user", JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isDonor: user?.role === "donor",
    isNGO: user?.role === "ngo",
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
