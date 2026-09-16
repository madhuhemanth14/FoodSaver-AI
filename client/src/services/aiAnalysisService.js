import { api } from '../context/AuthContext';

export async function analyzeFoodImage(imageFile, metadata = {}) {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (metadata.foodName) formData.append('foodName', metadata.foodName);
  if (metadata.category) formData.append('category', metadata.category);
  if (metadata.preparedAt) formData.append('preparedAt', metadata.preparedAt);

  const res = await api.post('/analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function getAnalysisHistory() {
  const res = await api.get('/analysis');
  return res.data.data;
}

export async function getAnalysisById(id) {
  const res = await api.get(`/analysis/${id}`);
  return res.data.data;
}
