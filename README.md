# Developer Dashboard

A comprehensive desktop application built with Tauri and React that combines a GitHub Awesome List Scanner with project management integrations for GitLab and YouTrack.

## Features

### ✅ GitHub Awesome List Scanner (Implemented)
- Scan any GitHub Awesome list to extract repository information
- View detailed repository metadata:
  - Stars, forks, and open issues count
  - Programming language and license
  - Topics/tags
  - Last updated date
  - Description and homepage
- Filter and sort repositories by:
  - Stars, name, or last updated
  - Programming language
  - License type
  - Minimum stars threshold
- Search repositories by name or description
- Export results to JSON or CSV format
- Optional GitHub Personal Access Token support for higher rate limits

### 🚧 Coming Soon
- **GitLab Integration**
  - Merge Request tracking
  - Issue management
  - CI/CD Pipeline monitoring
- **YouTrack Integration**
  - Issue tracking
  - Custom fields support
- **Windows Notifications**
  - Real-time updates for MRs, issues, and pipelines
- **Unified Dashboard**
  - Overview of all your work across platforms

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/) (latest stable)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd developer-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

4. Build for production:
```bash
npm run tauri build
```

## Usage

### GitHub Scanner

1. Navigate to the "GitHub Scanner" section from the sidebar
2. (Optional) Click "Set GitHub Token" and add your Personal Access Token
3. Enter a GitHub Awesome list URL (e.g., `https://github.com/sindresorhus/awesome`)
4. Click "Scan Repository"
5. Browse the results, use filters to refine the list
6. Export to JSON or CSV as needed

### GitHub Token

To increase your API rate limit from 60 to 5,000 requests per hour:

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens/new?scopes=public_repo&description=Developer%20Dashboard)
2. Generate a token with `public_repo` scope
3. Click "Set GitHub Token" in the app and paste your token

## Project Structure

```
developer-dashboard/
├── src/                      # React frontend
│   ├── components/
│   │   ├── github/          # GitHub scanner components
│   │   ├── gitlab/          # GitLab components (coming soon)
│   │   ├── youtrack/        # YouTrack components (coming soon)
│   │   ├── notifications/   # Notification components (coming soon)
│   │   └── shared/          # Shared components
│   ├── types/               # TypeScript interfaces
│   ├── services/            # API client wrappers
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── commands/        # Tauri commands
│   │   ├── services/        # Business logic
│   │   └── models/          # Data models
│   └── Cargo.toml
└── package.json
```

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2
- **Backend**: Rust
- **HTTP Client**: reqwest
- **Async Runtime**: tokio
- **Markdown Parsing**: pulldown-cmark

## Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run tauri dev` - Start Tauri development app
- `npm run build` - Build React app for production
- `npm run tauri build` - Build production desktop app

### Adding New Features

1. Define TypeScript interfaces in `src/types/`
2. Create Rust models in `src-tauri/src/models/`
3. Implement Tauri commands in `src-tauri/src/commands/`
4. Create React components in `src/components/`
5. Update the sidebar navigation in `src/components/shared/Sidebar.tsx`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
