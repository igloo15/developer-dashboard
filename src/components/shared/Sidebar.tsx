import { useState, useEffect } from 'react';
import { notificationStorage } from '../../utils/notificationStorage';

interface SidebarProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export default function Sidebar({ onNavigate, currentSection }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(notificationStorage.getUnreadCount());
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'github', label: 'GitHub Awesome Lists', icon: '🔍' },
    {
      id: 'gitlab',
      label: 'GitLab',
      icon: '🦊',
      children: [
        { id: 'gitlab-mrs', label: 'Merge Requests', icon: '🔀' },
        { id: 'gitlab-issues', label: 'Issues', icon: '📝' },
        { id: 'gitlab-pipelines', label: 'CI/CD', icon: '⚙️' },
      ],
    },
    { id: 'youtrack', label: 'YouTrack', icon: '🎯' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-gray-800 text-white h-screen flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold">DevDashboard</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => onNavigate(item.id)}
              className={`w-full px-4 py-3 flex items-center hover:bg-gray-700 transition-colors ${
                currentSection === item.id ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {item.children && !isCollapsed && (
              <div className="ml-8">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onNavigate(child.id)}
                    className={`w-full px-4 py-2 flex items-center text-sm hover:bg-gray-700 transition-colors ${
                      currentSection === child.id ? 'bg-gray-700 text-blue-400' : ''
                    }`}
                  >
                    <span className="text-base">{child.icon}</span>
                    <span className="ml-2">{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400">
            <p>v0.1.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
