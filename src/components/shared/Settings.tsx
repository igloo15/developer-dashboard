export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">GitHub</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Token</label>
              <input
                type="password"
                placeholder="ghp_..."
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">GitLab</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instance URL</label>
              <input
                type="url"
                placeholder="https://gitlab.com"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Access Token</label>
              <input
                type="password"
                placeholder="glpat-..."
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">YouTrack</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instance URL</label>
              <input
                type="url"
                placeholder="https://youtrack.company.com"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Permanent Token</label>
              <input
                type="password"
                placeholder="perm:..."
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Enable notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Sound enabled</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
