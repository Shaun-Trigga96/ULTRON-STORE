output "vpc_id" {
  description = "VPC Network ID"
  value       = google_compute_network.vpc.id
}

output "vpc_name" {
  description = "VPC Network Name"
  value       = google_compute_network.vpc.name
}

output "public_subnet_id" {
  description = "Public Subnet ID"
  value       = google_compute_subnetwork.public_subnet.id
}

output "private_subnet_id" {
  description = "Private Subnet ID"
  value       = google_compute_subnetwork.private_subnet.id
}

output "pods_secondary_range_name" {
  description = "Secondary IP Range name for GKE Pods"
  value       = "gke-pods"
}

output "services_secondary_range_name" {
  description = "Secondary IP Range name for GKE Services"
  value       = "gke-services"
}

output "network_peering_id" {
  description = "Private Services Peering Connection ID for Cloud SQL"
  value       = google_service_networking_connection.private_vpc_connection.id
}
