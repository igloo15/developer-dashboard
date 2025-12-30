import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { sendNotification } from '@tauri-apps/plugin-notification';
import type { Repository, SavedList } from '../../types';
import { savedListsStorage } from '../../utils/storage';
import InputForm from './InputForm';
import RepositoryTable from './RepositoryTable';
import SavedLists from './SavedLists';

export default function GitHubScanner() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [currentListUrl, setCurrentListUrl] = useState('');
  const [currentListName, setCurrentListName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setError('');
    setRepositories([]);
    setProgress({ current: 0, total: 0 });
    setCurrentListUrl(url);

    try {
      // Fetch the list of repository links from the awesome list with categories
      const repoLinks = await invoke<[string, string, string][]>('fetch_awesome_list_with_categories', { url });

      if (repoLinks.length === 0) {
        setError('No repositories found in this awesome list');
        setIsScanning(false);
        return;
      }

      setProgress({ current: 0, total: repoLinks.length });

      // Fetch information for each repository
      const repos: Repository[] = [];
      let rateLimitHit = false;

      for (let i = 0; i < repoLinks.length; i++) {
        const [owner, repo, category] = repoLinks[i];

        try {
          const repoInfo = await invoke<Repository>('fetch_repo_info', { owner, repo });
          repos.push({ ...repoInfo, category });
          setProgress({ current: i + 1, total: repoLinks.length });
          setRepositories([...repos]);
        } catch (err) {
          console.error(`Failed to fetch ${owner}/${repo}:`, err);

          // Check if it's a rate limit error
          const errorMsg = err instanceof Error ? err.message : String(err);
          if (errorMsg.includes('rate limit') || errorMsg.includes('403')) {
            rateLimitHit = true;
            await sendNotification({
              title: 'GitHub Rate Limit Reached',
              body: 'You have hit the GitHub API rate limit. Consider adding a GitHub token to increase your limit from 60 to 5,000 requests per hour.'
            });
            setError('GitHub API rate limit reached. Please add a GitHub token or wait before retrying.');
            break;
          }
          // Continue with other repositories even if one fails
        }

        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (repos.length === 0 && !rateLimitHit) {
        setError('Failed to fetch repository information. You may have hit the GitHub API rate limit.');
        await sendNotification({
          title: 'Scan Failed',
          body: 'Failed to fetch repository information. You may have hit the GitHub API rate limit.'
        });
        return;
      }

      // Fetch when each repository was added to the awesome list
      try {
        setProgress({ current: 0, total: 1 });
        const addedDates = await invoke<Record<string, string>>('fetch_added_dates', {
          awesomeListUrl: url,
          repoLinks
        });

        // Update repositories with added dates
        const reposWithDates = repos.map(repo => ({
          ...repo,
          added_to_list_at: addedDates[repo.full_name] || null
        }));

        setRepositories(reposWithDates);
      } catch (err) {
        console.error('Failed to fetch added dates:', err);

        // Check if it's a rate limit error
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes('rate limit') || errorMsg.includes('403')) {
          sendNotification({
            title: 'Rate Limit Warning',
            body: 'Could not fetch "added to list" dates due to rate limiting. Repository data is still available.'
          });
        }
        // Continue without dates - they're optional
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const extension = format === 'json' ? 'json' : 'csv';
      const filePath = await save({
        filters: [{
          name: `${format.toUpperCase()} File`,
          extensions: [extension]
        }]
      });

      if (filePath) {
        // Create a map of full_name -> category for the export
        const categories: Record<string, string> = {};
        repositories.forEach(repo => {
          if (repo.category) {
            categories[repo.full_name] = repo.category;
          }
        });

        await invoke('export_repositories', {
          repositories,
          categories,
          format,
          path: filePath
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export repositories');
    }
  };

  const handleSaveToken = async () => {
    try {
      await invoke('set_github_token', { token: githubToken });
      setShowTokenInput(false);
    } catch (err) {
      console.error('Failed to save token:', err);
    }
  };

  const handleSaveList = () => {
    if (!currentListUrl || repositories.length === 0) {
      return;
    }

    if (currentListName.trim()) {
      const savedList: SavedList = {
        id: Date.now().toString(),
        name: currentListName.trim(),
        url: currentListUrl,
        repositories,
        lastScanned: new Date().toISOString(),
        repositoryCount: repositories.length,
      };

      savedListsStorage.save(savedList);
      setShowSaveDialog(false);
      setCurrentListName('');
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleLoadList = (list: SavedList) => {
    setRepositories(list.repositories);
    setCurrentListUrl(list.url);
    setError('');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">GitHub Awesome Lists</h1>
        <button
          onClick={() => setShowTokenInput(!showTokenInput)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showTokenInput ? 'Hide' : 'Set'} GitHub Token
        </button>
      </div>

      {showTokenInput && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">GitHub Personal Access Token</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Adding a token increases your rate limit from 60 to 5,000 requests per hour.
            <a
              href="https://github.com/settings/tokens/new?scopes=public_repo&description=Developer%20Dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Generate a token here
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button
              onClick={handleSaveToken}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <SavedLists onLoadList={handleLoadList} onRescanList={handleScan} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <InputForm onScan={handleScan} isScanning={isScanning} />

        {isScanning && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Scanning repositories... {progress.current} / {progress.total}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((progress.current / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {repositories.length > 0 && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleSaveList}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              💾 Save This List
            </button>
          </div>

          {showSaveDialog && (
            <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Save Awesome List</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentListName}
                  onChange={(e) => setCurrentListName(e.target.value)}
                  placeholder="Enter a name for this list..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveList();
                    if (e.key === 'Escape') setShowSaveDialog(false);
                  }}
                />
                <button
                  onClick={handleSaveList}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <RepositoryTable repositories={repositories} onExport={handleExport} />
        </>
      )}

      {!isScanning && repositories.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Enter a GitHub Awesome list URL to get started
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Example: https://github.com/sindresorhus/awesome
          </p>
        </div>
      )}
    </div>
  );
}
