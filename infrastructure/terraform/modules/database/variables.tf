variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "environment" {
  description = "Environment tier: dev, staging, prod"
  type        = string
}

variable "vpc_id" {
  description = "VPC network ID to peer Cloud SQL private IP"
  type        = string
}

variable "database_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "POSTGRES_15"
}

variable "tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-custom-2-7680"
}

variable "db_password_secret" {
  description = "Secret name identifier"
  type        = string
  default     = "ultron-db-password"
}
