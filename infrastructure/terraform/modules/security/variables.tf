variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment tier: dev, staging, prod"
  type        = string
}

variable "k8s_service_account_name" {
  description = "Name of the Kubernetes Service Account (KSA)"
  type        = string
  default     = "inventory-service-ksa"
}
