// Real notification service — wired to server/controllers/notificationController.js.
// MongoDB is authoritative; nothing here reads/writes localStorage anymore.
//
// The backend's shape (_id, isRead, createdAt) is normalized to the shape
// the existing notification components already expect (id, read, time)
// so NotificationBell/NotificationPanel/Notifications.jsx needed no changes.

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

function normalize(notification) {
  return {
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.isRead,
    time: timeAgo(notification.createdAt),
  };
}

export async function getNotifications() {
  const { data } = await api.get("/notifications");
  return data.notifications.map(normalize);
}

export async function getUnreadCount() {
  const { data } = await api.get("/notifications/unread-count");
  return data.count;
}

export async function markAsRead(id) {
  await api.patch(`/notifications/${id}/read`);
  return getNotifications();
}

export async function markAllAsRead() {
  await api.patch("/notifications/read-all");
  return getNotifications();
}
