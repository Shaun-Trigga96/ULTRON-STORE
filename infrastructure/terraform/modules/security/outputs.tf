output "inventory_service_account_email" {
  description = "GSA email address for inventory service"
  value       = google_service_account.inventory_service.email
}

output "workload_identity_pool" {
  description = "GCP Workload Identity pool"
  value       = "${var.project_id}.svc.id.goog"
}

output "redis_secret_id" {
  description = "Redis secret ID in Secret Manager"
  value       = google_secret_manager_secret.redis_credentials.id
}
