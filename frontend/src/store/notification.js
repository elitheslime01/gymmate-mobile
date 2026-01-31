import { create } from "zustand";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const useNotificationStore = create((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  unreadCount: 0,

  fetchNotifications: async (userId) => {
    if (!userId) {
      set({ notifications: [], unreadCount: 0 });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load notifications");
      }

      const unreadCount = Array.isArray(data) ? data.filter((n) => !n.read).length : 0;
      set({ notifications: Array.isArray(data) ? data : [], unreadCount, isLoading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (!response.ok) return;

      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        };
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async (userId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userId}/read`, {
        method: "PATCH",
      });

      if (!response.ok) return;

      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        return { notifications: updated, unreadCount: 0 };
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
}));

export default useNotificationStore;
