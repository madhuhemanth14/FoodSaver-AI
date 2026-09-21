// src/utils/authStorage.js
//
// AuthContext (src/context/AuthContext.jsx) is the real source of truth
// for the authenticated user -- it restores the session from the backend
// via GET /api/auth/me and is what components should use.
//
// This file is now just a read-only accessor onto the same cached
// "fs_user" localStorage entry AuthContext maintains, for the handful of
// plain (non-component) service modules -- like donationService.js --
// that need the current user's name/email outside of React and can't
// call useAuth(). It does not write auth state; AuthContext owns that.

const STORAGE_KEY = "fs_user";

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
