import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import type { NotificationType } from '../types/notifications';
import { notificationStorage } from '../utils/notificationStorage';

export function useNotifications() {
  const sendAppNotification = async (
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    data?: any
  ) => {
    // Store in local storage
    notificationStorage.add({
      type,
      title,
      message,
      actionUrl,
      data,
    });

    // Send OS notification
    try {
      // Check and request permission if needed
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      if (permissionGranted) {
        await sendNotification({
          title,
          body: message,
        });
        console.log('OS notification sent:', title);
      } else {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Failed to send OS notification:', error);
    }
  };

  return {
    sendNotification: sendAppNotification,
  };
}
