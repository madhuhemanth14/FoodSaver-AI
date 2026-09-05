import { api } from '../context/AuthContext';

const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data.data.count;
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead() {
    await api.put('/notifications/read-all');
  },

  async deleteNotification(id) {
    await api.delete(`/notifications/${id}`);
  }
};

export default notificationService;