# ============================================================================
# CLOUD SQL DATABASE MODULE — GCP TERRAFORM (PROJECT-1)
# Highly Available Private PostgreSQL 15 with Secret Manager Integration
# ============================================================================

resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "random_id" "db_suffix" {
  byte_length = 4
}

# Cloud SQL PostgreSQL 15 Instance (Private IP Only)
resource "google_sql_database_instance" "postgres" {
  name             = "ultron-${var.environment}-psql-${random_id.db_suffix.hex}"
  database_version = var.database_version
  region           = var.region
  project          = var.project_id

  # Prevent accidental destruction in production
  deletion_protection = var.environment == "prod" ? true : false

  settings {
    tier              = var.tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = 50
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.vpc_id
      require_ssl                                   = true
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "01:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }

    user_labels = {
      environment = var.environment
      managed_by  = "terraform"
      service     = "inventory-db"
    }
  }
}

# Application Database
resource "google_sql_database" "inventory_db" {
  name     = "ultron_inventory"
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

# Application Database User
resource "google_sql_user" "app_user" {
  name     = "ultron_app"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
  project  = var.project_id
}

# Store database credentials securely in Google Secret Manager
resource "google_secret_manager_secret" "db_credentials" {
  secret_id = "ultron-${var.environment}-db-credentials"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_credentials_version" {
  secret = google_secret_manager_secret.db_credentials.id
  secret_data = jsonencode({
    host     = google_sql_database_instance.postgres.private_ip_address
    port     = 5432
    database = google_sql_database.inventory_db.name
    username = google_sql_user.app_user.name
    password = random_password.db_password.result
  })
}
