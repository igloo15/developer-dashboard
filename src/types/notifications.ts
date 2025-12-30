export type NotificationType =
  | 'gitlab_mr'
  | 'gitlab_issue'
  | 'gitlab_pipeline'
  | 'youtrack_issue';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

export interface NotificationSettings {
  enabled: boolean;
  gitlabMR: boolean;
  gitlabIssue: boolean;
  gitlabPipeline: boolean;
  youtrackIssue: boolean;
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  priorityOnly: boolean;
}

export interface PollingSettings {
  gitlab_mr_interval: number;
  gitlab_issue_interval: number;
  gitlab_pipeline_interval: number;
  youtrack_interval: number;
}
