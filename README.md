# ULTRON Store — Enterprise Cloud Platform & E-Commerce Infrastructure

[![Terraform](https://img.shields.io/badge/Terraform-1.6%2B-623CE4?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Google Cloud](https://img.shields.io/badge/GCP-Production--Grade-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![Kubernetes](https://img.shields.io/badge/GKE-v1.28%2B-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![GitOps](https://img.shields.io/badge/ArgoCD-GitOps%20v2.9-EF6B48?logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![Security](https://img.shields.io/badge/Trivy-Container%20Scan-1904DA?logo=aquasecurity&logoColor=white)](https://trivy.dev/)
[![Database](https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%2015-336791?logo=postgresql&logoColor=white)](https://cloud.google.com/sql)
[![Deployment Guide](https://img.shields.io/badge/DevOps%20Runbook-DEPLOYMENT__GUIDE.md-emerald?style=flat&logo=bookstack&logoColor=white)](DEPLOYMENT_GUIDE.md)

> 📘 **Looking for the step-by-step deployment runbook?**  
> Check out the [**Complete End-to-End DevOps Deployment Guide (DEPLOYMENT_GUIDE.md)**](DEPLOYMENT_GUIDE.md) for a reproducible, hands-on walkthrough covering required accounts (GCP Free Tier, GitHub), local sandbox testing, Terraform provisioning, Kubernetes deployments, and GitOps automation with ArgoCD (Dev → Prod).

---

## 1. Executive Summary & Project Scope

**ULTRON Store** is a mission-critical, enterprise-scale e-commerce platform dedicated to certified pre-owned and refurbished mobile devices. Unlike standard e-commerce platforms with homogeneous SKU quantities, pre-owned phone commerce requires **strict serial-level tracking (IMEI, battery health, cosmetic grades: Mint/Good/Fair, functional test histories)** where each listed unit is typically **one-of-a-kind (Quantity: 1)**.

### Core Business & Technical Requirements
- **Real-Time Inventory Synchronization & Reservation Locking**: Sub-millisecond distributed locking (Redis Memorystore + WebSocket broadcasts) prevents double-purchasing during competitive flash sales and new drop releases.
- **Dynamic Auto-Scaling**: Cloud-native elasticity spanning GKE Horizontal Pod Autoscaling (HPA) and GCP Managed Instance Groups (MIG) to absorb 10x traffic surges during high-volume promotions.
- **Resilient Payment Gateway Processing**: Fully idempotent payment processing (Stripe / Webhook ingestion), hardened via Cloud Secret Manager, dead-letter queues, and PCI-DSS best practices.
- **GitOps-Driven Delivery**: Declarative infrastructure via **Terraform** and continuous delivery via **ArgoCD + Helm**, guaranteeing zero-downtime rolling updates with immutable audit trails.
- **Zero-Downtime Migration Architecture**: Complete operational runbooks and data-validation pipelines to migrate legacy on-premise Docker Compose workloads to modern Google Cloud Platform (GCP) infrastructure.

---

## 2. Architectural Blueprint

```
                                  [ INTERNET CLIENTS ]
                                            │
                                            ▼
                           [ Cloud Armor WAF / DDoS Protection ]
                                            │
                                            ▼
                       [ Global External HTTPS Load Balancer ]
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │                                                 │
                   ▼ (Static Assets CDN)                             ▼ (API Traffic)
         [ Cloud Storage Bucket ]                       [ GKE Ingress (Nginx / GCE) ]
                                                                     │
 ────────────────────────────────────────────────────────────────────┼───────────────────────────────────
 [ VPC: 10.0.0.0/16 - Private Cluster Network ]                      │
                                                                     ▼
                        ┌─────────────────────────────────────────────────────────┐
                        │              GKE AUTOSCALING CLUSTER                    │
                        │                                                         │
                        │   ┌────────────────────┐      ┌─────────────────────┐   │
                        │   │  Frontend Store    │      │  Inventory Service  │   │
                        │   │  (React/Next.js)   │      │  (Node.js / HPA)    │   │
                        │   └─────────┬──────────┘      └──────────┬──────────┘   │
                        │             │                            │              │
                        │             ▼                            ▼              │
                        │   ┌────────────────────┐      ┌─────────────────────┐   │
                        │   │  Catalog Service   │◄────►│    Order Service    │   │
                        │   │  (IMEI & Grades)   │      │    (Locking/Cart)   │   │
                        │   └────────────────────┘      └──────────┬──────────┘   │
                        │                                          │              │
                        │                                          ▼              │
                        │                               ┌─────────────────────┐   │
                        │                               │   Payment Service   │   │
                        │                               │   (Stripe Webhook)  │   │
                        │                               └─────────────────────┘   │
                        └─────────────────────────────────────────────────────────┘
                                       │                               │
                      Private Services │ Access       Private Peering │
                                       ▼                               ▼
                     ┌───────────────────────────────────┐   ┌──────────────────────────────────┐
                     │ Cloud SQL (PostgreSQL 15 HA)      │   │ Memorystore (Redis Cluster)      │
                     │ - Private IP Only (No Public IP)  │   │ - Real-Time IMEI Locks           │
                     │ - Automated Backups & WAL Logs    │   │ - Low-Latency Cart Reservations  │
                     └───────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 3. Modular Repository Structure

This repository follows the modern unified GitOps pattern, organizing microservices, declarative infrastructure, Kubernetes manifests, and migration tooling into clear modular boundaries:

```
ultron-store/
├── Makefile                          # Unified Developer & DevOps task runner
├── init_repo.sh                      # Shell automation script to bootstrap repo scaffolding
├── docker-compose.local.yml          # On-prem simulation & local development multi-service stack
├── README.md                         # Architecture, infrastructure & operational documentation
├── .gitignore                        # Enterprise ignore rules (secrets, terraform, dist)
│
├── services/                         # Microservices Source Code & Unit Tests
│   ├── gateway/                      # Unified API Gateway & reverse proxy router
│   │   ├── Dockerfile                # Container packaging for proxy layer
│   │   ├── src/index.js              # Express reverse proxy routing /api/v1/* to microservices
│   │   └── package.json
│   ├── inventory-service/            # Real-time IMEI locking & stock state engine
│   │   ├── Dockerfile                # Multi-stage secure build (non-root runner)
│   │   ├── src/                      # API controllers, Redis pub/sub handler
│   │   └── tests/                    # Unit & concurrency race-condition tests
│   ├── catalog-service/              # Phone specs, condition grading & diagnostics
│   │   ├── Dockerfile
│   │   ├── src/                      # Device models, specs, IMEI data
│   │   └── tests/
│   ├── order-service/                # Checkout orchestrator, cart reservation locks
│   │   ├── Dockerfile
│   │   ├── src/                      # Distributed checkout lock logic
│   │   └── tests/
│   ├── payment-service/              # Payment gateway webhook receiver & idempotency
│   │   ├── Dockerfile
│   │   ├── src/                      # Webhooks & idempotent transaction handling
│   │   └── tests/
│   └── frontend-store/               # Customer storefront (Apple iStore aesthetic & studio photography)
│       ├── Dockerfile                # Multi-stage Vite + Nginx build
│       ├── src/                      # React 18, 40-Point Diagnostic Passport, bag drawer
│       └── public/
│
├── infrastructure/                   # Infrastructure as Code (Terraform)
│   └── terraform/
│       ├── main.tf                   # Root orchestration invoking modular layers
│       ├── variables.tf              # Input variable declarations
│       ├── outputs.tf                # Cluster endpoints, LB IP, SQL connection names
│       ├── environments/             # Environment-specific configuration values
│       │   ├── dev.tfvars.example    # Dev/Staging parameters (cost-optimized)
│       │   └── prod.tfvars.example   # Production parameters (HA, multi-zone, Cloud Armor)
│       └── modules/                  # Reusable Infrastructure Modules
│           ├── networking/           # Custom VPC, public/private subnets, Cloud NAT
│           ├── compute/              # Managed Instance Groups, template & autoscaler
│           ├── gke/                  # GKE cluster, private nodes, workload identity
│           ├── database/             # Cloud SQL PostgreSQL 15, private IP peering
│           ├── monitoring/           # Cloud Monitoring dashboards, uptime alerts
│           └── security/             # Cloud Armor policies, IAM roles, Secret Manager
│
├── k8s/                              # Raw Kubernetes Manifests (Kustomize Base & Overlays)
│   ├── base/                         # Base deployments, services, HPAs, and network policies
│   │   ├── inventory/
│   │   ├── catalog/
│   │   ├── order/
│   │   ├── payment/
│   │   └── frontend/
│   └── overlays/                     # Environment overlays
│       ├── staging/                  # Staging resource allocations & replicas
│       └── prod/                     # High-availability replicas, pod disruption budgets
│
├── gitops/                           # Declarative CD with Helm & ArgoCD
│   ├── helm/
│   │   └── ultron-store/             # Unified application umbrella chart
│   │       ├── Chart.yaml            # Metadata & version
│   │       ├── values.yaml           # Default Helm values
│   │       ├── values-staging.yaml   # Staging overrides (auto-updated by CI/CD)
│   │       ├── values-prod.yaml      # Production overrides (gated releases)
│   │       └── templates/            # Deployment, Service, Ingress, HPA templates
│   └── argocd/
│       └── applications/             # ArgoCD Application & ApplicationSet CRDs
│           ├── staging-app.yaml      # Auto-sync staging application definition
│           └── prod-app.yaml         # Production application definition with manual gate
│
├── migration/                        # On-Premise to GCP Migration Artifacts
│   ├── assessment/
│   │   └── MIGRATION-ASSESSMENT.md   # 6R evaluation, service inventories & cutover risks
│   ├── database/
│   │   ├── init.sql                  # Canonical database schema definition
│   │   └── validate-migration.sh     # Row count and hash verification script
│   ├── runbooks/
│   │   └── RUNBOOK-migration.md      # Minute-by-minute cutover checklist & rollback guide
│   └── cost-analysis/
│       └── COST-ANALYSIS.md          # TCO comparison: On-prem vs GCP with CUDs
│
├── observability/                    # Monitoring, Logging & Alerting Configurations
│   ├── prometheus/                   # ServiceMonitors & scrape configurations
│   ├── grafana/                      # Custom dashboards (IMEI Lock contention, QPS, Latency)
│   └── alerts/                       # AlertManager rules (5xx error spikes, DB connection saturation)
│
└── .github/
    └── workflows/
        ├── ci.yml                    # PR verification: Lint, Test, and Trivy CVE scanning
        └── cd.yml                    # Merge to main: Build, Artifact Registry push, GitOps commit
```

---

## 4. Technical Specifications Across Foundation Modules

### A. Infrastructure as Code (GCP & Terraform)
Based on `PROJECT-1-terraform-gcp-platform.md`:
1. **Network Isolation**: Custom VPC with zero auto-subnetting. Public subnet (`10.0.1.0/24`) hosts the load balancer; private subnet (`10.0.2.0/24`) hosts GKE nodes and database peering.
2. **Cloud NAT & Private Access**: Node pools have no external public IPs. Outbound egress for package updates and third-party webhooks is routed via Cloud NAT.
3. **Database Security**: Cloud SQL PostgreSQL 15 deployed with `ipv4_enabled = false` and attached to the VPC via private services networking. Passwords are bound through Google Secret Manager.
4. **Resilient Compute**: GKE nodes scale between 2 to 10 nodes based on CPU and memory thresholds, with Pod Disruption Budgets (PDBs) ensuring minimum availability during maintenance windows.

### B. GitOps CI/CD Pipeline
Based on `PROJECT-2-gitops-cicd-pipeline.md`:
1. **Continuous Integration (`ci.yml`)**:
   - Triggers on all Pull Requests targeting `main` or `develop`.
   - Executes unit tests and linter suites.
   - Builds container images and executes **Trivy security scans** with `--severity CRITICAL,HIGH --exit-code 1`.
2. **Continuous Delivery (`cd.yml`)**:
   - Triggers on merge to `main`.
   - Authenticates to GCP using Workload Identity Federation / Service Account Key.
   - Pushes versioned immutable container tags to Google Artifact Registry (`us-central1-docker.pkg.dev/$PROJECT_ID/ultron-store/*`).
   - Updates `values-staging.yaml` in the GitOps configuration with the newly minted Git SHA commit.
3. **ArgoCD GitOps Operator**:
   - Continuous reconciliation loop (`syncPolicy: automated, prune: true, selfHeal: true`).
   - Instantly recovers against configuration drift or rogue `kubectl` manual edits.
   - Instant rollback capability via `git revert` or `argocd app rollback`.

### C. Cloud Migration Simulation
Based on `PROJECT-3-cloud-migration.md`:
1. **Source State**: Multi-container Docker Compose simulating an on-premise dedicated server deployment (`docker-compose.local.yml`).
2. **Database Migration Strategy**:
   - Take consistent snapshot using `pg_dump --single-transaction`.
   - Stage dump files inside encrypted Google Cloud Storage (`gs://$PROJECT_ID-backups/`).
   - Stream import into Cloud SQL PostgreSQL instance.
   - Run `migration/database/validate-migration.sh` to certify 100% data parity.
3. **Observability Stack**: `kube-prometheus-stack` monitoring Prometheus metrics via Spring Boot / Node.js actuator endpoints, paired with Grafana dashboards for transaction throughput and P99 latency.

---

## 5. Local Development Quickstart

### Prerequisites
- **Docker** and **Docker Compose** v2.20+
- **Terraform** v1.6.0+
- **Google Cloud SDK (`gcloud`)** v450.0.0+
- **kubectl** v1.28+ and **Helm** v3.12+
- **Make** utility

### 1. Initialize the Workspace
Run the automated repo setup script to initialize directories, permissions, and configurations:
```bash
# Make the initialization script executable and run it
chmod +x init_repo.sh
./init_repo.sh

# Or run via Makefile
make init
```

### 2. Spin Up Local Services Stack
Emulate the entire e-commerce backend (Inventory, Catalog, Orders, Payments, Redis, and PostgreSQL) locally in one command:
```bash
make dev-up
```
Verify the running containers:
```bash
docker compose -f docker-compose.local.yml ps
```

Health Check Endpoints:
- **API Gateway**: `http://localhost:8080/health`
- **Inventory Service**: `http://localhost:4001/health`
- **Catalog Service**: `http://localhost:4002/health`
- **Order Service**: `http://localhost:4003/health`

### 3. Tear Down Local Stack
```bash
make dev-down
```

---

## 6. GCP Infrastructure Deployment Guide

### 1. Authenticate with Google Cloud
```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### 2. Configure Remote State Storage
Create a dedicated Google Cloud Storage bucket for Terraform state locking:
```bash
PROJECT_ID=$(gcloud config get-value project)
gsutil mb -p $PROJECT_ID -l us-central1 gs://${PROJECT_ID}-terraform-state
gsutil versioning set on gs://${PROJECT_ID}-terraform-state
```

### 3. Plan and Provision Staging Infrastructure
```bash
# Initialize Terraform modules and backend
make tf-init

# Review planned cloud resources
make tf-plan-dev

# Apply infrastructure changes
make tf-apply-dev
```

---

## 7. GitOps & ArgoCD Pipeline Setup

### 1. Connect kubectl to the Provisioned GKE Cluster
```bash
gcloud container clusters get-credentials ultron-cluster --region us-central1
kubectl get nodes
```

### 2. Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD server deployment
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

### 3. Register ULTRON Store Applications
```bash
kubectl apply -f gitops/argocd/applications/staging-app.yaml
```

Check synchronization status:
```bash
argocd app get ultron-store-staging
```

---

## 8. Operational Playbooks & Runbooks

- [Migration Assessment & 6R Strategy](migration/assessment/MIGRATION-ASSESSMENT.md)
- [Zero-Downtime Migration Runbook](migration/runbooks/RUNBOOK-migration.md)
- [On-Premise vs Cloud Cost Analysis](migration/cost-analysis/COST-ANALYSIS.md)
- [Database Integrity Validation](migration/database/validate-migration.sh)

---

## 9. Security Posture & Compliance

1. **Least Privilege Principle**: Workload Identity ensures pods authenticate to Cloud SQL and Google Secret Manager without storing static private keys on the filesystem.
2. **Container Immutability**: All microservice Dockerfiles enforce non-root user accounts (`USER ultronuser`) and minimal Alpine base distributions.
3. **Automated Vulnerability Gates**: Trivy continuously blocks pull requests containing unresolved `CRITICAL` Common Vulnerabilities and Exposures (CVEs).
4. **WAF Hardening**: Cloud Armor blocks SQL injection, cross-site scripting (XSS), and rate limits brute-force checkout requests.
