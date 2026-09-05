output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.postgres.name
}

output "private_ip" {
  description = "Cloud SQL Private IP address inside VPC"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "database_name" {
  description = "Primary database name"
  value       = google_sql_database.inventory_db.name
}

output "db_user" {
  description = "Application database username"
  value       = google_sql_user.app_user.name
}

output "connection_name" {
  description = "Cloud SQL connection string for Cloud SQL Auth Proxy"
  value       = google_sql_database_instance.postgres.connection_name
}

output "secret_manager_secret_id" {
  description = "Secret Manager secret ID containing connection payload"
  value       = google_secret_manager_secret.db_credentials.id
}
