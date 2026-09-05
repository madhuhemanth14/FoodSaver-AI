import { api } from '../context/AuthContext';

const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  }
};

export default authService;
