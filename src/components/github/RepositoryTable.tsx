import { useState, useMemo } from 'react';
import type { Repository } from '../../types';
import RepositoryRow from './RepositoryRow';

interface RepositoryTableProps {
  repositories: Repository[];
  onExport: (format: 'json' | 'csv') => void;
}

type SortField = 'name' | 'stars' | 'updated_at' | 'added_to_list';
type SortOrder = 'asc' | 'desc';

export default function RepositoryTable({ repositories, onExport }: RepositoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minStars, setMinStars] = useState(0);

  // Get unique languages, licenses, and categories for filters
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach(repo => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [repositories]);

  const licenses = useMemo(() => {
    const lics = new Set<string>();
    repositories.forEach(repo => {
      if (repo.license) lics.add(repo.license.name);
    });
    return Array.from(lics).sort();
  }, [repositories]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    repositories.forEach(repo => {
      if (repo.category) cats.add(repo.category);
    });
    return Array.from(cats).sort();
  }, [repositories]);

  // Filter and sort repositories
  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repositories.filter(repo => {
      const matchesSearch = searchQuery === '' ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage = languageFilter === '' || repo.language === languageFilter;
      const matchesLicense = licenseFilter === '' || repo.license?.name === licenseFilter;
      const matchesCategory = categoryFilter === '' || repo.category === categoryFilter;
      const matchesStars = repo.stargazers_count >= minStars;

      return matchesSearch && matchesLanguage && matchesLicense && matchesCategory && matchesStars;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stars':
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'added_to_list':
          // Handle null values - repos without dates go to the end
          if (!a.added_to_list_at && !b.added_to_list_at) {
            comparison = 0;
          } else if (!a.added_to_list_at) {
            comparison = 1;
          } else if (!b.added_to_list_at) {
            comparison = -1;
          } else {
            comparison = new Date(a.added_to_list_at).getTime() - new Date(b.added_to_list_at).getTime();
          }
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [repositories, sortField, sortOrder, searchQuery, languageFilter, licenseFilter, categoryFilter, minStars]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">All Licenses</option>
            {licenses.map(lic => (
              <option key={lic} value={lic}>{lic}</option>
            ))}
          </select>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm">Min Stars:</label>
            <input
              type="number"
              value={minStars}
              onChange={(e) => setMinStars(Number(e.target.value))}
              min="0"
              className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedRepos.length} of {repositories.length} repositories
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onExport('json')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => onExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleSort('name')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('stars')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'stars' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Stars {sortField === 'stars' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('updated_at')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'updated_at' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Updated {sortField === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('added_to_list')}
          className={`px-4 py-2 rounded-lg ${
            sortField === 'added_to_list' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Added to List {sortField === 'added_to_list' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Repository List */}
      <div className="space-y-3">
        {filteredAndSortedRepos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center text-gray-500 dark:text-gray-400">
            No repositories found matching your filters
          </div>
        ) : (
          filteredAndSortedRepos.map(repo => (
            <RepositoryRow key={repo.id} repository={repo} />
          ))
        )}
      </div>
    </div>
  );
}
