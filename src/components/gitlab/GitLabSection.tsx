import { useState } from 'react';
import GitLabSettings from './GitLabSettings';
import MergeRequestList from './MergeRequestList';
import GitLabIssueList from './GitLabIssueList';
import PipelineList from './PipelineList';

interface GitLabSectionProps {
  subsection: string;
}

export default function GitLabSection({ subsection }: GitLabSectionProps) {
  const [showSettings, setShowSettings] = useState(false);

  const getSectionTitle = () => {
    switch (subsection) {
      case 'gitlab-mrs':
        return 'Merge Requests';
      case 'gitlab-issues':
        return 'Issues';
      case 'gitlab-pipelines':
        return 'CI/CD Pipelines';
      default:
        return 'GitLab';
    }
  };

  const renderContent = () => {
    switch (subsection) {
      case 'gitlab-mrs':
        return <MergeRequestList />;
      case 'gitlab-issues':
        return <GitLabIssueList />;
      case 'gitlab-pipelines':
        return <PipelineList />;
      default:
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              Select a GitLab section from the sidebar
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{getSectionTitle()}</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Settings
        </button>
      </div>

      {renderContent()}

      {showSettings && <GitLabSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
