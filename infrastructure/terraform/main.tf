terraform {
  required_version = ">= 1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "ultron-store-tf-state"
    prefix = "env/terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Module: Networking (VPC, Subnets, Cloud NAT, Cloud Armor)
module "networking" {
  source      = "./modules/networking"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

# Module: GKE Cluster (Autopilot or Standard with Autoscaling Node Pools)
module "gke" {
  source       = "./modules/gke"
  project_id   = var.project_id
  region       = var.region
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
  subnet_id    = module.networking.private_subnet_id
  min_nodes    = var.min_nodes
  max_nodes    = var.max_nodes
  machine_type = var.node_machine_type
}

# Module: Cloud SQL (Private IP PostgreSQL 15)
module "database" {
  source             = "./modules/database"
  project_id         = var.project_id
  region             = var.region
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  database_version   = "POSTGRES_15"
  tier               = var.db_tier
  db_password_secret = var.db_password_secret
}

# Module: Security & Workload Identity
module "security" {
  source                   = "./modules/security"
  project_id               = var.project_id
  environment              = var.environment
  k8s_service_account_name = "inventory-service-ksa"
}

# Module: Monitoring & Alert Policies
module "monitoring" {
  source      = "./modules/monitoring"
  project_id  = var.project_id
  environment = var.environment
}
