import type { Repository } from '../../types';

interface RepositoryRowProps {
  repository: Repository;
}

export default function RepositoryRow({ repository }: RepositoryRowProps) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {repository.full_name}
            </a>
            {repository.category && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                📂 {repository.category}
              </span>
            )}
            {repository.homepage && (
              <a
                href={repository.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Homepage"
              >
                🔗
              </a>
            )}
          </div>

          {repository.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-3">{repository.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span>{formatNumber(repository.stargazers_count)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span>🔀</span>
              <span>{formatNumber(repository.forks_count)}</span>
            </div>

            {repository.language && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>{repository.language}</span>
              </div>
            )}

            {repository.license && (
              <div className="flex items-center gap-1">
                <span>⚖️</span>
                <span>{repository.license.name}</span>
              </div>
            )}

            <div className="text-gray-500 dark:text-gray-400">
              Updated {formatDate(repository.updated_at)}
            </div>

            {repository.added_to_list_at && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span>📅</span>
                <span>Added {formatDate(repository.added_to_list_at)}</span>
              </div>
            )}
          </div>

          {repository.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {repository.topics.map(topic => (
                <span
                  key={topic}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
