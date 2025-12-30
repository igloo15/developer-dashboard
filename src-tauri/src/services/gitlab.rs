use crate::models::gitlab::{GitLabIssue, Job, MergeRequest, Pipeline};
use anyhow::{Context, Result};
use reqwest::Client;
use serde_json::Value;

pub struct GitLabClient {
    client: Client,
    base_url: String,
    token: String,
}

impl GitLabClient {
    pub fn new(base_url: String, token: String) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.trim_end_matches('/').to_string(),
            token,
        }
    }

    /// Test the connection to GitLab
    pub async fn test_connection(&self) -> Result<()> {
        let url = format!("{}/api/v4/user", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to connect to GitLab")?;

        if !response.status().is_success() {
            anyhow::bail!("GitLab API returned error: {}", response.status());
        }

        Ok(())
    }

    /// Fetch merge requests across all projects or filtered by state
    pub async fn fetch_merge_requests(&self, state: Option<&str>) -> Result<Vec<MergeRequest>> {
        let mut url = format!("{}/api/v4/merge_requests", self.base_url);

        let mut params = vec!["scope=all".to_string()];
        if let Some(state_val) = state {
            params.push(format!("state={}", state_val));
        }

        if !params.is_empty() {
            url.push_str("?");
            url.push_str(&params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch merge requests")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to fetch merge requests: {}", response.status());
        }

        let mut merge_requests: Vec<MergeRequest> = response
            .json()
            .await
            .context("Failed to parse merge requests")?;

        // Normalize reviewers field
        for mr in &mut merge_requests {
            if mr.reviewers.is_none() {
                mr.reviewers = Some(Vec::new());
            }
        }

        Ok(merge_requests)
    }

    /// Fetch issues across all projects or filtered by state
    pub async fn fetch_issues(&self, state: Option<&str>) -> Result<Vec<GitLabIssue>> {
        let mut url = format!("{}/api/v4/issues", self.base_url);

        let mut params = vec!["scope=all".to_string()];
        if let Some(state_val) = state {
            params.push(format!("state={}", state_val));
        }

        if !params.is_empty() {
            url.push_str("?");
            url.push_str(&params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch issues")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to fetch issues: {}", response.status());
        }

        let issues: Vec<GitLabIssue> = response
            .json()
            .await
            .context("Failed to parse issues")?;

        Ok(issues)
    }

    /// Fetch pipelines for a specific project
    pub async fn fetch_pipelines(&self, project_id: i64) -> Result<Vec<Pipeline>> {
        let url = format!("{}/api/v4/projects/{}/pipelines", self.base_url, project_id);

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch pipelines")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to fetch pipelines: {}", response.status());
        }

        let pipelines: Vec<Pipeline> = response
            .json()
            .await
            .context("Failed to parse pipelines")?;

        Ok(pipelines)
    }

    /// Fetch all pipelines across all accessible projects
    pub async fn fetch_all_pipelines(&self) -> Result<Vec<Pipeline>> {
        // First get all projects
        let projects_url = format!("{}/api/v4/projects?membership=true&per_page=100", self.base_url);

        let response = self
            .client
            .get(&projects_url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch projects")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to fetch projects: {}", response.status());
        }

        let projects: Vec<Value> = response
            .json()
            .await
            .context("Failed to parse projects")?;

        let mut all_pipelines = Vec::new();

        // Fetch latest pipeline for each project
        for project in projects {
            if let Some(project_id) = project["id"].as_i64() {
                match self.fetch_latest_pipeline(project_id).await {
                    Ok(Some(pipeline)) => all_pipelines.push(pipeline),
                    Ok(None) => continue,
                    Err(e) => {
                        eprintln!("Failed to fetch pipeline for project {}: {}", project_id, e);
                        continue;
                    }
                }
            }
        }

        // Sort by updated_at descending
        all_pipelines.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));

        Ok(all_pipelines)
    }

    /// Fetch the latest pipeline for a project
    async fn fetch_latest_pipeline(&self, project_id: i64) -> Result<Option<Pipeline>> {
        let url = format!(
            "{}/api/v4/projects/{}/pipelines?per_page=1",
            self.base_url, project_id
        );

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch pipeline")?;

        if !response.status().is_success() {
            return Ok(None);
        }

        let mut pipelines: Vec<Pipeline> = response
            .json()
            .await
            .context("Failed to parse pipeline")?;

        Ok(pipelines.pop())
    }

    /// Fetch jobs for a specific pipeline
    pub async fn fetch_pipeline_jobs(&self, project_id: i64, pipeline_id: i64) -> Result<Vec<Job>> {
        let url = format!(
            "{}/api/v4/projects/{}/pipelines/{}/jobs",
            self.base_url, project_id, pipeline_id
        );

        let response = self
            .client
            .get(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to fetch pipeline jobs")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to fetch pipeline jobs: {}", response.status());
        }

        let jobs: Vec<Job> = response
            .json()
            .await
            .context("Failed to parse jobs")?;

        Ok(jobs)
    }

    /// Approve a merge request
    pub async fn approve_merge_request(&self, project_id: i64, mr_iid: i64) -> Result<()> {
        let url = format!(
            "{}/api/v4/projects/{}/merge_requests/{}/approve",
            self.base_url, project_id, mr_iid
        );

        let response = self
            .client
            .post(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to approve merge request")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to approve merge request: {}", response.status());
        }

        Ok(())
    }

    /// Update an issue
    pub async fn update_issue(
        &self,
        project_id: i64,
        issue_iid: i64,
        title: Option<&str>,
        description: Option<&str>,
        state_event: Option<&str>,
        labels: Option<Vec<&str>>,
    ) -> Result<GitLabIssue> {
        let url = format!(
            "{}/api/v4/projects/{}/issues/{}",
            self.base_url, project_id, issue_iid
        );

        let mut body = serde_json::Map::new();
        if let Some(t) = title {
            body.insert("title".to_string(), Value::String(t.to_string()));
        }
        if let Some(d) = description {
            body.insert("description".to_string(), Value::String(d.to_string()));
        }
        if let Some(se) = state_event {
            body.insert("state_event".to_string(), Value::String(se.to_string()));
        }
        if let Some(l) = labels {
            body.insert(
                "labels".to_string(),
                Value::String(l.join(",")),
            );
        }

        let response = self
            .client
            .put(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .json(&body)
            .send()
            .await
            .context("Failed to update issue")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to update issue: {}", response.status());
        }

        let issue: GitLabIssue = response
            .json()
            .await
            .context("Failed to parse updated issue")?;

        Ok(issue)
    }

    /// Retry a pipeline
    pub async fn retry_pipeline(&self, project_id: i64, pipeline_id: i64) -> Result<()> {
        let url = format!(
            "{}/api/v4/projects/{}/pipelines/{}/retry",
            self.base_url, project_id, pipeline_id
        );

        let response = self
            .client
            .post(&url)
            .header("PRIVATE-TOKEN", &self.token)
            .send()
            .await
            .context("Failed to retry pipeline")?;

        if !response.status().is_success() {
            anyhow::bail!("Failed to retry pipeline: {}", response.status());
        }

        Ok(())
    }
}
