// Mock notification service.
// Swap the internals with real API calls (axios/fetch) once the backend
// notification endpoints are ready — the method signatures below are
// designed to match a typical REST API so the swap is a drop-in change.

import mockNotifications from "../data/mockNotifications";

// In-memory copy so read/unread state persists during the session.
let notifications = mockNotifications.map((n) => ({ ...n }));

const SIMULATED_DELAY = 300;

const delay = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY));

/**
 * Fetch all notifications.
 * @returns {Promise<Array>}
 */
export const getNotifications = () => {
  return delay([...notifications]);
};

/**
 * Get the count of unread notifications.
 * @returns {Promise<number>}
 */
export const getUnreadCount = () => {
  const count = notifications.filter((n) => !n.read).length;
  return delay(count);
};

/**
 * Mark a single notification as read.
 * @param {number} id
 * @returns {Promise<Array>}
 */
export const markAsRead = (id) => {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return delay([...notifications]);
};

/**
 * Mark all notifications as read.
 * @returns {Promise<Array>}
 */
export const markAllAsRead = () => {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return delay([...notifications]);
};

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
