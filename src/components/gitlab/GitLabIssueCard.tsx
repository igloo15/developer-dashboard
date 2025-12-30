import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { GitLabIssue } from '../../types/gitlab';

interface GitLabIssueCardProps {
  issue: GitLabIssue;
  onUpdate: () => void;
}

export default function GitLabIssueCard({ issue, onUpdate }: GitLabIssueCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClose = async () => {
    setIsUpdating(true);
    try {
      await invoke('gitlab_update_issue', {
        projectId: issue.project_id,
        issueIid: issue.iid,
        updates: { state_event: 'close' },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to close issue:', err);
      alert('Failed to close issue');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReopen = async () => {
    setIsUpdating(true);
    try {
      await invoke('gitlab_update_issue', {
        projectId: issue.project_id,
        issueIid: issue.iid,
        updates: { state_event: 'reopen' },
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to reopen issue:', err);
      alert('Failed to reopen issue');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds === 0) return 'None';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <a
              href={issue.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              #{issue.iid} - {issue.title}
            </a>
            <span className={`text-xs px-2 py-1 rounded-full ${
              issue.state === 'opened'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {issue.state}
            </span>
            {issue.weight && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                Weight: {issue.weight}
              </span>
            )}
          </div>

          {issue.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{issue.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>by {issue.author.name}</span>
            <span>Created {formatDate(issue.created_at)}</span>
            {issue.updated_at && <span>Updated {formatDate(issue.updated_at)}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
            {issue.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                <span>{issue.assignees.map(a => a.name).join(', ')}</span>
              </div>
            )}

            {issue.milestone && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Milestone:</span>
                <span>{issue.milestone.title}</span>
              </div>
            )}

            {issue.due_date && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Due:</span>
                <span>{new Date(issue.due_date).toLocaleDateString()}</span>
              </div>
            )}

            {issue.time_stats.total_time_spent > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">Time spent:</span>
                <span>{formatTimeSpent(issue.time_stats.total_time_spent)}</span>
              </div>
            )}
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex gap-2">
          {issue.state === 'opened' ? (
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {isUpdating ? 'Closing...' : 'Close'}
            </button>
          ) : (
            <button
              onClick={handleReopen}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isUpdating ? 'Reopening...' : 'Reopen'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
