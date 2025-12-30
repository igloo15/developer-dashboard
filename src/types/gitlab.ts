export interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  web_url?: string;
}

export interface Milestone {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: 'active' | 'closed';
  due_date?: string;
  web_url?: string;
}

export interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate?: string;
  human_total_time_spent?: string;
}

export interface PipelineStatus {
  id: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  ref: string;
  sha: string;
  web_url: string;
}

export interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'merged' | 'closed';
  source_branch: string;
  target_branch: string;
  author: User;
  assignees: User[];
  reviewers: User[];
  upvotes: number;
  downvotes: number;
  pipeline?: PipelineStatus;
  has_conflicts: boolean;
  draft: boolean;
  labels: string[];
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  web_url: string;
  project_id: number;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'closed';
  labels: string[];
  assignees: User[];
  author: User;
  milestone?: Milestone;
  due_date?: string;
  weight?: number;
  time_stats: TimeStats;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  web_url: string;
  project_id: number;
}

export interface Job {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  stage: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  web_url: string;
}

export interface Pipeline {
  id: number;
  iid: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  jobs: Job[];
  user: User;
  project_id: number;
}

export interface MRFilters {
  state?: 'opened' | 'merged' | 'closed' | 'all';
  author_id?: number;
  assignee_id?: number;
  labels?: string[];
  target_branch?: string;
}

export interface IssueFilters {
  state?: 'opened' | 'closed' | 'all';
  author_id?: number;
  assignee_id?: number;
  labels?: string[];
  milestone?: string;
}

export interface PipelineFilters {
  status?: 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';
  ref?: string;
  username?: string;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  state_event?: 'close' | 'reopen';
  assignee_ids?: number[];
  labels?: string[];
  due_date?: string;
}
