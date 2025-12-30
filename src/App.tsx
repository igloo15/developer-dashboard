import { useState } from "react";
import Sidebar from "./components/shared/Sidebar";
import Dashboard from "./components/shared/Dashboard";
import GitHubScanner from "./components/github/GitHubScanner";
import GitLabSection from "./components/gitlab/GitLabSection";
import YouTrackSection from "./components/youtrack/YouTrackSection";
import NotificationSection from "./components/notifications/NotificationSection";
import Settings from "./components/shared/Settings";

function App() {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "github":
        return <GitHubScanner />;
      case "gitlab-mrs":
      case "gitlab-issues":
      case "gitlab-pipelines":
        return <GitLabSection subsection={currentSection} />;
      case "youtrack":
        return <YouTrackSection />;
      case "notifications":
        return <NotificationSection />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar onNavigate={setCurrentSection} currentSection={currentSection} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
