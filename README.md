<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/ultron-store-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/ultron-store-logo.svg">
    <img src="docs/assets/ultron-store-logo.svg" alt="ULTRON STORE Logo" width="480" />
  </picture>
</p>

<h3 align="center">Enterprise Cloud Platform, Modular Architecture &amp; E-Commerce Infrastructure</h3>

<p align="center">
  <a href="https://www.terraform.io/"><img src="https://img.shields.io/badge/Terraform-1.6%2B-623CE4?logo=terraform&logoColor=white" alt="Terraform"></a>
  <a href="https://cloud.google.com/"><img src="https://img.shields.io/badge/GCP-Production--Grade-4285F4?logo=googlecloud&logoColor=white" alt="Google Cloud"></a>
  <a href="https://kubernetes.io/"><img src="https://img.shields.io/badge/GKE-v1.28%2B-326CE5?logo=kubernetes&logoColor=white" alt="Kubernetes"></a>
  <a href="https://argoproj.github.io/cd/"><img src="https://img.shields.io/badge/ArgoCD-GitOps%20v2.9-EF6B48?logo=argo&logoColor=white" alt="GitOps"></a>
  <a href="https://trivy.dev/"><img src="https://img.shields.io/badge/Trivy-Container%20Scan-1904DA?logo=aquasecurity&logoColor=white" alt="Security"></a>
  <a href="https://cloud.google.com/sql"><img src="https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%2015-336791?logo=postgresql&logoColor=white" alt="Database"></a>
  <a href="DEPLOYMENT_GUIDE.md"><img src="https://img.shields.io/badge/DevOps%20Runbook-DEPLOYMENT__GUIDE.md-emerald?style=flat&logo=bookstack&logoColor=white" alt="Deployment Guide"></a>
</p>

> 📘 **Looking for the step-by-step deployment runbook?**  
> Check out the [**Complete End-to-End DevOps Deployment Guide (DEPLOYMENT_GUIDE.md)**](DEPLOYMENT_GUIDE.md) for a reproducible, hands-on walkthrough covering required accounts (GCP Free Tier, GitHub), local sandbox testing, Terraform provisioning, Kubernetes deployments, and GitOps automation with ArgoCD (Dev → Prod).

---

<h2 align="center">🚀 Technology Timeline: From Local Dev to Production</h2>

<table align="center" style="border: none; background: transparent;">
  <tr>
    <td align="center" width="33%">
      <h3>Month 1</h3>
      <b>Foundation & Local Dev</b><br><br>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /><br><br>
      <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
    </td>
    <td align="center" width="33%">
      <h1>&nbsp;&nbsp;&nbsp;➔&nbsp;&nbsp;&nbsp;</h1>
    </td>
    <td align="center" width="33%">
      <h3>Month 2</h3>
      <b>Infrastructure & Staging</b><br><br>
      <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/GCP-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/GKE-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Cloud%20SQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Memorystore-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <h3>Month 3</h3>
      <b>GitOps & Production</b><br><br>
      <img src="https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" /><br><br>
      <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
    </td>
    <td align="center" width="33%">
      <h1>&nbsp;&nbsp;&nbsp;⟵&nbsp;&nbsp;&nbsp;</h1>
    </td>
    <td align="center" width="33%">
      <h1>⬇</h1>
    </td>
  </tr>
</table>

---

## 1. Executive Summary & Project Scope

**ULTRON Store** is a mission-critical, enterprise-scale e-commerce platform dedicated to certified pre-owned and refurbished mobile devices. Unlike standard e-commerce platforms with homogeneous SKU quantities, pre-owned phone commerce requires **strict serial-level tracking (IMEI, battery health, cosmetic grades: Mint/Good/Fair, functional test histories)** where each listed unit is typically **one-of-a-kind (Quantity: 1)**.

### Core Business & Technical Requirements
- **Unified Modular Monolith API**: Designed with strict domain boundaries (`Catalog`, `Orders`, `Auth`) in a Node.js Express architecture, interacting natively with PostgreSQL for atomic transaction integrity.
- **Dynamic Auto-Scaling**: Cloud-native elasticity spanning GKE Horizontal Pod Autoscaling (HPA) and GCP Managed Instance Groups (MIG) to absorb traffic surges during high-volume promotions.
- **Resilient Payment Gateway Processing**: Fully idempotent payment processing (Stripe webhook ingestion), hardened via Cloud Secret Manager and robust error handling.
- **GitOps-Driven Delivery**: Declarative infrastructure via **Terraform** and continuous delivery via **ArgoCD + Helm**, guaranteeing zero-downtime rolling updates with immutable audit trails.
- **Zero-Downtime Migration Architecture**: Complete operational runbooks and data-validation pipelines to migrate legacy on-premise Docker Compose workloads to modern Google Cloud Platform (GCP) infrastructure.

---

## 2. Architectural Blueprint

```text
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
                        │   ┌─────────────────────────┐                           │
                        │   │     Frontend Store      │                           │
                        │   │    (React 18 / Vite)    │                           │
                        │   └─────────┬───────────────┘                           │
                        │             │                                           │
                        │             ▼                                           │
                        │   ┌─────────────────────────┐                           │
                        │   │  Backend API (Node.js)  │                           │
                        │   │   [Modular Monolith]    │                           │
                        │   │ - Auth & JWT Security   │                           │
                        │   │ - Catalog & Inventory   │                           │
                        │   │ - Orders & Checkout     │                           │
                        │   └─────────────────────────┘                           │
                        └─────────────────────────────────────────────────────────┘
                                       │                               
                      Private Services │ Access                        
                                       ▼                               
                     ┌───────────────────────────────────┐             
                     │ Cloud SQL (PostgreSQL 15 HA)      │             
                     │ - Private IP Only (No Public IP)  │             
                     │ - Automated Backups & WAL Logs    │             
                     └───────────────────────────────────┘             
```

---

## 3. Modular Repository Structure

This repository follows the modern unified GitOps pattern, separating the frontend and backend into NPM workspaces, alongside declarative infrastructure and Kubernetes manifests.

```text
ultron-store/
├── Makefile                          # Unified Developer & DevOps task runner
├── init_repo.sh                      # Shell automation script to bootstrap repo scaffolding
├── docker-compose.local.yml          # Local development stack (Frontend, Backend, DB)
├── README.md                         # Architecture, infrastructure & operational documentation
│
├── frontend/                         # Vite React Customer Storefront
│   ├── Dockerfile                    # Multi-stage Vite + Nginx build
│   ├── src/                          
│   │   ├── components/               # Shared UI (Icons, Modals, Buttons)
│   │   ├── modules/                  # Feature Modules (Auth, Checkout, Orders)
│   │   └── data/                     # Product catalog and mocked state
│   └── package.json                  # NPM workspace config
│
├── backend/                          # Node.js Express Modular Monolith API
│   ├── Dockerfile                    # Production-ready Node container
│   ├── src/                          
│   │   ├── core/                     # Database schemas, Middlewares, Auth logic
│   │   └── modules/                  # Catalog, Orders, Payment routes & controllers
│   └── package.json
│
├── infrastructure/                   # Infrastructure as Code (Terraform)
│   └── terraform/
│       ├── main.tf                   # Root orchestration invoking modular layers
│       ├── environments/             # Environment-specific configuration values
│       │   ├── dev.tfvars.example    
│       │   └── prod.tfvars.example   
│       └── modules/                  # Reusable Infrastructure Modules (VPC, GKE, SQL)
│
├── k8s/                              # Raw Kubernetes Manifests (Kustomize Base & Overlays)
│   ├── base/                         # Base deployments, services, HPAs
│   │   ├── backend/
│   │   ├── frontend/
│   │   └── database/
│   └── overlays/                     # Environment overlays (staging, prod)
│
├── gitops/                           # Declarative CD with Helm & ArgoCD
│   ├── helm/
│   │   └── ultron-store/             # Unified application umbrella chart
│   └── argocd/
│       └── applications/             # ArgoCD Application CRDs
│
├── migration/                        # On-Premise to GCP Migration Artifacts
│   ├── assessment/                   # 6R evaluation & cutover risks
│   └── database/                     # Init scripts and validation
│
├── observability/                    # Monitoring, Logging & Alerting Configurations
│   ├── prometheus/                   # Scrape configurations
│   └── grafana/                      # Custom dashboards (QPS, Latency)
│
└── .github/
    └── workflows/
        ├── ci.yml                    # PR verification: Lint, Test, and Trivy CVE scanning
        └── cd.yml                    # Merge to main: Build, Artifact Registry push, GitOps commit
```

---

## 4. Technical Specifications Across Foundation Modules

### A. Infrastructure as Code (GCP & Terraform)
1. **Network Isolation**: Custom VPC with zero auto-subnetting. Public subnet (`10.0.1.0/24`) hosts the load balancer; private subnet (`10.0.2.0/24`) hosts GKE nodes and database peering.
2. **Cloud NAT & Private Access**: Node pools have no external public IPs. Outbound egress for package updates and third-party webhooks is routed via Cloud NAT.
3. **Database Security**: Cloud SQL PostgreSQL 15 deployed with `ipv4_enabled = false` and attached to the VPC via private services networking. Passwords are bound through Google Secret Manager.
4. **Resilient Compute**: GKE nodes scale between 2 to 10 nodes based on CPU and memory thresholds, with Pod Disruption Budgets (PDBs) ensuring minimum availability during maintenance windows.

### B. GitOps CI/CD Pipeline
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
1. **Source State**: Docker Compose simulating an on-premise dedicated server deployment (`docker-compose.local.yml`).
2. **Database Migration Strategy**:
   - Take consistent snapshot using `pg_dump --single-transaction`.
   - Stage dump files inside encrypted Google Cloud Storage (`gs://$PROJECT_ID-backups/`).
   - Stream import into Cloud SQL PostgreSQL instance.
3. **Observability Stack**: `kube-prometheus-stack` monitoring Prometheus metrics via Express endpoints, paired with Grafana dashboards for transaction throughput and P99 latency.

---

## 5. Local Development Quickstart

### Prerequisites
- **Docker** and **Docker Compose** v2.20+
- **Terraform** v1.6.0+
- **Google Cloud SDK (`gcloud`)**
- **kubectl** and **Helm**

### 1. Spin Up Local Services Stack
Emulate the entire e-commerce backend (Backend API, Frontend UI, and PostgreSQL) locally in one command:
```bash
docker compose -f docker-compose.local.yml up --build -d
```
Verify the running containers:
```bash
docker compose -f docker-compose.local.yml ps
```

Health Check Endpoints:
- **Frontend UI**: `http://localhost:3001`
- **Backend API**: `http://localhost:4000/health`
- **Database (Postgres)**: `localhost:5432`

### 2. Tear Down Local Stack
```bash
docker compose -f docker-compose.local.yml down -v
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
cd infrastructure/terraform
terraform init
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
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

## 8. Security Posture & Compliance

1. **Least Privilege Principle**: Workload Identity ensures pods authenticate to Cloud SQL and Google Secret Manager without storing static private keys on the filesystem.
2. **Container Immutability**: All microservice Dockerfiles enforce non-root user accounts (`USER ultronuser`) and minimal Alpine base distributions.
3. **Automated Vulnerability Gates**: Trivy continuously blocks pull requests containing unresolved `CRITICAL` Common Vulnerabilities and Exposures (CVEs).
4. **WAF Hardening**: Cloud Armor blocks SQL injection, cross-site scripting (XSS), and rate limits brute-force checkout requests.
