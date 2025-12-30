import type { Notification } from '../types/notifications';

const STORAGE_KEY = 'app-notifications';
const MAX_NOTIFICATIONS = 100;

export const notificationStorage = {
  getAll(): Notification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const notifications = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  },

  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    try {
      const notifications = this.getAll();
      notifications.unshift(newNotification);

      // Keep only the latest MAX_NOTIFICATIONS
      const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return newNotification;
    } catch (error) {
      console.error('Failed to save notification:', error);
      throw error;
    }
  },

  markAsRead(id: string): void {
    try {
      const notifications = this.getAll();
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead(): void {
    try {
      const notifications = this.getAll();
      notifications.forEach(n => n.read = true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  delete(id: string): void {
    try {
      const notifications = this.getAll();
      const filtered = notifications.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },

  getUnreadCount(): number {
    return this.getAll().filter(n => !n.read).length;
  },
};
