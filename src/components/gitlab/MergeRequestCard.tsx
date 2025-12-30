import { invoke } from '@tauri-apps/api/core';
import type { MergeRequest } from '../../types/gitlab';

interface MergeRequestCardProps {
  mergeRequest: MergeRequest;
  onUpdate: () => void;
}

export default function MergeRequestCard({ mergeRequest, onUpdate }: MergeRequestCardProps) {
  const handleApprove = async () => {
    try {
      await invoke('gitlab_approve_mr', {
        projectId: mergeRequest.project_id,
        mrIid: mergeRequest.iid,
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to approve MR:', err);
      alert('Failed to approve merge request');
    }
  };

  const getPipelineStatusColor = (status?: string) => {
    if (!status) return 'gray';
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <a
              href={mergeRequest.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              !{mergeRequest.iid} - {mergeRequest.title}
            </a>
            {mergeRequest.draft && (
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                Draft
              </span>
            )}
            {mergeRequest.has_conflicts && (
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                Conflicts
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{mergeRequest.source_branch} → {mergeRequest.target_branch}</span>
            <span>by {mergeRequest.author.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {mergeRequest.pipeline && (
              <div className={`flex items-center gap-1 text-${getPipelineStatusColor(mergeRequest.pipeline.status)}-600`}>
                <span>Pipeline: {mergeRequest.pipeline.status}</span>
              </div>
            )}

            {mergeRequest.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <span>Assigned to: {mergeRequest.assignees.map(a => a.name).join(', ')}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span>👍 {mergeRequest.upvotes}</span>
              <span>👎 {mergeRequest.downvotes}</span>
            </div>
          </div>

          {mergeRequest.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mergeRequest.labels.map((label) => (
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

        {mergeRequest.state === 'opened' && (
          <button
            onClick={handleApprove}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
