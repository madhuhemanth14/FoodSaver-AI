import mockNotifications from "../data/mockNotifications";

const STORAGE_KEY = "foodsaver_notifications";

function getStoredNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Failed to read notification storage:",
      error
    );
  }

  const initialData = mockNotifications.map(
    (notification) => ({
      ...notification,
    })
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(initialData)
  );

  return initialData;
}

function saveNotifications(notifications) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications)
  );
}

export async function getNotifications() {
  return getStoredNotifications();
}

export async function getUnreadCount() {
  const notifications = getStoredNotifications();

  return notifications.filter(
    (notification) => !notification.read
  ).length;
}

export async function markAsRead(id) {
  const notifications = getStoredNotifications();

  const updatedNotifications = notifications.map(
    (notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export async function markAllAsRead() {
  const notifications = getStoredNotifications();

  const updatedNotifications = notifications.map(
    (notification) => ({
      ...notification,
      read: true,
    })
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export async function resetNotifications() {
  const freshNotifications = mockNotifications.map(
    (notification) => ({
      ...notification,
    })
  );

  saveNotifications(freshNotifications);

  return freshNotifications;
}