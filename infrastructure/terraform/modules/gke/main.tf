# ============================================================================
# GKE MODULE — GCP TERRAFORM (PROJECT-1)
# Production-Ready Private GKE Cluster with Workload Identity & Autoscaling
# ============================================================================

# Dedicated Least-Privilege IAM Service Account for GKE Nodes
resource "google_service_account" "gke_nodes" {
  account_id   = "ultron-${var.environment}-gke-nodes-sa"
  display_name = "ULTRON ${title(var.environment)} GKE Node Service Account"
  project      = var.project_id
}

resource "google_project_iam_member" "node_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "node_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "node_monitoring_viewer" {
  project = var.project_id
  role    = "roles/monitoring.viewer"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "node_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

# GKE Cluster Definition (Control Plane)
resource "google_container_cluster" "primary" {
  name     = "ultron-${var.environment}-gke-cluster"
  location = var.region
  project  = var.project_id

  # Avoid using default node pool; manage node pool independently
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = var.vpc_id
  subnetwork = var.subnet_id

  # VPC-Native Cluster configuration (IP Aliasing)
  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {
    cluster_secondary_range_name  = "gke-pods"
    services_secondary_range_name = "gke-services"
  }

  # Fully Private Cluster
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Datapath V2 (Cilium eBPF high-performance networking & network policies)
  datapath_provider = "ADVANCED_DATAPATH"

  # Workload Identity for keyless GCP credential mapping
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Addons Configuration
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    gcs_fuse_csi_driver_config {
      enabled = true
    }
  }

  release_channel {
    channel = "REGULAR"
  }

  maintenance_policy {
    recurring_window {
      start_time = "2026-01-01T02:00:00Z"
      end_time   = "2026-01-01T06:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA,SU"
    }
  }
}

# Autoscaling Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "ultron-primary-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  project    = var.project_id

  initial_node_count = var.min_nodes

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    machine_type = var.machine_type
    disk_size_gb = 50
    disk_type    = "pd-ssd"

    service_account = google_service_account.gke_nodes.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Shielded VM security hardening
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    # Restrict metadata access (prevent metadata SSRF vulnerabilities)
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    tags = ["gke-node", "${var.environment}-node"]

    labels = {
      environment = var.environment
      role        = "microservices"
      platform    = "ultron-store"
    }
  }
}
