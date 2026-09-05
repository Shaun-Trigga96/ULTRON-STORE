# ============================================================================
# NETWORKING MODULE — GCP TERRAFORM (PROJECT-1)
# Custom VPC, Private Subnet with Secondary Pod/Service CIDRs, Cloud NAT
# ============================================================================

resource "google_compute_network" "vpc" {
  name                    = "ultron-${var.environment}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  project                 = var.project_id
}

# Public Subnet (Hosts External Application Load Balancers)
resource "google_compute_subnetwork" "public_subnet" {
  name                     = "ultron-${var.environment}-public-subnet"
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
  name                     = "ultron-${var.environment}-private-subnet"
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

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Cloud Router for Egress NAT
resource "google_compute_router" "nat_router" {
  name    = "ultron-${var.environment}-nat-router"
  region  = var.region
  network = google_compute_network.vpc.id
  project = var.project_id
}

# Cloud NAT: Nodes have zero external IPs; outbound egress routes via Cloud NAT
resource "google_compute_router_nat" "nat_gateway" {
  name                               = "ultron-${var.environment}-cloud-nat"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  project                            = var.project_id
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Private Services Access (Peering IP range for Cloud SQL PostgreSQL)
resource "google_compute_global_address" "private_service_access_ip" {
  name          = "ultron-${var.environment}-psa-ip"
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
}

# Firewall: Allow Internal VPC Communication
resource "google_compute_firewall" "allow_internal" {
  name    = "ultron-${var.environment}-allow-internal"
  network = google_compute_network.vpc.id
  project = var.project_id

  allow {
    protocol = "icmp"
  }
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.0.0.0/16", "10.48.0.0/14", "10.52.0.0/20"]
}

# Firewall: Allow GCP Health Check Probes for Load Balancer Ingress
resource "google_compute_firewall" "allow_health_checks" {
  name    = "ultron-${var.environment}-allow-health-checks"
  network = google_compute_network.vpc.id
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "4001", "8080"]
  }

  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  target_tags   = ["gke-node"]
}
