import { useState, useEffect } from 'react';
import type { SavedList } from '../../types';
import { savedListsStorage } from '../../utils/storage';

interface SavedListsProps {
  onLoadList: (list: SavedList) => void;
  onRescanList: (listUrl: string) => void;
}

export default function SavedLists({ onLoadList, onRescanList }: SavedListsProps) {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    loadSavedLists();
  }, []);

  const loadSavedLists = () => {
    const lists = savedListsStorage.getAll();
    setSavedLists(lists.sort((a, b) =>
      new Date(b.lastScanned).getTime() - new Date(a.lastScanned).getTime()
    ));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved list?')) {
      savedListsStorage.delete(id);
      loadSavedLists();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;

    return `${Math.floor(diffInMonths / 12)}y ago`;
  };

  if (savedLists.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Saved Lists</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {savedLists.length} saved awesome {savedLists.length === 1 ? 'list' : 'lists'}
            </p>
          </div>
        </div>
        <span className="text-gray-400 dark:text-gray-500">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 space-y-2">
          {savedLists.map((list) => (
            <button
              key={list.id}
              onClick={() => onLoadList(list)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{list.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex-shrink-0">
                      {list.repositoryCount} repos
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">
                    {list.url}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last scanned: {formatDate(list.lastScanned)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRescanList(list.url);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-opacity"
                    title="Rescan list"
                  >
                    🔄
                  </button>
                  <button
                    onClick={(e) => handleDelete(list.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                    title="Delete list"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
