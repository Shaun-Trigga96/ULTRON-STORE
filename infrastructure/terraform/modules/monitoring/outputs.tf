output "cpu_alert_policy_id" {
  description = "Alert policy ID for GKE CPU alerts"
  value       = google_monitoring_alert_policy.gke_high_cpu.id
}

output "cloudsql_disk_alert_policy_id" {
  description = "Alert policy ID for Cloud SQL disk alerts"
  value       = google_monitoring_alert_policy.cloudsql_disk_usage.id
}
