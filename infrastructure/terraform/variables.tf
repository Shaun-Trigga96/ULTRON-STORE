variable "project_id" {
  description = "GCP Project ID for ULTRON Store"
  type        = string
}

variable "region" {
  description = "Target GCP Region for infrastructure"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment tier: dev, staging, or prod"
  type        = string
}

variable "node_machine_type" {
  description = "GKE Node Machine Type"
  type        = string
  default     = "e2-standard-4"
}

variable "min_nodes" {
  description = "Minimum nodes per zone in the cluster"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum nodes per zone for traffic spikes"
  type        = number
  default     = 10
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-7680"
}

variable "db_password_secret" {
  description = "Secret Manager secret ID containing database root password"
  type        = string
  default     = "ultron-db-password"
}
