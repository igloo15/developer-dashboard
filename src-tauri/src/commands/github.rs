use crate::models::github::Repository;
use crate::services::github::{extract_repo_links, extract_repo_links_with_categories, GitHubClient};
use tauri::State;
use std::sync::Mutex;
use std::collections::HashMap;

pub struct AppState {
    pub github_token: Mutex<Option<String>>,
}

#[tauri::command]
pub async fn fetch_awesome_list(
    url: String,
    state: State<'_, AppState>,
) -> Result<Vec<(String, String)>, String> {
    // Parse the GitHub URL to extract owner and repo
    let url_parts: Vec<&str> = url
        .trim_end_matches('/')
        .split('/')
        .collect();

    if url_parts.len() < 2 {
        return Err("Invalid GitHub URL".to_string());
    }

    let owner = url_parts[url_parts.len() - 2];
    let repo = url_parts[url_parts.len() - 1];

    // Get the token from state
    let token = state.github_token.lock().unwrap().clone();

    // Create GitHub client
    let client = GitHubClient::new(token);

    // Fetch README
    let readme = client
        .fetch_readme(owner, repo)
        .await
        .map_err(|e| format!("Failed to fetch README: {}", e))?;

    // Extract repository links
    let repos = extract_repo_links(&readme);

    Ok(repos)
}

#[tauri::command]
pub async fn fetch_awesome_list_with_categories(
    url: String,
    state: State<'_, AppState>,
) -> Result<Vec<(String, String, String)>, String> {
    // Parse the GitHub URL to extract owner and repo
    let url_parts: Vec<&str> = url
        .trim_end_matches('/')
        .split('/')
        .collect();

    if url_parts.len() < 2 {
        return Err("Invalid GitHub URL".to_string());
    }

    let owner = url_parts[url_parts.len() - 2];
    let repo = url_parts[url_parts.len() - 1];

    // Get the token from state
    let token = state.github_token.lock().unwrap().clone();

    // Create GitHub client
    let client = GitHubClient::new(token);

    // Fetch README
    let readme = client
        .fetch_readme(owner, repo)
        .await
        .map_err(|e| format!("Failed to fetch README: {}", e))?;

    // Extract repository links with categories
    let repos = extract_repo_links_with_categories(&readme);

    Ok(repos)
}

#[tauri::command]
pub async fn fetch_repo_info(
    owner: String,
    repo: String,
    state: State<'_, AppState>,
) -> Result<Repository, String> {
    // Get the token from state
    let token = state.github_token.lock().unwrap().clone();

    // Create GitHub client
    let client = GitHubClient::new(token);

    // Fetch repository info
    let repository = client
        .fetch_repository(&owner, &repo)
        .await
        .map_err(|e| format!("Failed to fetch repository: {}", e))?;

    Ok(repository)
}

#[tauri::command]
pub async fn fetch_added_dates(
    awesome_list_url: String,
    repo_links: Vec<(String, String)>,
    state: State<'_, AppState>,
) -> Result<HashMap<String, String>, String> {
    // Parse the awesome list URL to extract owner and repo
    let url_parts: Vec<&str> = awesome_list_url
        .trim_end_matches('/')
        .split('/')
        .collect();

    if url_parts.len() < 2 {
        return Err("Invalid GitHub URL".to_string());
    }

    let owner = url_parts[url_parts.len() - 2];
    let repo = url_parts[url_parts.len() - 1];

    // Get the token from state
    let token = state.github_token.lock().unwrap().clone();

    // Create GitHub client
    let client = GitHubClient::new(token);

    // Fetch commit history
    let dates = client
        .fetch_commit_history_for_repos(owner, repo, &repo_links)
        .await
        .map_err(|e| format!("Failed to fetch commit history: {}", e))?;

    Ok(dates)
}

#[tauri::command]
pub async fn set_github_token(
    token: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut state_token = state.github_token.lock().unwrap();
    *state_token = if token.is_empty() {
        None
    } else {
        Some(token)
    };
    Ok(())
}

#[tauri::command]
pub async fn export_repositories(
    repositories: Vec<Repository>,
    categories: HashMap<String, String>,
    format: String,
    path: String,
) -> Result<(), String> {
    use std::fs;

    let content = match format.as_str() {
        "json" => serde_json::to_string_pretty(&repositories)
            .map_err(|e| format!("Failed to serialize JSON: {}", e))?,
        "csv" => {
            let mut csv = String::from("Name,Full Name,Description,Category,Stars,Forks,Language,License,Updated At,Added to List,URL\n");
            for repo in repositories {
                let category = categories.get(&repo.full_name).map(|s| s.as_str()).unwrap_or("");
                csv.push_str(&format!(
                    "\"{}\",\"{}\",\"{}\",\"{}\",{},{},\"{}\",\"{}\",\"{}\",\"{}\",\"{}\"\n",
                    repo.name,
                    repo.full_name,
                    repo.description.as_deref().unwrap_or(""),
                    category,
                    repo.stargazers_count,
                    repo.forks_count,
                    repo.language.as_deref().unwrap_or(""),
                    repo.license.as_ref().map(|l| l.name.as_str()).unwrap_or(""),
                    repo.updated_at,
                    repo.added_to_list_at.as_deref().unwrap_or(""),
                    repo.html_url
                ));
            }
            csv
        }
        _ => return Err("Unsupported format".to_string()),
    };

    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}
