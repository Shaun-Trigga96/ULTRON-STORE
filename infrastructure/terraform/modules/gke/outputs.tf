output "cluster_id" {
  description = "GKE Cluster resource ID"
  value       = google_container_cluster.primary.id
}

output "cluster_name" {
  description = "GKE Cluster name"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "GKE Control plane endpoint IP"
  value       = google_container_cluster.primary.endpoint
}

output "ca_certificate" {
  description = "GKE Cluster CA Certificate (base64 encoded)"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "node_service_account" {
  description = "Service account attached to GKE nodes"
  value       = google_service_account.gke_nodes.email
}
