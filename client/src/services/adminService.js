// src/services/adminService.js
//
// ADMIN MODULE — Service Layer, now wired to the real backend
// (server/controllers/adminController.js). The mock data file
// (data/mockAdminData.js) is no longer imported here — nothing in this
// file returns fabricated numbers or fake trends.
//
//   getDashboardStats()   -> GET /api/admin/dashboard
//   getRecentActivity()   -> GET /api/admin/activity
//   getAnalytics(range)   -> GET /api/admin/analytics
//   getUsers(params)      -> GET /api/admin/users
//   updateUserStatus()    -> PATCH /api/admin/users/:id/status
//   getNGOs()             -> GET /api/admin/ngos
//   updateNGOStatus()     -> PATCH /api/admin/ngos/:id/status
//   getDonations(params)  -> GET /api/admin/donations
//   getReports()          -> GET /api/admin/reports

import api from "./api";

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function getDashboardStats() {
  const { data } = await api.get("/admin/dashboard");
  return data.stats;
}

export async function getRecentActivity() {
  const { data } = await api.get("/admin/activity");
  return data.activities.map((a) => ({ ...a, time: timeAgo(a.createdAt) }));
}

export async function getAnalytics(range = "30d") {
  const { data } = await api.get("/admin/analytics", { params: { range } });
  return data;
}

export async function getUsers(params = {}) {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
}

export async function updateUserStatus(id, isBlocked) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isBlocked });
  return data.data;
}

export async function getNGOs() {
  const { data } = await api.get("/admin/ngos");
  return data.data;
}

export async function updateNGOStatus(id, updates) {
  const { data } = await api.patch(`/admin/ngos/${id}/status`, updates);
  return data.data;
}

export async function getDonations(params = {}) {
  const { data } = await api.get("/admin/donations", { params });
  return data.data;
}

export async function getReports() {
  const { data } = await api.get("/admin/reports");
  return data.summary;
}

export default {
  getDashboardStats,
  getRecentActivity,
  getAnalytics,
  getUsers,
  updateUserStatus,
  getNGOs,
  updateNGOStatus,
  getDonations,
  getReports,
};
