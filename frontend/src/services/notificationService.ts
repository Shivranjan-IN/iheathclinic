import api from '../lib/api';

export interface Notification {
  notification_id: string;
  notification_type: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD';
  created_at: string;
  user_id: number;
  channel?: string;
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      // lib/api.ts already returns response.data (the unwrapped payload)
      // If it's an array, return it directly; if it has a .data property, use that
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      await api.put(`/notifications/${id}/read`, {});
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      await api.put('/notifications/read-all', {});
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
};
