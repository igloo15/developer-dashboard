# Tauri + React Application: GitHub Awesome List Scanner

## Overview
Create a desktop application using Tauri and React that scans GitHub Awesome lists and extracts detailed information about each repository, including tags, last updated date, stars, license, and other relevant metadata.

## Technical Stack
- **Frontend**: React with TypeScript
- **Desktop Framework**: Tauri
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: fetch API
- **GitHub API**: REST API v3

## Core Requirements



# Tauri + React Application: GitHub Awesome List Scanner + Project Management Dashboard

## Overview
Create a comprehensive desktop application using Tauri and React that serves as both a GitHub Awesome list scanner and a unified project management dashboard. The application scans GitHub Awesome lists for repository information and provides real-time tracking for GitLab (Merge Requests, Issues, CI/CD) and YouTrack issues, with Windows notifications for important updates.

## Technical Stack
- **Frontend**: React with TypeScript
- **Desktop Framework**: Tauri
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect, useContext)
- **HTTP Client**: fetch API
- **APIs**: GitHub REST API v3, GitLab REST API, YouTrack REST API
- **Notifications**: Tauri notification plugin
- **Background Tasks**: Tauri async commands with periodic polling

## Core Requirements

### 1. GitHub Awesome List Scanner (Original Requirements)

### 1. Input Interface
- Text input field for Awesome list URL (e.g., `https://github.com/sindresorhus/awesome`)
- Validation to ensure the URL is a valid GitHub repository
- "Scan" button to initiate the scanning process
- Loading indicator during the scan

### 2. Scanning Functionality
**Backend (Rust/Tauri Commands):**
- Create a Tauri command to fetch the README.md content from the GitHub repository
- Parse markdown to extract repository links
- For each repository link, make GitHub API requests to gather:
  - Repository name and full name
  - Description
  - Star count
  - Fork count
  - License type
  - Last updated date
  - Primary language
  - Topics/tags
  - Open issues count
  - Homepage URL (if available)

**Frontend (React):**
- Display real-time progress as repositories are being scanned
- Handle errors gracefully (rate limiting, invalid repos, network issues)
- Show success/error messages

### 3. Data Display
Create a comprehensive table/list view showing:
- Repository name (as clickable link to GitHub)
- Description
- Stars (with icon)
- Last updated (formatted as relative time)
- License
- Language
- Tags/topics (as badges)
- Filter and sort options:
  - Sort by: stars, last updated, name
  - Filter by: license type, language, minimum stars
  - Search by repository name or description

### 4. Export Functionality
- Export results to CSV format
- Export results to JSON format
- Save button with file dialog to choose export location

### 5. Additional Features
- Cache results to avoid re-scanning
- GitHub API token input (optional) for higher rate limits
- Dark/light mode toggle
- Refresh individual repository data
- View detailed information in a modal/side panel

## Implementation Details

### Tauri Commands Needed
```rust
#[tauri::command]
async fn fetch_awesome_list(url: String) -> Result<String, String>

#[tauri::command]
async fn fetch_repo_info(owner: String, repo: String, token: Option<String>) -> Result<RepoInfo, String>

#[tauri::command]
async fn export_data(data: String, format: String, path: String) -> Result<(), String>
```

### React Components Structure
- `App.tsx` - Main application container
- `InputForm.tsx` - URL input and scan button
- `RepositoryTable.tsx` - Main data display table
- `RepositoryRow.tsx` - Individual repository item
- `Filters.tsx` - Filtering and sorting controls
- `DetailModal.tsx` - Detailed repository information
- `ExportButton.tsx` - Export functionality
- `LoadingSpinner.tsx` - Loading state indicator

### GitHub API Considerations
- Implement rate limit handling (60 requests/hour unauthenticated, 5000 with token)
- Add retry logic with exponential backoff
- Display remaining API quota to user
- Batch requests efficiently

### Error Handling
- Network errors
- Invalid URLs
- API rate limiting
- Parsing errors for non-standard Awesome list formats
- Missing or incomplete repository data

## UI/UX Requirements
- Clean, modern interface
- Responsive layout
- Intuitive navigation
- Progress feedback during long operations
- Error messages that are user-friendly
- Keyboard shortcuts for common actions
- Empty state when no data is loaded

## Performance Considerations
- Implement pagination for large lists (100+ repositories)
- Use virtual scrolling for very large datasets
- Debounce search/filter inputs
- Cache GitHub API responses
- Lazy load repository details

## Bonus Features
- Compare multiple Awesome lists side-by-side
- Track repository trends over time (if scanned multiple times)
- Bookmark favorite repositories
- Generate summary statistics (most popular language, average stars, etc.)
- Import/export scan history

## Testing Requirements
- Test with various Awesome list formats
- Test rate limit handling
- Test with invalid inputs
- Test export functionality
- Test offline behavior

## Deliverables
1. Fully functional Tauri + React application
2. Clean, well-documented code
3. README with setup instructions
4. Example screenshots
5. Build instructions for Windows, macOS, and Linux


---

## New Requirements: Project Management Integration

### 2. GitLab Integration

#### 2.1 GitLab Configuration
- Settings panel for GitLab connection:
  - GitLab instance URL (default: `https://gitlab.com`)
  - Personal Access Token input
  - Test connection button
  - Save credentials securely using Tauri's secure storage

#### 2.2 Merge Request Tracking
**Features:**
- List all merge requests across multiple projects
- Filter by:
  - Status (open, merged, closed)
  - Author
  - Assignee
  - Project
  - Labels
  - Target branch
- Display information:
  - MR title and description
  - Source → Target branch
  - Author and assignees
  - Status (draft, open, merged, conflicts)
  - Upvotes/downvotes
  - Pipeline status
  - Number of comments
  - Created/updated timestamps
  - Approval status
- Actions:
  - Click to open in browser
  - Quick approve/unapprove
  - Add comment
  - Merge (if permissions allow)
  - Mark as reviewed

#### 2.3 GitLab Issue Tracking
**Features:**
- List issues across projects
- Filter by:
  - Status (open, closed)
  - Assignee
  - Author
  - Labels
  - Milestone
  - Due date
  - Weight/priority
- Display information:
  - Issue title and description
  - Status and type (issue, incident, task)
  - Assignees
  - Labels (as colored badges)
  - Due date
  - Time estimate vs. time spent
  - Comments count
  - Created/updated timestamps
- Actions:
  - Click to open in browser
  - Change status
  - Assign/unassign
  - Add labels
  - Set due date
  - Add quick comment

#### 2.4 GitLab CI/CD Pipeline Tracker
**Features:**
- Real-time pipeline status monitoring
- Display information:
  - Pipeline ID and status (running, passed, failed, canceled)
  - Project name
  - Branch/tag
  - Commit SHA and message
  - Triggered by (user/schedule/API)
  - Duration
  - Individual job statuses within pipeline
  - Stage breakdown
- Visual indicators:
  - Color-coded status badges
  - Progress bars for running pipelines
  - Timeline view of pipeline stages
- Filters:
  - Project
  - Branch
  - Status
  - Triggered by
  - Date range
- Actions:
  - Click to view full pipeline in browser
  - Retry failed pipeline
  - Cancel running pipeline
  - View job logs (in-app viewer)

### 3. YouTrack Integration

#### 3.1 YouTrack Configuration
- Settings panel for YouTrack connection:
  - YouTrack instance URL
  - Permanent token input
  - Test connection button
  - Save credentials securely

#### 3.2 YouTrack Issue Tracking
**Features:**
- List issues from YouTrack projects
- Filter by:
  - Project
  - Status/State
  - Assignee
  - Reporter
  - Priority
  - Type (Bug, Feature, Task, etc.)
  - Tags
  - Sprint/Iteration
  - Custom fields
- Display information:
  - Issue ID and summary
  - Description preview
  - Status and priority
  - Assignee
  - Reporter
  - Tags (colored badges)
  - Created/updated timestamps
  - Due date
  - Spent time vs. estimated time
  - Custom field values
  - Comments count
  - Attachments count
- Actions:
  - Click to open in browser
  - Change status/state
  - Assign/unassign
  - Add tags
  - Add comment
  - Update custom fields
  - Log work time

### 4. Windows Notifications System

#### 4.1 Notification Triggers
**GitLab Notifications:**
- New merge request assigned to you
- Merge request approved/changes requested
- Merge request merged or closed
- New comment on your merge request
- Merge request conflicts detected
- Pipeline status changes (failed, passed) for your branches
- New issue assigned to you
- Issue status changed
- Issue mentioned you
- New comment on issues you're watching

**YouTrack Notifications:**
- New issue assigned to you
- Issue status/state changed on watched issues
- Issue priority changed
- New comment on your issues
- New comment mentioning you
- Due date approaching (configurable threshold)
- Issue moved to your current sprint

#### 4.2 Notification Features
- Native Windows toast notifications using Tauri
- Notification settings panel:
  - Enable/disable notifications globally
  - Enable/disable per category
  - Quiet hours configuration
  - Sound on/off
  - Notification duration
  - Priority filtering (only high-priority items)
- Notification content:
  - Relevant icon (GitLab/YouTrack logo)
  - Title (e.g., "New Merge Request")
  - Body text (summary of the change)
  - Action buttons (View, Dismiss)
- Notification history:
  - In-app notification center
  - Mark as read/unread
  - Clear all
  - Click to navigate to relevant item

#### 4.3 Background Polling
- Configurable polling intervals:
  - GitLab MRs: 1-60 minutes (default: 5 minutes)
  - GitLab Issues: 5-60 minutes (default: 10 minutes)
  - GitLab CI/CD: 30 seconds - 10 minutes (default: 2 minutes)
  - YouTrack Issues: 1-60 minutes (default: 5 minutes)
- Smart polling:
  - Increase frequency when app is in focus
  - Decrease frequency when idle
  - Stop polling when offline
- Manual refresh buttons for each section
- Last updated timestamp display

### 5. Unified Dashboard

#### 5.1 Navigation
- Sidebar navigation with sections:
  - Home/Dashboard (overview)
  - GitHub Scanner
  - GitLab
    - Merge Requests
    - Issues
    - CI/CD Pipelines
  - YouTrack Issues
  - Notifications
  - Settings

#### 5.2 Dashboard Overview
- Summary cards showing:
  - Open merge requests assigned to you
  - Pending approvals
  - Failed pipelines requiring attention
  - GitLab issues assigned to you
  - YouTrack issues assigned to you
  - Upcoming due dates
  - Recent notifications
- Quick action buttons
- Activity timeline (recent changes across all platforms)

#### 5.3 Cross-Platform Features
- Unified search across all platforms
- Global filters (show only my items, hide closed, etc.)
- Bookmarks/favorites system
- Custom views/saved filters
- Workspace switching (different projects/teams)

## Implementation Details

### Tauri Commands Needed

```rust
// GitHub (from original)
#[tauri::command]
async fn fetch_awesome_list(url: String) -> Result<String, String>

#[tauri::command]
async fn fetch_repo_info(owner: String, repo: String, token: Option<String>) -> Result<RepoInfo, String>

// GitLab
#[tauri::command]
async fn gitlab_test_connection(url: String, token: String) -> Result<bool, String>

#[tauri::command]
async fn gitlab_fetch_merge_requests(url: String, token: String, filters: MRFilters) -> Result<Vec<MergeRequest>, String>

#[tauri::command]
async fn gitlab_fetch_issues(url: String, token: String, filters: IssueFilters) -> Result<Vec<Issue>, String>

#[tauri::command]
async fn gitlab_fetch_pipelines(url: String, token: String, filters: PipelineFilters) -> Result<Vec<Pipeline>, String>

#[tauri::command]
async fn gitlab_approve_mr(url: String, token: String, project_id: String, mr_iid: i32) -> Result<(), String>

#[tauri::command]
async fn gitlab_update_issue(url: String, token: String, project_id: String, issue_iid: i32, update: IssueUpdate) -> Result<(), String>

#[tauri::command]
async fn gitlab_retry_pipeline(url: String, token: String, project_id: String, pipeline_id: i32) -> Result<(), String>

// YouTrack
#[tauri::command]
async fn youtrack_test_connection(url: String, token: String) -> Result<bool, String>

#[tauri::command]
async fn youtrack_fetch_issues(url: String, token: String, filters: YouTrackFilters) -> Result<Vec<YouTrackIssue>, String>

#[tauri::command]
async fn youtrack_update_issue(url: String, token: String, issue_id: String, update: YouTrackUpdate) -> Result<(), String>

#[tauri::command]
async fn youtrack_add_comment(url: String, token: String, issue_id: String, comment: String) -> Result<(), String>

// Notifications
#[tauri::command]
async fn send_notification(title: String, body: String, icon: Option<String>) -> Result<(), String>

#[tauri::command]
async fn start_background_polling(settings: PollingSettings) -> Result<(), String>

#[tauri::command]
async fn stop_background_polling() -> Result<(), String>

// Storage
#[tauri::command]
async fn save_credentials(service: String, credentials: Credentials) -> Result<(), String>

#[tauri::command]
async fn load_credentials(service: String) -> Result<Option<Credentials>, String>

#[tauri::command]
async fn export_data(data: String, format: String, path: String) -> Result<(), String>
```

### React Components Structure

**Core Components:**
- `App.tsx` - Main application container with routing
- `Sidebar.tsx` - Navigation sidebar
- `Dashboard.tsx` - Overview dashboard

**GitHub Scanner Components:**
- `InputForm.tsx` - URL input and scan button
- `RepositoryTable.tsx` - Main data display table
- `RepositoryRow.tsx` - Individual repository item
- `Filters.tsx` - Filtering and sorting controls
- `DetailModal.tsx` - Detailed repository information
- `ExportButton.tsx` - Export functionality
- `LoadingSpinner.tsx` - Loading state indicator

**GitLab Components:**
- `GitLabSettings.tsx` - Configuration panel
- `MergeRequestList.tsx` - List of merge requests
- `MergeRequestCard.tsx` - Individual MR card
- `MergeRequestDetail.tsx` - Detailed MR view
- `GitLabIssueList.tsx` - List of GitLab issues
- `GitLabIssueCard.tsx` - Individual issue card
- `PipelineList.tsx` - CI/CD pipelines list
- `PipelineCard.tsx` - Individual pipeline card
- `PipelineDetail.tsx` - Detailed pipeline view with jobs
- `JobLogViewer.tsx` - View job logs

**YouTrack Components:**
- `YouTrackSettings.tsx` - Configuration panel
- `YouTrackIssueList.tsx` - List of YouTrack issues
- `YouTrackIssueCard.tsx` - Individual issue card
- `YouTrackIssueDetail.tsx` - Detailed issue view
- `CustomFieldEditor.tsx` - Edit custom fields

**Notification Components:**
- `NotificationCenter.tsx` - In-app notification list
- `NotificationItem.tsx` - Individual notification
- `NotificationSettings.tsx` - Configure notification preferences

**Shared Components:**
- `StatusBadge.tsx` - Colored status indicators
- `PriorityIcon.tsx` - Priority indicators
- `UserAvatar.tsx` - User avatars
- `TagList.tsx` - Tag/label badges
- `ActionButton.tsx` - Quick action buttons
- `SearchBar.tsx` - Unified search
- `FilterPanel.tsx` - Advanced filtering

### Data Models

```typescript
// GitLab
interface MergeRequest {
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
  web_url: string;
}

interface GitLabIssue {
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
  web_url: string;
}

interface Pipeline {
  id: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled';
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  duration?: number;
  jobs: Job[];
  user: User;
}

// YouTrack
interface YouTrackIssue {
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

// Notifications
interface Notification {
  id: string;
  type: 'gitlab_mr' | 'gitlab_issue' | 'gitlab_pipeline' | 'youtrack_issue';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data: any;
}
```

### API Considerations

**GitLab API:**
- Base URL: `{instance}/api/v4/`
- Authentication: Personal Access Token (header: `PRIVATE-TOKEN`)
- Rate limiting: 300 requests per minute per user
- Webhooks alternative for real-time updates (advanced feature)

**YouTrack API:**
- Base URL: `{instance}/api/`
- Authentication: Permanent Token (header: `Authorization: Bearer {token}`)
- Rate limiting: Varies by instance configuration
- Support for custom fields requires dynamic field resolution

### Background Service Implementation

```rust
// Tauri background service for polling
use tauri::async_runtime;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};

struct PollingService {
    gitlab_client: Arc<Mutex<GitLabClient>>,
    youtrack_client: Arc<Mutex<YouTrackClient>>,
    notification_sender: Arc<Mutex<NotificationSender>>,
}

impl PollingService {
    async fn start_polling(&self, settings: PollingSettings) {
        // GitLab MR polling
        let mut mr_interval = interval(Duration::from_secs(settings.gitlab_mr_interval));
        
        // GitLab Issues polling
        let mut issue_interval = interval(Duration::from_secs(settings.gitlab_issue_interval));
        
        // GitLab CI/CD polling
        let mut pipeline_interval = interval(Duration::from_secs(settings.gitlab_pipeline_interval));
        
        // YouTrack polling
        let mut youtrack_interval = interval(Duration::from_secs(settings.youtrack_interval));
        
        // Spawn polling tasks
        async_runtime::spawn(async move {
            loop {
                tokio::select! {
                    _ = mr_interval.tick() => {
                        self.check_gitlab_mrs().await;
                    }
                    _ = issue_interval.tick() => {
                        self.check_gitlab_issues().await;
                    }
                    _ = pipeline_interval.tick() => {
                        self.check_pipelines().await;
                    }
                    _ = youtrack_interval.tick() => {
                        self.check_youtrack_issues().await;
                    }
                }
            }
        });
    }
}
```

### Security Considerations

- Store API tokens using Tauri's secure storage (keytar/keyring)
- Never log sensitive credentials
- Validate all API responses
- Implement HTTPS only for API connections
- Allow custom CA certificates for self-hosted instances
- Implement token expiration handling
- Secure local storage encryption for cached data

### Error Handling

- Network errors with retry logic
- API authentication failures
- Rate limiting with backoff
- Invalid tokens/credentials
- API endpoint changes
- Malformed responses
- Notification permission denial
- Background service failures

## UI/UX Requirements

- Clean, modern interface with consistent design language
- Responsive layout for different window sizes
- Intuitive navigation between sections
- Real-time updates without page refresh
- Loading states for all async operations
- Empty states for each section
- Error messages that are actionable
- Toast notifications for user actions
- Keyboard shortcuts for power users
- Dark/light theme support
- Customizable layout (drag-and-drop panels)
- Accessibility compliance (ARIA labels, keyboard navigation)

## Performance Considerations

- Implement virtual scrolling for large lists
- Lazy load detailed views
- Cache API responses with TTL
- Debounce search inputs
- Optimize re-renders with React.memo
- Use Web Workers for heavy parsing
- Implement pagination for large datasets
- Background task optimization
- Memory management for long-running sessions

## Configuration & Settings

### Settings Panel Sections:
1. **General**
   - Theme selection
   - Language preference
   - Startup behavior
   - Auto-update settings

2. **GitHub**
   - API token
   - Default scan behavior
   - Export preferences

3. **GitLab**
   - Instance URL
   - Access token
   - Default project/group
   - Polling intervals
   - Watched projects

4. **YouTrack**
   - Instance URL
   - Permanent token
   - Default project
   - Polling interval
   - Watched projects

5. **Notifications**
   - Enable/disable by category
   - Quiet hours
   - Sound preferences
   - Priority filters
   - Desktop notification style

6. **Advanced**
   - Cache management
   - Debug mode
   - API request logging
   - Reset application

## Testing Requirements

- Unit tests for all API clients
- Integration tests for GitLab/YouTrack APIs
- Test notification delivery
- Test background polling service
- Test credential storage/retrieval
- Test offline behavior
- Test rate limiting handling
- UI component tests with React Testing Library
- E2E tests with Playwright or Tauri's testing tools

## Bonus Features

- Multiple workspace support (work/personal)
- GitLab/YouTrack board view (Kanban)
- Time tracking integration
- Custom notification rules engine
- Bulk operations on issues/MRs
- Keyboard macro system
- Command palette (Cmd/Ctrl+K)
- Integration with calendar for due dates
- Markdown preview for descriptions
- Code diff viewer for MRs
- Pipeline visualization graph
- Sprint/milestone progress tracking
- Analytics and reporting
- Export reports to PDF
- Slack/Teams integration for notifications
- Browser extension companion

## Deliverables

1. Fully functional Tauri + React application
2. Clean, well-documented code with TypeScript
3. Comprehensive README with:
   - Setup instructions
   - API token generation guides
   - Configuration examples
   - Troubleshooting guide
4. Example screenshots and demo video
5. Build instructions for Windows, macOS, and Linux
6. User manual/documentation
7. API documentation for extensibility
8. CI/CD pipeline for building releases
9. Installer packages for each platform

## Platform-Specific Requirements

### Windows
- Native Windows notifications
- System tray integration
- Auto-start on login option
- Windows-style UI conventions

### Future Considerations (macOS/Linux)
- Native notification APIs for each platform
- Platform-specific menu bars
- Platform-specific shortcuts
- OS-specific installers