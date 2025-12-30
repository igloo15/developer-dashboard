use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub web_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Milestone {
    pub id: i64,
    pub iid: i64,
    pub title: String,
    pub description: Option<String>,
    pub state: String,
    pub due_date: Option<String>,
    pub web_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeStats {
    pub time_estimate: i64,
    pub total_time_spent: i64,
    pub human_time_estimate: Option<String>,
    pub human_total_time_spent: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PipelineStatus {
    pub id: i64,
    pub status: String,
    #[serde(rename = "ref")]
    pub ref_name: String,
    pub sha: String,
    pub web_url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MergeRequest {
    pub id: i64,
    pub iid: i64,
    pub title: String,
    pub description: String,
    pub state: String,
    pub source_branch: String,
    pub target_branch: String,
    pub author: User,
    pub assignees: Vec<User>,
    pub reviewers: Option<Vec<User>>,
    pub upvotes: i32,
    pub downvotes: i32,
    pub pipeline: Option<PipelineStatus>,
    pub has_conflicts: bool,
    pub draft: bool,
    pub labels: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub merged_at: Option<String>,
    pub closed_at: Option<String>,
    pub web_url: String,
    pub project_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabIssue {
    pub id: i64,
    pub iid: i64,
    pub title: String,
    pub description: String,
    pub state: String,
    pub labels: Vec<String>,
    pub assignees: Vec<User>,
    pub author: User,
    pub milestone: Option<Milestone>,
    pub due_date: Option<String>,
    pub weight: Option<i32>,
    pub time_stats: TimeStats,
    pub created_at: String,
    pub updated_at: String,
    pub closed_at: Option<String>,
    pub web_url: String,
    pub project_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Job {
    pub id: i64,
    pub name: String,
    pub status: String,
    pub stage: String,
    pub created_at: String,
    pub started_at: Option<String>,
    pub finished_at: Option<String>,
    pub duration: Option<f64>,
    pub web_url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Pipeline {
    pub id: i64,
    pub iid: i64,
    pub status: String,
    #[serde(rename = "ref")]
    pub ref_name: String,
    pub sha: String,
    pub web_url: String,
    pub created_at: String,
    pub updated_at: String,
    pub started_at: Option<String>,
    pub finished_at: Option<String>,
    pub duration: Option<f64>,
    pub user: Option<User>,
    pub project_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PipelineWithJobs {
    #[serde(flatten)]
    pub pipeline: Pipeline,
    pub jobs: Vec<Job>,
}
