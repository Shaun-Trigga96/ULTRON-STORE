# ============================================================================
# SECURITY & WORKLOAD IDENTITY MODULE — GCP TERRAFORM (PROJECT-1)
# Workload Identity Bindings, App Service Accounts, Secret Management
# ============================================================================

# Microservice Dedicated Google Service Account (GSA)
resource "google_service_account" "inventory_service" {
  account_id   = "ultron-${var.environment}-inventory-sa"
  display_name = "ULTRON Inventory Microservice Workload GSA"
  project      = var.project_id
}

# Grant Cloud SQL Client role to Service Account
resource "google_project_iam_member" "inventory_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.inventory_service.email}"
}

# Grant Secret Manager Secret Accessor to Service Account
resource "google_project_iam_member" "inventory_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.inventory_service.email}"
}

# Workload Identity: Allow Kubernetes Service Account (KSA) to impersonate GSA
resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.inventory_service.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[ultron-${var.environment}/${var.k8s_service_account_name}]"
}

# Redis Redlock secret in Secret Manager
resource "google_secret_manager_secret" "redis_credentials" {
  secret_id = "ultron-${var.environment}-redis-credentials"
  project   = var.project_id

  replication {
    auto {}
  }
}
