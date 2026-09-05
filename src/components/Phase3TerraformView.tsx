import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Database,
  Shield,
  Activity,
  Check,
  Copy,
  Terminal,
  FileCode,
  Layers,
  ArrowRight,
  Lock,
  Network
} from 'lucide-react';

export const Phase3TerraformView: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'networking' | 'gke' | 'database' | 'security' | 'monitoring' | 'root'>('networking');
  const [copied, setCopied] = useState(false);

  const MODULE_CODE: Record<string, { filename: string; description: string; code: string }> = {
    networking: {
      filename: 'infrastructure/terraform/modules/networking/main.tf',
      description: 'VPC isolation, private GKE subnets with secondary Pod/Service CIDRs, Cloud NAT, and Private Services Access for Cloud SQL.',
      code: `# ============================================================================
# NETWORKING MODULE — GCP TERRAFORM (PROJECT-1)
# Custom VPC, Private Subnet with Secondary Pod/Service CIDRs, Cloud NAT
# ============================================================================

resource "google_compute_network" "vpc" {
  name                    = "ultron-\${var.environment}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  project                 = var.project_id
}

# Public Subnet (Hosts External Application Load Balancers)
resource "google_compute_subnetwork" "public_subnet" {
  name                     = "ultron-\${var.environment}-public-subnet"
  ip_cidr_range            = "10.0.1.0/24"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true
  project                  = var.project_id

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Private Subnet (Hosts Private GKE Nodes & Cloud SQL Peering)
resource "google_compute_subnetwork" "private_subnet" {
  name                     = "ultron-\${var.environment}-private-subnet"
  ip_cidr_range            = "10.0.2.0/24"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true
  project                  = var.project_id

  # Secondary IP ranges for VPC-native GKE IP aliasing
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.48.0.0/14"
  }

  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.52.0.0/20"
  }
}

# Cloud Router & Cloud NAT for Secure Private Node Egress
resource "google_compute_router" "nat_router" {
  name    = "ultron-\${var.environment}-nat-router"
  region  = var.region
  network = google_compute_network.vpc.id
  project = var.project_id
}

resource "google_compute_router_nat" "nat_gateway" {
  name                               = "ultron-\${var.environment}-cloud-nat"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  project                            = var.project_id
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# Private Services Access (Peering IP range for Cloud SQL PostgreSQL)
resource "google_compute_global_address" "private_service_access_ip" {
  name          = "ultron-\${var.environment}-psa-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_access_ip.name]
}`
    },
    gke: {
      filename: 'infrastructure/terraform/modules/gke/main.tf',
      description: 'Zero-trust Private GKE Cluster with Datapath V2 (Cilium), Workload Identity, and Autoscaling Node Pools.',
      code: `# ============================================================================
# GKE MODULE — GCP TERRAFORM (PROJECT-1)
# Production-Ready Private GKE Cluster with Workload Identity & Autoscaling
# ============================================================================

resource "google_service_account" "gke_nodes" {
  account_id   = "ultron-\${var.environment}-gke-nodes-sa"
  display_name = "ULTRON \${title(var.environment)} GKE Node Service Account"
  project      = var.project_id
}

resource "google_container_cluster" "primary" {
  name     = "ultron-\${var.environment}-gke-cluster"
  location = var.region
  project  = var.project_id

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = var.vpc_id
  subnetwork = var.subnet_id

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {
    cluster_secondary_range_name  = "gke-pods"
    services_secondary_range_name = "gke-services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  datapath_provider = "ADVANCED_DATAPATH"

  workload_identity_config {
    workload_pool = "\${var.project_id}.svc.id.goog"
  }

  addons_config {
    http_load_balancing { disabled = false }
    horizontal_pod_autoscaling { disabled = false }
    gcs_fuse_csi_driver_config { enabled = true }
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "ultron-primary-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  project    = var.project_id

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  node_config {
    machine_type = var.machine_type
    service_account = google_service_account.gke_nodes.email
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    tags = ["gke-node", "\${var.environment}-node"]
  }
}`
    },
    database: {
      filename: 'infrastructure/terraform/modules/database/main.tf',
      description: 'Private-IP Cloud SQL PostgreSQL 15 with automated point-in-time recovery and Secret Manager integration.',
      code: `# ============================================================================
# CLOUD SQL DATABASE MODULE — GCP TERRAFORM (PROJECT-1)
# Highly Available Private PostgreSQL 15 with Secret Manager Integration
# ============================================================================

resource "google_sql_database_instance" "postgres" {
  name             = "ultron-\${var.environment}-psql-\${random_id.db_suffix.hex}"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id
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
  }
}

resource "google_sql_database" "inventory_db" {
  name     = "ultron_inventory"
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
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
}`
    },
    security: {
      filename: 'infrastructure/terraform/modules/security/main.tf',
      description: 'GKE Workload Identity keyless authentication mapping Kubernetes Service Accounts to GCP IAM.',
      code: `# ============================================================================
# SECURITY & WORKLOAD IDENTITY MODULE — GCP TERRAFORM (PROJECT-1)
# ============================================================================

resource "google_service_account" "inventory_service" {
  account_id   = "ultron-\${var.environment}-inventory-sa"
  display_name = "ULTRON Inventory Microservice Workload GSA"
  project      = var.project_id
}

# Workload Identity: Map KSA to GSA without static service account keys
resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.inventory_service.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:\${var.project_id}.svc.id.goog[ultron-\${var.environment}/\${var.k8s_service_account_name}]"
}

resource "google_project_iam_member" "inventory_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:\${google_service_account.inventory_service.email}"
}

resource "google_project_iam_member" "inventory_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:\${google_service_account.inventory_service.email}"
}`
    },
    monitoring: {
      filename: 'infrastructure/terraform/modules/monitoring/main.tf',
      description: 'Cloud Monitoring Alert Policies for GKE Pod CPU saturation and Cloud SQL storage thresholds.',
      code: `# ============================================================================
# MONITORING & ALERTING MODULE — GCP TERRAFORM (PROJECT-1)
# ============================================================================

resource "google_monitoring_alert_policy" "gke_high_cpu" {
  display_name = "ULTRON [\${upper(var.environment)}] - GKE Pod High CPU (>85%)"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "GKE container CPU utilization exceeds 85%"
    condition_threshold {
      filter          = "metric.type=\"kubernetes.io/container/cpu/limit_utilization\" AND resource.type=\"k8s_container\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }
}

resource "google_monitoring_alert_policy" "cloudsql_disk_usage" {
  display_name = "ULTRON [\${upper(var.environment)}] - Cloud SQL Disk Space (>80%)"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL storage utilization exceeds 80%"
    condition_threshold {
      filter          = "metric.type=\"cloudsql.googleapis.com/database/disk/utilization\" AND resource.type=\"cloudsql_database\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.80
    }
  }
}`
    },
    root: {
      filename: 'infrastructure/terraform/main.tf',
      description: 'Root module orchestrating networking, GKE, Cloud SQL, security, and observability.',
      code: `# ============================================================================
# ULTRON STORE ROOT TERRAFORM ORCHESTRATION (PROJECT-1)
# ============================================================================

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

module "networking" {
  source      = "./modules/networking"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

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

module "security" {
  source                   = "./modules/security"
  project_id               = var.project_id
  environment              = var.environment
  k8s_service_account_name = "inventory-service-ksa"
}

module "monitoring" {
  source      = "./modules/monitoring"
  project_id  = var.project_id
  environment = var.environment
}`
    }
  };

  const activeModule = MODULE_CODE[selectedModule];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0d1117] rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              PHASE 03: INFRASTRUCTURE AS CODE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PROJECT-1 COMPLIANT
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cyan-400" />
            Terraform GCP Platform Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Fully declarative GCP infrastructure modules implementing VPC network isolation, private VPC-native GKE with Datapath V2, Cloud SQL PostgreSQL 15 over Private Services Access, and keyless Workload Identity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Module' : 'Copy Active HCL'}
          </button>
        </div>
      </div>

      {/* Module Topology Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'networking', label: '1. Networking', icon: Network, desc: 'VPC & Cloud NAT' },
          { id: 'gke', label: '2. Private GKE', icon: Server, desc: 'Autoscaling Nodes' },
          { id: 'database', label: '3. Cloud SQL', icon: Database, desc: 'PostgreSQL 15 (HA)' },
          { id: 'security', label: '4. Security', icon: Lock, desc: 'Workload Identity' },
          { id: 'monitoring', label: '5. Monitoring', icon: Activity, desc: 'Alert Policies' },
          { id: 'root', label: '6. Root Main.tf', icon: Layers, desc: 'Wiring & State' }
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = selectedModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m.id as any)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-[#0d1117] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="text-xs font-bold text-slate-200">{m.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Code Inspector */}
      <div className="bg-[#010409] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-cyan-300 font-bold">{activeModule.filename}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
            {activeModule.description}
          </span>
        </div>

        <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300 max-h-[520px]">
          <pre className="selection:bg-cyan-900 selection:text-cyan-100">
            {activeModule.code}
          </pre>
        </div>
      </div>

      {/* Deployment CLI Execution Guide */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Infrastructure Deployment Sequence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#010409] rounded-lg border border-slate-800/80">
            <div className="text-cyan-400 font-bold mb-1">Step 1: Initialize Backend</div>
            <code className="text-slate-300 text-[11px] block bg-slate-900/50 p-2 rounded">
              cd infrastructure/terraform<br />
              terraform init
            </code>
          </div>
          <div className="p-3 bg-[#010409] rounded-lg border border-slate-800/80">
            <div className="text-cyan-400 font-bold mb-1">Step 2: Dry Run Plan</div>
            <code className="text-slate-300 text-[11px] block bg-slate-900/50 p-2 rounded">
              terraform plan \<br />
              &nbsp;&nbsp;-var-file="environments/dev.tfvars"
            </code>
          </div>
          <div className="p-3 bg-[#010409] rounded-lg border border-slate-800/80">
            <div className="text-cyan-400 font-bold mb-1">Step 3: Apply & Provision</div>
            <code className="text-slate-300 text-[11px] block bg-slate-900/50 p-2 rounded">
              terraform apply \<br />
              &nbsp;&nbsp;-var-file="environments/dev.tfvars"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
