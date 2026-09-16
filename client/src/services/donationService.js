import { api } from '../context/AuthContext';

const donationService = {
  async createDonation(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'imageFile' && data[key]) {
        formData.append('image', data[key]);
      } else if (key === 'aiAnalysis') {
        if (data[key]?._id) {
          formData.append('aiAnalysis', data[key]._id);
        }
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const res = await api.post('/donations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getMyDonations() {
    const res = await api.get('/donations');
    return res.data.data;
  },

  async getDonationById(id) {
    const res = await api.get(`/donations/${id}`);
    return res.data.data;
  },

  async updateDonation(id, data) {
    const res = await api.put(`/donations/${id}`, data);
    return res.data.data;
  },

  async cancelDonation(id) {
    const res = await api.patch(`/donations/${id}/cancel`);
    return res.data.data;
  },

  async analyzeFoodImage(imageFile, metadata) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (metadata?.foodName) formData.append('foodName', metadata.foodName);
    if (metadata?.category) formData.append('category', metadata.category);
    if (metadata?.declaredExpiryDate) formData.append('expiryDate', metadata.declaredExpiryDate);
    if (metadata?.preparedAt) formData.append('preparedAt', metadata.preparedAt);

    const res = await api.post('/analysis/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }
};

export default donationService;
