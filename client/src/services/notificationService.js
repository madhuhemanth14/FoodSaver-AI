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
  const response = await fetch(
    "http://localhost:5000/api/notifications"
  );

  const data = await response.json();

  return data.notifications || [];
}

export async function getUnreadCount() {
  const response = await fetch(
    "http://localhost:5000/api/notifications/unread-count"
  );

  const data = await response.json();

  return data.count || 0;
}

export async function markAsRead(id) {
  await fetch(
    `http://localhost:5000/api/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );

  const response = await fetch(
    "http://localhost:5000/api/notifications"
  );

  const data = await response.json();

  return data.notifications || [];
}

export async function markAllAsRead() {
  await fetch(
    "http://localhost:5000/api/notifications/read-all",
    {
      method: "PATCH",
    }
  );

  const response = await fetch(
    "http://localhost:5000/api/notifications"
  );

  const data = await response.json();

  return data.notifications || [];
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