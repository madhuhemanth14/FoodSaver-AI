import { api } from '../context/AuthContext';

export async function getDashboardStats() {
  const res = await api.get('/admin/stats');
  return res.data.data;
}

export async function getRecentActivity() {
  const res = await api.get('/admin/activity');
  return res.data.data;
}

export async function getAllUsers(params = {}) {
  const res = await api.get('/admin/users', { params });
  return res.data.data;
}

export async function getUserById(id) {
  const res = await api.get(`/admin/users/${id}`);
  return res.data.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data.data;
}

export async function toggleUserActive(id) {
  const res = await api.put(`/admin/users/${id}/toggle-active`);
  return res.data.data;
}

export async function verifyNGO(id, verified) {
  const res = await api.put(`/admin/ngos/${id}/verify`, { verified });
  return res.data.data;
}

export async function getAllDonations(params = {}) {
  const res = await api.get('/admin/donations', { params });
  return res.data.data;
}

export async function getAllPickups(params = {}) {
  const res = await api.get('/admin/pickups', { params });
  return res.data.data;
}

export async function getAnalytics() {
  const res = await api.get('/admin/analytics');
  return res.data.data;
}

export async function getReports() {
  const res = await api.get('/admin/reports');
  return res.data.data;
}

// Aliases used by admin pages
export const getUsers = getAllUsers;
export const getDonations = getAllDonations;
export const getPickups = getAllPickups;

export async function getNGOs(params = {}) {
  const res = await api.get('/admin/users', { params: { ...params, role: 'ngo' } });
  return res.data.data;
}
