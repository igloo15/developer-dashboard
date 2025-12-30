import { useState, useEffect } from 'react';
import type { Notification } from '../../types/notifications';
import { notificationStorage } from '../../utils/notificationStorage';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { sendNotification } = useNotifications();

  const loadNotifications = () => {
    const allNotifications = notificationStorage.getAll();
    setNotifications(allNotifications);
  };

  useEffect(() => {
    loadNotifications();

    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationStorage.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationStorage.markAllAsRead();
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    notificationStorage.delete(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      notificationStorage.clear();
      loadNotifications();
    }
  };

  const handleCreateTestNotifications = () => {
    const testNotifications = [
      {
        type: 'gitlab_mr' as const,
        title: 'New Merge Request',
        message: 'John Doe: Add user authentication feature',
        actionUrl: 'https://gitlab.example.com/project/merge_requests/123',
      },
      {
        type: 'gitlab_pipeline' as const,
        title: 'Pipeline Failed',
        message: 'Pipeline #456 for feature-branch has failed',
        actionUrl: 'https://gitlab.example.com/project/pipelines/456',
      },
      {
        type: 'gitlab_issue' as const,
        title: 'New Issue',
        message: 'Jane Smith: Bug in login form validation',
        actionUrl: 'https://gitlab.example.com/project/issues/789',
      },
      {
        type: 'youtrack_issue' as const,
        title: 'Issue Assigned',
        message: 'PROJ-123: Implement dark mode has been assigned to you',
        actionUrl: 'https://youtrack.example.com/issue/PROJ-123',
      },
    ];

    testNotifications.forEach(notif => {
      sendNotification(notif.type, notif.title, notif.message, notif.actionUrl);
    });

    setTimeout(loadNotifications, 100);
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : !n.read
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'gitlab_mr':
        return '🔀';
      case 'gitlab_issue':
        return '📝';
      case 'gitlab_pipeline':
        return '⚙️';
      case 'youtrack_issue':
        return '🎯';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'gitlab_mr':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'gitlab_issue':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'gitlab_pipeline':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'youtrack_issue':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateTestNotifications}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Test Notifications
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)} {notification.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{notification.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <span>{formatTimestamp(notification.timestamp)}</span>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
