export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: License | null;
  topics: string[];
  updated_at: string;
  created_at: string;
  added_to_list_at: string | null;
  category?: string;
}

export interface License {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
}

export interface ScanProgress {
  total: number;
  current: number;
  currentRepo: string;
}

export interface ScanResult {
  repositories: Repository[];
  totalCount: number;
  scanDate: string;
}

export interface SavedList {
  id: string;
  name: string;
  url: string;
  repositories: Repository[];
  lastScanned: string;
  repositoryCount: number;
}
