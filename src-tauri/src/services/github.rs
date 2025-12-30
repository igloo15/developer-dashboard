use crate::models::github::{Repository, License};
use anyhow::{Context, Result};
use regex::Regex;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct GitHubRepo {
    id: u64,
    name: String,
    full_name: String,
    description: Option<String>,
    html_url: String,
    homepage: Option<String>,
    stargazers_count: u32,
    forks_count: u32,
    open_issues_count: u32,
    language: Option<String>,
    license: Option<GitHubLicense>,
    topics: Vec<String>,
    updated_at: String,
    created_at: String,
}

#[derive(Debug, Deserialize)]
struct GitHubLicense {
    key: String,
    name: String,
    spdx_id: Option<String>,
    url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GitHubCommit {
    sha: String,
    commit: CommitData,
}

#[derive(Debug, Deserialize)]
struct CommitData {
    author: CommitAuthor,
    message: String,
}

#[derive(Debug, Deserialize)]
struct CommitAuthor {
    date: String,
}

pub struct GitHubClient {
    client: reqwest::Client,
    token: Option<String>,
}

impl GitHubClient {
    pub fn new(token: Option<String>) -> Self {
        Self {
            client: reqwest::Client::builder()
                .user_agent("developer-dashboard/0.1.0")
                .build()
                .unwrap(),
            token,
        }
    }

    pub async fn fetch_readme(&self, owner: &str, repo: &str) -> Result<String> {
        let url = format!("https://api.github.com/repos/{}/{}/readme", owner, repo);

        let mut request = self.client.get(&url);
        if let Some(token) = &self.token {
            request = request.header("Authorization", format!("Bearer {}", token));
        }
        request = request.header("Accept", "application/vnd.github.v3.raw");

        let response = request.send().await.context("Failed to fetch README")?;

        if !response.status().is_success() {
            anyhow::bail!("GitHub API error: {}", response.status());
        }

        let content = response.text().await.context("Failed to read README content")?;
        Ok(content)
    }

    pub async fn fetch_repository(&self, owner: &str, repo: &str) -> Result<Repository> {
        let url = format!("https://api.github.com/repos/{}/{}", owner, repo);

        let mut request = self.client.get(&url);
        if let Some(token) = &self.token {
            request = request.header("Authorization", format!("Bearer {}", token));
        }

        let response = request.send().await.context("Failed to fetch repository")?;

        if !response.status().is_success() {
            anyhow::bail!("GitHub API error: {}", response.status());
        }

        let github_repo: GitHubRepo = response.json().await.context("Failed to parse repository data")?;

        Ok(Repository {
            id: github_repo.id,
            name: github_repo.name,
            full_name: github_repo.full_name,
            description: github_repo.description,
            html_url: github_repo.html_url,
            homepage: github_repo.homepage,
            stargazers_count: github_repo.stargazers_count,
            forks_count: github_repo.forks_count,
            open_issues_count: github_repo.open_issues_count,
            language: github_repo.language,
            license: github_repo.license.map(|l| License {
                key: l.key,
                name: l.name,
                spdx_id: l.spdx_id,
                url: l.url,
            }),
            topics: github_repo.topics,
            updated_at: github_repo.updated_at,
            created_at: github_repo.created_at,
            added_to_list_at: None,
        })
    }

    pub async fn fetch_commit_history_for_repos(
        &self,
        owner: &str,
        repo: &str,
        repo_urls: &[(String, String)],
    ) -> Result<HashMap<String, String>> {
        let mut dates = HashMap::new();

        // Fetch commits for README.md ONCE and reuse for all repositories
        let url = format!(
            "https://api.github.com/repos/{}/{}/commits?path=README.md&per_page=100",
            owner, repo
        );

        let mut request = self.client.get(&url);
        if let Some(token) = &self.token {
            request = request.header("Authorization", format!("Bearer {}", token));
        }

        let response = request.send().await?;

        if response.status().as_u16() == 403 {
            anyhow::bail!("Rate limit exceeded. Please add a GitHub token or wait before retrying.");
        }

        if !response.status().is_success() {
            // If we can't fetch commits, just return empty - dates are optional
            return Ok(dates);
        }

        let commits: Vec<GitHubCommit> = response.json().await.context("Failed to parse commits")?;

        // For each repository, search through commits to find when it was added
        for (repo_owner, repo_name) in repo_urls {
            let search_string = format!("{}/{}", repo_owner, repo_name);

            // Search from oldest to newest (reverse order) to find first mention
            for commit in commits.iter().rev() {
                let commit_msg = commit.commit.message.to_lowercase();
                let search_lower = search_string.to_lowercase();

                // Check if this commit mentions the repository
                if commit_msg.contains(&search_lower)
                    || (commit_msg.contains("add") && commit_msg.contains(&repo_name.to_lowercase())) {
                    let key = format!("{}/{}", repo_owner, repo_name);
                    dates.insert(key, commit.commit.author.date.clone());
                    break;
                }
            }
        }

        Ok(dates)
    }
}

pub fn extract_repo_links(markdown: &str) -> Vec<(String, String)> {
    extract_repo_links_with_categories(markdown)
        .into_iter()
        .map(|(owner, repo, _)| (owner, repo))
        .collect()
}

pub fn extract_repo_links_with_categories(markdown: &str) -> Vec<(String, String, String)> {
    let mut repos = Vec::new();
    let mut current_category = String::from("Uncategorized");

    // Match GitHub repository URLs in markdown links
    let link_pattern = Regex::new(r"https?://github\.com/([^/\s]+)/([^/\s)#]+)").unwrap();
    // Match markdown headings (## or ###)
    let heading_pattern = Regex::new(r"^#{2,3}\s+(.+)$").unwrap();

    for line in markdown.lines() {
        // Check if this line is a heading
        if let Some(cap) = heading_pattern.captures(line) {
            current_category = cap.get(1).unwrap().as_str().trim().to_string();
        }

        // Extract repository links from this line
        for cap in link_pattern.captures_iter(line) {
            let owner = cap.get(1).unwrap().as_str().to_string();
            let repo = cap.get(2).unwrap().as_str().to_string();

            // Filter out non-repository links
            if owner != "sponsors" && !repo.contains("?") && !repo.contains("&") {
                repos.push((owner, repo, current_category.clone()));
            }
        }
    }

    // Remove duplicates while preserving order (keep first occurrence with its category)
    let mut seen = std::collections::HashSet::new();
    repos.retain(|(owner, repo, _)| {
        let key = format!("{}/{}", owner, repo);
        seen.insert(key)
    });

    repos
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_repo_links() {
        let markdown = r#"
# Awesome List

- [Project 1](https://github.com/user1/repo1) - Description
- [Project 2](https://github.com/user2/repo2)

https://github.com/user3/repo3

## Section
- https://github.com/user1/repo1 (duplicate)
        "#;

        let repos = extract_repo_links(markdown);
        assert_eq!(repos.len(), 3);
        assert_eq!(repos[0], ("user1".to_string(), "repo1".to_string()));
        assert_eq!(repos[1], ("user2".to_string(), "repo2".to_string()));
        assert_eq!(repos[2], ("user3".to_string(), "repo3".to_string()));
    }
}
