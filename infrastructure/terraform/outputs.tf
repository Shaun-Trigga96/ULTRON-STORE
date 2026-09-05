output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "gke_cluster_name" {
  description = "GKE Cluster Name"
  value       = module.gke.cluster_name
}

output "gke_endpoint" {
  description = "GKE Cluster Endpoint"
  value       = module.gke.cluster_endpoint
}

output "cloud_sql_private_ip" {
  description = "Cloud SQL Private IP"
  value       = module.database.private_ip
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL Connection Name"
  value       = module.database.connection_name
}

output "inventory_gsa_email" {
  description = "Google Service Account for Inventory Workload"
  value       = module.security.inventory_service_account_email
}
