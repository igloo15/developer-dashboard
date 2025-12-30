import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Pipeline, Job } from '../../types/gitlab';

interface PipelineCardProps {
  pipeline: Pipeline;
  onUpdate: () => void;
}

export default function PipelineCard({ pipeline, onUpdate }: PipelineCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await invoke('gitlab_retry_pipeline', {
        projectId: pipeline.project_id,
        pipelineId: pipeline.id,
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to retry pipeline:', err);
      alert('Failed to retry pipeline');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleToggleJobs = async () => {
    if (!showJobs && jobs.length === 0) {
      setLoadingJobs(true);
      try {
        const fetchedJobs = await invoke<Job[]>('gitlab_fetch_pipeline_jobs', {
          projectId: pipeline.project_id,
          pipelineId: pipeline.id,
        });
        setJobs(fetchedJobs);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    }
    setShowJobs(!showJobs);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'running':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'canceled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'skipped':
        return 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '⟳';
      case 'pending':
        return '○';
      case 'canceled':
        return '⊘';
      case 'skipped':
        return '⇥';
      default:
        return '?';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pipeline.status)}`}>
                {getStatusIcon(pipeline.status)} {pipeline.status}
              </span>
              <a
                href={pipeline.web_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                #{pipeline.iid}
              </a>
              <span className="text-gray-600 dark:text-gray-400">
                {pipeline.ref_name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {pipeline.user && <span>by {pipeline.user.name}</span>}
              <span>{formatDate(pipeline.created_at)}</span>
              {pipeline.duration && (
                <span>Duration: {formatDuration(pipeline.duration)}</span>
              )}
              <span className="font-mono text-xs">{pipeline.sha.substring(0, 8)}</span>
            </div>
          </div>

          <div className="ml-4 flex gap-2">
            <button
              onClick={handleToggleJobs}
              disabled={loadingJobs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loadingJobs ? 'Loading...' : showJobs ? 'Hide Jobs' : 'Show Jobs'}
            </button>
            {(pipeline.status === 'failed' || pipeline.status === 'canceled') && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showJobs && jobs.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-semibold mb-3">Pipeline Jobs</h4>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                  </span>
                  <span className="font-medium">{job.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{job.stage}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {job.duration && <span>{formatDuration(job.duration)}</span>}
                  <a
                    href={job.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
