import { api } from '../context/AuthContext';

export async function getDonorDashboard() {
  const res = await api.get('/dashboard/donor');
  return res.data.data;
}

export async function getNGODashboard() {
  const res = await api.get('/dashboard/ngo');
  return res.data.data;
}
