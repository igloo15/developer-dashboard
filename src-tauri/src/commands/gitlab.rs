use crate::models::gitlab::{GitLabIssue, Job, MergeRequest, Pipeline};
use crate::services::gitlab::GitLabClient;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

pub struct GitLabState {
    pub gitlab_url: Mutex<Option<String>>,
    pub gitlab_token: Mutex<Option<String>>,
}

#[tauri::command]
pub async fn gitlab_test_connection(
    url: String,
    token: String,
) -> Result<(), String> {
    let client = GitLabClient::new(url, token);
    client
        .test_connection()
        .await
        .map_err(|e| format!("Connection test failed: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn gitlab_set_credentials(
    url: String,
    token: String,
    state: State<'_, GitLabState>,
) -> Result<(), String> {
    // Test connection first
    gitlab_test_connection(url.clone(), token.clone()).await?;

    // Store credentials
    let mut gitlab_url = state.gitlab_url.lock().unwrap();
    let mut gitlab_token = state.gitlab_token.lock().unwrap();

    *gitlab_url = if url.is_empty() { None } else { Some(url) };
    *gitlab_token = if token.is_empty() { None } else { Some(token) };

    Ok(())
}

#[tauri::command]
pub async fn gitlab_fetch_merge_requests(
    state_filter: Option<String>,
    state: State<'_, GitLabState>,
) -> Result<Vec<MergeRequest>, String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    let mrs = client
        .fetch_merge_requests(state_filter.as_deref())
        .await
        .map_err(|e| format!("Failed to fetch merge requests: {}", e))?;

    Ok(mrs)
}

#[tauri::command]
pub async fn gitlab_fetch_issues(
    state_filter: Option<String>,
    state: State<'_, GitLabState>,
) -> Result<Vec<GitLabIssue>, String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    let issues = client
        .fetch_issues(state_filter.as_deref())
        .await
        .map_err(|e| format!("Failed to fetch issues: {}", e))?;

    Ok(issues)
}

#[tauri::command]
pub async fn gitlab_fetch_pipelines(
    state: State<'_, GitLabState>,
) -> Result<Vec<Pipeline>, String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    let pipelines = client
        .fetch_all_pipelines()
        .await
        .map_err(|e| format!("Failed to fetch pipelines: {}", e))?;

    Ok(pipelines)
}

#[tauri::command]
pub async fn gitlab_fetch_pipeline_jobs(
    project_id: i64,
    pipeline_id: i64,
    state: State<'_, GitLabState>,
) -> Result<Vec<Job>, String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    let jobs = client
        .fetch_pipeline_jobs(project_id, pipeline_id)
        .await
        .map_err(|e| format!("Failed to fetch pipeline jobs: {}", e))?;

    Ok(jobs)
}

#[tauri::command]
pub async fn gitlab_approve_mr(
    project_id: i64,
    mr_iid: i64,
    state: State<'_, GitLabState>,
) -> Result<(), String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    client
        .approve_merge_request(project_id, mr_iid)
        .await
        .map_err(|e| format!("Failed to approve merge request: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn gitlab_update_issue(
    project_id: i64,
    issue_iid: i64,
    updates: HashMap<String, String>,
    state: State<'_, GitLabState>,
) -> Result<GitLabIssue, String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);

    let title = updates.get("title").map(|s| s.as_str());
    let description = updates.get("description").map(|s| s.as_str());
    let state_event = updates.get("state_event").map(|s| s.as_str());
    let labels = updates.get("labels").map(|s| {
        s.split(',')
            .map(|l| l.trim())
            .filter(|l| !l.is_empty())
            .collect::<Vec<&str>>()
    });

    let issue = client
        .update_issue(project_id, issue_iid, title, description, state_event, labels)
        .await
        .map_err(|e| format!("Failed to update issue: {}", e))?;

    Ok(issue)
}

#[tauri::command]
pub async fn gitlab_retry_pipeline(
    project_id: i64,
    pipeline_id: i64,
    state: State<'_, GitLabState>,
) -> Result<(), String> {
    let url = state
        .gitlab_url
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab URL not set")?;
    let token = state
        .gitlab_token
        .lock()
        .unwrap()
        .clone()
        .ok_or("GitLab token not set")?;

    let client = GitLabClient::new(url, token);
    client
        .retry_pipeline(project_id, pipeline_id)
        .await
        .map_err(|e| format!("Failed to retry pipeline: {}", e))?;

    Ok(())
}
