import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { MergeRequest } from '../../types/gitlab';
import MergeRequestCard from './MergeRequestCard';
import { useNotifications } from '../../hooks/useNotifications';

export default function MergeRequestList() {
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState('opened');
  const { sendNotification } = useNotifications();

  const fetchMergeRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const mrs = await invoke<MergeRequest[]>('gitlab_fetch_merge_requests', {
        stateFilter: stateFilter === 'all' ? undefined : stateFilter,
      });

      // Check for new merge requests
      if (mergeRequests.length > 0 && stateFilter === 'opened') {
        mrs.forEach(newMr => {
          const existingMr = mergeRequests.find(m => m.id === newMr.id);
          if (!existingMr) {
            sendNotification(
              'gitlab_mr',
              'New Merge Request',
              `${newMr.author.name}: ${newMr.title}`,
              newMr.web_url,
              { mrId: newMr.id, mrIid: newMr.iid }
            );
          }
        });
      }

      setMergeRequests(mrs);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMergeRequests();
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
            onClick={() => setStateFilter('merged')}
            className={`px-4 py-2 rounded-lg ${
              stateFilter === 'merged' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Merged
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
          onClick={fetchMergeRequests}
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
          <p className="text-gray-500 dark:text-gray-400">Loading merge requests...</p>
        </div>
      ) : mergeRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">No merge requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mergeRequests.map((mr) => (
            <MergeRequestCard key={mr.id} mergeRequest={mr} onUpdate={fetchMergeRequests} />
          ))}
        </div>
      )}
    </div>
  );
}
