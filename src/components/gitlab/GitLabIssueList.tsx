import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { GitLabIssue } from '../../types/gitlab';
import GitLabIssueCard from './GitLabIssueCard';
import { useNotifications } from '../../hooks/useNotifications';

export default function GitLabIssueList() {
  const [issues, setIssues] = useState<GitLabIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState('opened');
  const { sendNotification } = useNotifications();

  const fetchIssues = async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedIssues = await invoke<GitLabIssue[]>('gitlab_fetch_issues', {
        stateFilter: stateFilter === 'all' ? undefined : stateFilter,
      });

      // Check for new issues
      if (issues.length > 0 && stateFilter === 'opened') {
        fetchedIssues.forEach(newIssue => {
          const existingIssue = issues.find(i => i.id === newIssue.id);
          if (!existingIssue) {
            sendNotification(
              'gitlab_issue',
              'New Issue',
              `${newIssue.author.name}: ${newIssue.title}`,
              newIssue.web_url,
              { issueId: newIssue.id, issueIid: newIssue.iid }
            );
          }
        });
      }

      setIssues(fetchedIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [stateFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStateFilter('opened')}
            className={`px-4 py-2 rounded-lg ${
              stateFilter === 'opened' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setStateFilter('closed')}
            className={`px-4 py-2 rounded-lg ${
              stateFilter === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Closed
          </button>
          <button
            onClick={() => setStateFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              stateFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            All
          </button>
        </div>

        <button
          onClick={fetchIssues}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">No issues found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <GitLabIssueCard key={issue.id} issue={issue} onUpdate={fetchIssues} />
          ))}
        </div>
      )}
    </div>
  );
}
