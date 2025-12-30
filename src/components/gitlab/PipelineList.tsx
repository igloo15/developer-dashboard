import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Pipeline } from '../../types/gitlab';
import PipelineCard from './PipelineCard';
import { useNotifications } from '../../hooks/useNotifications';

export default function PipelineList() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { sendNotification } = useNotifications();

  const fetchPipelines = async () => {
    setLoading(true);
    setError('');

    try {
      const fetchedPipelines = await invoke<Pipeline[]>('gitlab_fetch_pipelines');

      // Check for pipeline status changes (failed or success)
      if (pipelines.length > 0) {
        fetchedPipelines.forEach(newPipeline => {
          const oldPipeline = pipelines.find(p => p.id === newPipeline.id);
          if (oldPipeline && oldPipeline.status !== newPipeline.status) {
            if (newPipeline.status === 'failed') {
              sendNotification(
                'gitlab_pipeline',
                'Pipeline Failed',
                `Pipeline #${newPipeline.iid} for ${newPipeline.ref_name} has failed`,
                newPipeline.web_url,
                { pipelineId: newPipeline.id, status: newPipeline.status }
              );
            } else if (newPipeline.status === 'success') {
              sendNotification(
                'gitlab_pipeline',
                'Pipeline Succeeded',
                `Pipeline #${newPipeline.iid} for ${newPipeline.ref_name} has passed`,
                newPipeline.web_url,
                { pipelineId: newPipeline.id, status: newPipeline.status }
              );
            }
          }
        });
      }

      setPipelines(fetchedPipelines);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const filteredPipelines = pipelines.filter(pipeline => {
    if (statusFilter === 'all') return true;
    return pipeline.status === statusFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'All', color: 'gray' },
    { value: 'success', label: 'Success', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'running', label: 'Running', color: 'blue' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchPipelines}
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
          <p className="text-gray-500 dark:text-gray-400">Loading pipelines...</p>
        </div>
      ) : filteredPipelines.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            No {statusFilter !== 'all' ? statusFilter : ''} pipelines found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPipelines.map((pipeline) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} onUpdate={fetchPipelines} />
          ))}
        </div>
      )}
    </div>
  );
}
