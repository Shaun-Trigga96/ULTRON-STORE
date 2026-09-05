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
  description = "VPC network ID"
  type        = string
}

variable "subnet_id" {
  description = "Private Subnetwork ID for nodes"
  type        = string
}

variable "machine_type" {
  description = "Node VM machine type"
  type        = string
  default     = "e2-standard-4"
}

variable "min_nodes" {
  description = "Minimum nodes per zone"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum nodes per zone"
  type        = number
  default     = 10
}
