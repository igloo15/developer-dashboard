export interface User {
  id: string;
  login: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  shortName: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: {
    id: string;
    background: string;
    foreground: string;
  };
}

export interface CustomField {
  id: string;
  name: string;
  value: any;
  $type: string;
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  created: number;
  updated: number;
}

export interface YouTrackIssue {
  id: string;
  idReadable: string;
  summary: string;
  description?: string;
  created: number;
  updated: number;
  resolved?: number;
  reporter: User;
  assignee?: User;
  project: Project;
  customFields: CustomField[];
  tags: Tag[];
  comments: Comment[];
}

export interface YouTrackFilters {
  project?: string;
  assignee?: string;
  reporter?: string;
  state?: string;
  priority?: string;
  type?: string;
  tags?: string[];
}

export interface YouTrackUpdate {
  summary?: string;
  description?: string;
  customFields?: Record<string, any>;
}
