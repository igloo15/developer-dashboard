# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tauri + React desktop application that combines:
1. **GitHub Awesome List Scanner** - Extracts repository metadata from GitHub Awesome lists
2. **Unified Project Management Dashboard** - Real-time tracking for GitLab (MRs, Issues, CI/CD) and YouTrack issues with Windows notifications

## Technology Stack

- **Frontend**: React with TypeScript
- **Desktop Framework**: Tauri (Rust backend)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect, useContext)
- **APIs**: GitHub REST API v3, GitLab REST API v4, YouTrack REST API
- **Notifications**: Tauri notification plugin
- **Background Tasks**: Tauri async commands with periodic polling

## Architecture

### Frontend Structure (React/TypeScript)

**Core Application:**
- `App.tsx` - Main container with routing
- `Sidebar.tsx` - Navigation between GitHub Scanner, GitLab, YouTrack sections
- `Dashboard.tsx` - Overview with summary cards and activity timeline

**GitHub Scanner Module:**
- `InputForm.tsx` - Awesome list URL input and validation
- `RepositoryTable.tsx` - Display scanned repositories with filters/sort
- `RepositoryRow.tsx` - Individual repo card with stars, license, tags
- `DetailModal.tsx` - Detailed repository information
- `ExportButton.tsx` - CSV/JSON export functionality

**GitLab Integration:**
- `GitLabSettings.tsx` - Instance URL + token configuration
- `MergeRequestList.tsx` + `MergeRequestCard.tsx` - MR tracking
- `GitLabIssueList.tsx` + `GitLabIssueCard.tsx` - Issue tracking
- `PipelineList.tsx` + `PipelineCard.tsx` - CI/CD monitoring
- `JobLogViewer.tsx` - View pipeline job logs

**YouTrack Integration:**
- `YouTrackSettings.tsx` - Instance URL + token configuration
- `YouTrackIssueList.tsx` + `YouTrackIssueCard.tsx` - Issue tracking
- `CustomFieldEditor.tsx` - Handle YouTrack custom fields

**Notifications:**
- `NotificationCenter.tsx` - In-app notification history
- `NotificationSettings.tsx` - Configure notification preferences per category

**Shared Components:**
- `StatusBadge.tsx`, `PriorityIcon.tsx`, `UserAvatar.tsx` - Visual indicators
- `TagList.tsx` - Colored tag/label badges
- `SearchBar.tsx`, `FilterPanel.tsx` - Unified search and filtering

### Backend Structure (Rust/Tauri)

**Tauri Commands (src-tauri/):**

GitHub Scanner:
- `fetch_awesome_list(url)` - Fetch and parse README.md
- `fetch_repo_info(owner, repo, token)` - Get repository metadata from GitHub API

GitLab Integration:
- `gitlab_test_connection(url, token)` - Verify credentials
- `gitlab_fetch_merge_requests(url, token, filters)` - Get MRs
- `gitlab_fetch_issues(url, token, filters)` - Get issues
- `gitlab_fetch_pipelines(url, token, filters)` - Get CI/CD pipelines
- `gitlab_approve_mr(url, token, project_id, mr_iid)` - Approve MR
- `gitlab_update_issue(url, token, project_id, issue_iid, update)` - Update issue
- `gitlab_retry_pipeline(url, token, project_id, pipeline_id)` - Retry pipeline

YouTrack Integration:
- `youtrack_test_connection(url, token)` - Verify credentials
- `youtrack_fetch_issues(url, token, filters)` - Get issues
- `youtrack_update_issue(url, token, issue_id, update)` - Update issue
- `youtrack_add_comment(url, token, issue_id, comment)` - Add comment

Notifications & Background:
- `send_notification(title, body, icon)` - Windows toast notifications
- `start_background_polling(settings)` - Start polling service
- `stop_background_polling()` - Stop polling

Storage:
- `save_credentials(service, credentials)` - Secure credential storage (keyring)
- `load_credentials(service)` - Retrieve credentials
- `export_data(data, format, path)` - Export to CSV/JSON

**Background Polling Service:**
Implements periodic polling using `tokio::time::interval` with configurable intervals:
- GitLab MRs: Default 5 minutes
- GitLab Issues: Default 10 minutes
- GitLab CI/CD: Default 2 minutes
- YouTrack Issues: Default 5 minutes

Uses `tokio::select!` for concurrent polling tasks and sends notifications on state changes.

## Key Data Models

```typescript
interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  state: 'opened' | 'merged' | 'closed';
  source_branch: string;
  target_branch: string;
  author: User;
  assignees: User[];
  pipeline?: PipelineStatus;
  has_conflicts: boolean;
  draft: boolean;
  labels: string[];
  web_url: string;
}

interface Pipeline {
  id: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled';
  ref: string;
  jobs: Job[];
}

interface YouTrackIssue {
  id: string;
  idReadable: string;
  summary: string;
  customFields: CustomField[];
  tags: Tag[];
}
```

## API Integration Details

**GitHub API:**
- Unauthenticated: 60 requests/hour
- Authenticated (token): 5000 requests/hour
- Implement rate limit handling with exponential backoff

**GitLab API:**
- Base: `{instance}/api/v4/`
- Auth header: `PRIVATE-TOKEN: {token}`
- Rate limit: 300 requests/minute/user

**YouTrack API:**
- Base: `{instance}/api/`
- Auth header: `Authorization: Bearer {token}`
- Supports dynamic custom fields requiring field resolution

## Development Workflow

### Setting Up
When initializing this project, you'll need to:
1. Initialize Tauri project with React template
2. Configure Tailwind CSS
3. Set up Rust dependencies for HTTP clients (reqwest), async runtime (tokio), and serialization (serde)
4. Configure Tauri permissions for notifications, filesystem, and HTTP requests

### Building
- **Frontend**: Standard React build process (Vite/webpack)
- **Tauri**: `tauri build` compiles Rust + bundles React app
- Target platforms: Windows (primary), macOS, Linux (future)

### Testing Strategy
- Unit tests for Rust API clients
- Integration tests for GitLab/YouTrack API interactions
- React Testing Library for UI components
- Test notification delivery and background polling
- Test rate limiting and credential storage

## Important Implementation Notes

### Security
- Store API tokens using Tauri's keyring integration (never in plain text)
- Validate all API responses
- HTTPS only for external API connections
- Support custom CA certificates for self-hosted GitLab/YouTrack

### Performance
- Virtual scrolling for large lists (100+ items)
- Cache API responses with TTL
- Debounce search inputs
- Use React.memo for expensive components
- Background polling with smart frequency (increase when focused, decrease when idle)

### Error Handling
- Network errors with retry logic
- API authentication failures with clear user messaging
- Rate limiting with backoff and quota display
- Graceful handling of malformed API responses
- Background service failure recovery

### Notification Triggers
GitLab: New MR assigned, MR approved/merged, pipeline failed/passed, new comments, conflicts detected
YouTrack: Issue assigned, status changed, new comments, due date approaching

Configure quiet hours and priority filtering in settings.

## Cross-Platform Considerations

**Windows (Primary Target):**
- Native Windows toast notifications
- System tray integration
- Auto-start on login option

**Future (macOS/Linux):**
- Adapt notification APIs per platform
- Platform-specific menu bars and shortcuts

## File Organization Pattern

```
/src
  /components
    /github        # GitHub scanner components
    /gitlab        # GitLab components
    /youtrack      # YouTrack components
    /notifications # Notification components
    /shared        # Reusable components
  /hooks           # Custom React hooks
  /services        # API client wrappers
  /types           # TypeScript interfaces
  /utils           # Helper functions

/src-tauri
  /src
    main.rs        # Entry point, command registration
    /commands      # Tauri command implementations
    /services      # Background polling service
    /models        # Rust data structures
```

## Common Patterns

### Making API Calls from Frontend
```typescript
import { invoke } from '@tauri-apps/api/tauri';

const mergeRequests = await invoke<MergeRequest[]>('gitlab_fetch_merge_requests', {
  url: gitlabUrl,
  token: gitlabToken,
  filters: { state: 'opened' }
});
```

### Background Polling Implementation
Use Tokio's async runtime with interval-based polling. Store previous state to detect changes and trigger notifications only on state transitions.

### Credential Storage
Use `save_credentials`/`load_credentials` commands which internally use platform keyring (Windows Credential Manager on Windows).
