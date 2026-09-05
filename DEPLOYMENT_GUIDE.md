# ULTRON STORE — Complete End-to-End DevOps Deployment Guide
### A Reproducible, Hands-on Runbook from Zero to Cloud Production (Dev → Prod)
**Target Audience**: Aspiring DevOps & Cloud Engineers, Platform Engineers, Full-Stack Developers  
**Author**: ULTRON Architecture & DevOps Engineering Team  
**Estimated Time to Complete**: 60–90 minutes (Dev Environment) | 30 minutes (Prod Promotion)

---

## Table of Contents
1. [Prerequisites & Accounts Required](#1-prerequisites--accounts-required)
2. [DevOps Core Concepts for Aspiring Engineers](#2-devops-core-concepts-for-aspiring-engineers)
3. [Architecture Overview](#3-architecture-overview)
4. [Phase 0: Zero-Cloud Local Sandbox (Docker Compose)](#4-phase-0-zero-cloud-local-sandbox-docker-compose)
5. [Phase 1: Google Cloud Platform (GCP) Setup (Dev Project)](#5-phase-1-google-cloud-platform-gcp-setup-dev-project)
6. [Phase 2: Infrastructure as Code with Terraform](#6-phase-2-infrastructure-as-code-with-terraform)
7. [Phase 3: Container Builds & Google Artifact Registry](#7-phase-3-container-builds--google-artifact-registry)
8. [Phase 4: Deploying to Kubernetes (Kustomize Dev/Staging Overlay)](#8-phase-4-deploying-to-kubernetes-kustomize-devstaging-overlay)
9. [Phase 5: GitOps Automation with ArgoCD](#9-phase-5-gitops-automation-with-argocd)
10. [Phase 6: Production Environment Promotion (Prod Project)](#10-phase-6-production-environment-promotion-prod-project)
11. [Phase 7: Observability, Day-2 Operations & Teardown](#11-phase-7-observability-day-2-operations--teardown)
12. [Troubleshooting & Common Pitfalls](#12-troubleshooting--common-pitfalls)

---

## 1. Prerequisites & Accounts Required

Before touching any terminal commands, ensure you have the following accounts and local tools ready:

### A. Accounts Required
| Service | Purpose | Cost / Tier | How to Create |
| :--- | :--- | :--- | :--- |
| **Google Cloud Platform (GCP)** | Hosting Kubernetes (GKE), Cloud SQL (Postgres), VPC Networking, Artifact Registry | **Free Trial** ($300 credits for 90 days). In Dev, we use `e2-medium` nodes and `db-f1-micro` to minimize spend. | [cloud.google.com](https://cloud.google.com) (Requires credit card for verification, but won't charge during trial) |
| **GitHub** | Version control, CI/CD pipeline execution with GitHub Actions, GitOps single source of truth | **Free** | [github.com](https://github.com) |
| **Domain Registrar** *(Optional for Prod)* | Custom domain (e.g. `ultronstore.com`) with managed SSL/TLS certificates | $8–$12/year (Cloudflare, Namecheap, Google Domains) | Optional. For testing, GCP provides auto-generated public IP load balancers. |

### B. Local CLI Tools to Install
Run the verification commands below in your terminal to ensure you have the proper tools installed:

```bash
# 1. Google Cloud SDK (gcloud)
gcloud version || echo "Install from: https://cloud.google.com/sdk/docs/install"

# 2. Terraform (>= 1.6)
terraform version || echo "Install from: https://developer.hashicorp.com/terraform/install"

# 3. Kubernetes CLI (kubectl)
kubectl version --client || echo "Install: gcloud components install kubectl"

# 4. Helm (v3)
helm version || echo "Install from: https://helm.sh/docs/intro/install/"

# 5. Kustomize
kustomize version || echo "Built into kubectl or brew install kustomize"

# 6. Docker & Docker Compose
docker version && docker compose version || echo "Install Docker Desktop"

# 7. Git
git version
```

---

## 2. DevOps Core Concepts for Aspiring Engineers

If you are new to DevOps, understanding **why** each tool is used is more important than memorizing syntax:

1. **Infrastructure as Code (IaC) with Terraform**:
   - *Traditional approach*: Clicking around the GCP web console to create VPCs, databases, and clusters.
   - *Why Terraform*: Clicking in a UI is error-prone, untracked, and cannot be recreated easily. Terraform lets you write your entire datacenter in code (`.tf`), commit it to Git, and spin up an exact clone of your environment in minutes.

2. **Workload Identity Federation**:
   - *Traditional approach*: Creating service account JSON credential files and pasting them into GitHub Secrets or storing them in containers.
   - *Why Workload Identity*: Long-lived JSON keys get leaked. With Workload Identity, Kubernetes pods authenticate to Google Cloud APIs natively using temporary OpenID Connect (OIDC) security tokens without any stored secret files.

3. **GitOps with ArgoCD**:
   - *Traditional approach*: CI pipelines push code directly into production clusters using `kubectl apply`. If someone manually modifies the cluster, Git and the cluster become out of sync ("configuration drift").
   - *Why GitOps*: Git is the single source of truth. ArgoCD runs *inside* the cluster and continuously monitors your Git repository. When you push a commit, ArgoCD pulls the change and synchronizes the cluster automatically.

4. **Blast Radius Containment (Dev vs. Prod Isolation)**:
   - Development and Production are provisioned in **separate GCP projects** (`ultron-store-dev` and `ultron-store-prod`). A mistake, accidental deletion, or resource exhaustion in Dev can never impact paying customers in Prod.

---

## 3. Architecture Overview

```
                          [ Internet / Customer ]
                                     │
                                     ▼
                      [ GCP Cloud Armor & Cloud NAT ]
                                     │
                                     ▼
                    [ GKE Ingress / Nginx Controller ]
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
[ frontend-store (Pod) ]                              [ gateway (Pod) ]
 (Apple-style Vite Storefront)                        (Reverse Proxy Router)
                                                               │
                       ┌───────────────────────┬───────────────┴───────────────┐
                       ▼                       ▼                               ▼
            [ catalog-service ]      [ inventory-service ]             [ order-service ]
             (Specs & Grades)         (Redis Redlock Engine)           (Checkout Saga)
                                               │                               │
                                               ▼                               ▼
                                     [ Redis Cluster ]               [ Cloud SQL Postgres ]
                                    (10-Min Stock Holds)             (ACID Transactions)
```

---

## 4. Phase 0: Zero-Cloud Local Sandbox (Docker Compose)

Before deploying to the cloud and incurring any cloud costs, verify the microservices stack on your local machine using Docker Compose.

### Step 0.1: Clone and Inspect the Repository
```bash
git clone https://github.com/Shaun-Trigga96/ULTRON-STORE.git
cd ULTRON-STORE
git checkout main
```

### Step 0.2: Boot the Full Local Microservices Stack
```bash
# Start PostgreSQL, Redis, Gateway, Inventory, Catalog, Order, Payment & Frontend
docker compose -f docker-compose.local.yml up -d --build

# Check the running containers
docker compose -f docker-compose.local.yml ps
```

### Step 0.3: Test Local Endpoints
Open your browser or terminal to test:
- **Customer Storefront UI**: [http://localhost:3000](http://localhost:3000)
- **API Gateway Health**: `curl http://localhost:8080/health`
- **Catalog Devices**: `curl http://localhost:8080/api/v1/catalog/devices`
- **Simulate Stock Hold**:
  ```bash
  curl -X POST http://localhost:8080/api/v1/inventory/lock \
    -H "Content-Type: application/json" \
    -d '{"imei":"354892019482910","sessionId":"dev-local-user"}'
  ```

### Step 0.4: Tear Down Local Environment
```bash
docker compose -f docker-compose.local.yml down -v
```

---

## 5. Phase 1: Google Cloud Platform (GCP) Setup (Dev Project)

Now let's configure your Google Cloud Platform account for the **Development** environment.

### Step 1.1: Log in to Google Cloud
```bash
# Authenticate your terminal with your Google account
gcloud auth login

# Set application default credentials for Terraform
gcloud auth application-default login
```

### Step 1.2: Create the Development Project
Pick a unique project ID (e.g. `ultron-store-dev-YOURNAME`):
```bash
export DEV_PROJECT_ID="ultron-store-dev-$USER"
export GCP_REGION="us-central1"

# Create the project
gcloud projects create $DEV_PROJECT_ID --name="ULTRON Store Dev"

# Set the active project in gcloud
gcloud config set project $DEV_PROJECT_ID
```

### Step 1.3: Link Billing Account
*Note: A billing account is required to use GKE and Cloud SQL. The Google Free Trial provides $300 free credits.*
```bash
# List your available billing accounts
gcloud billing accounts list

# Link your billing account to the new project (replace with your ACCOUNT_ID from above)
export BILLING_ACCOUNT_ID="YOUR-BILLING-ACCOUNT-ID"
gcloud billing projects link $DEV_PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID
```

### Step 1.4: Enable Required Google Cloud APIs
GCP resources are disabled by default. Enable the services required for Kubernetes, Cloud SQL, and Artifact Registry:
```bash
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  servicenetworking.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com
```

### Step 1.5: Create the Terraform State Storage Bucket
Terraform stores the map of your real-world infrastructure in a state file (`terraform.tfstate`). We store this in a Google Cloud Storage (GCS) bucket with object versioning enabled so you can roll back state in case of an issue.

```bash
export TF_STATE_BUCKET="ultron-store-tfstate-dev-$USER"

# Create standard storage bucket
gcloud storage buckets create gs://$TF_STATE_BUCKET \
  --project=$DEV_PROJECT_ID \
  --location=$GCP_REGION \
  --uniform-bucket-level-access

# Enable versioning for state safety
gcloud storage buckets update gs://$TF_STATE_BUCKET --versioning
```

---

## 6. Phase 2: Infrastructure as Code with Terraform

We will now provision the underlying networking, GKE Kubernetes cluster, Cloud SQL database, and Artifact Registry using Terraform.

### Step 2.1: Configure the Terraform Backend
Navigate to the Terraform directory:
```bash
cd infrastructure/terraform
```

Open `main.tf` and ensure the GCS bucket matches your state bucket created in Step 1.5:
```hcl
terraform {
  backend "gcs" {
    bucket = "YOUR_TF_STATE_BUCKET_NAME" # e.g. ultron-store-tfstate-dev-john
    prefix = "dev/terraform.tfstate"
  }
}
```

### Step 2.2: Configure `dev.tfvars`
Inspect or edit `environments/dev.tfvars`:
```hcl
project_id         = "YOUR_DEV_PROJECT_ID"
region             = "us-central1"
environment        = "dev"
node_machine_type  = "e2-medium"     # Budget-friendly for dev (2 vCPU, 4GB RAM)
min_nodes          = 1
max_nodes          = 3
db_tier            = "db-f1-micro"    # Minimal cost for development
db_password_secret = "ultron_dev_db_super_secret_2026"
```

### Step 2.3: Initialize, Plan, and Apply
```bash
# 1. Initialize Terraform plugins and download providers
terraform init -backend-config="bucket=$TF_STATE_BUCKET"

# 2. Generate and inspect execution plan
terraform plan -var-file="environments/dev.tfvars" -out=dev.tfplan

# 3. Apply the infrastructure (Takes approximately 8–12 minutes for GKE + Cloud SQL)
terraform apply dev.tfplan
```

### What was just built?
- **Custom VPC & Subnets**: Strict RFC-1918 private subnets.
- **Cloud NAT**: Allows private GKE nodes to download public packages without exposing them to incoming internet traffic.
- **Private GKE Cluster**: Master and worker nodes running Kubernetes with Google Workload Identity enabled.
- **Cloud SQL PostgreSQL 15**: Managed database attached to the VPC via private service access.
- **Artifact Registry**: Docker container repository ready for image pushes.

---

## 7. Phase 3: Container Builds & Google Artifact Registry

### Step 3.1: Create Artifact Registry Repository (if not created by TF)
```bash
gcloud artifacts repositories create ultron-repo \
  --repository-format=docker \
  --location=$GCP_REGION \
  --description="ULTRON Store Microservices Docker Repository" \
  --project=$DEV_PROJECT_ID || true
```

### Step 3.2: Configure Docker CLI to Authenticate with GCP
```bash
gcloud auth configure-docker $GCP_REGION-docker.pkg.dev
```

### Step 3.3: Build & Push All Microservice Container Images
From the repository root (`cd ../..`):

```bash
export REGISTRY="$GCP_REGION-docker.pkg.dev/$DEV_PROJECT_ID/ultron-repo"
export GIT_TAG=$(git rev-parse --short HEAD)

echo "Building images with tag: $GIT_TAG to registry: $REGISTRY"

# 1. API Gateway
docker build -t $REGISTRY/gateway:$GIT_TAG -t $REGISTRY/gateway:latest services/gateway
docker push $REGISTRY/gateway:$GIT_TAG
docker push $REGISTRY/gateway:latest

# 2. Inventory Service
docker build -t $REGISTRY/inventory-service:$GIT_TAG -t $REGISTRY/inventory-service:latest services/inventory-service
docker push $REGISTRY/inventory-service:$GIT_TAG
docker push $REGISTRY/inventory-service:latest

# 3. Catalog Service
docker build -t $REGISTRY/catalog-service:$GIT_TAG -t $REGISTRY/catalog-service:latest services/catalog-service
docker push $REGISTRY/catalog-service:$GIT_TAG
docker push $REGISTRY/catalog-service:latest

# 4. Order Service
docker build -t $REGISTRY/order-service:$GIT_TAG -t $REGISTRY/order-service:latest services/order-service
docker push $REGISTRY/order-service:$GIT_TAG
docker push $REGISTRY/order-service:latest

# 5. Payment Service
docker build -t $REGISTRY/payment-service:$GIT_TAG -t $REGISTRY/payment-service:latest services/payment-service
docker push $REGISTRY/payment-service:$GIT_TAG
docker push $REGISTRY/payment-service:latest

# 6. Frontend Storefront
docker build -t $REGISTRY/frontend-store:$GIT_TAG -t $REGISTRY/frontend-store:latest services/frontend-store
docker push $REGISTRY/frontend-store:$GIT_TAG
docker push $REGISTRY/frontend-store:latest
```

---

## 8. Phase 4: Deploying to Kubernetes (Kustomize Dev/Staging Overlay)

### Step 4.1: Connect `kubectl` to your GKE Cluster
```bash
gcloud container clusters get-credentials ultron-gke-dev \
  --region $GCP_REGION \
  --project $DEV_PROJECT_ID

# Verify cluster connection
kubectl get nodes
```

### Step 4.2: Create Namespace and Secrets
```bash
# Create application namespace
kubectl create namespace ultron-dev --dry-run=client -o yaml | kubectl apply -f -

# Create database and Redis credentials secret
kubectl create secret generic ultron-secrets \
  --namespace=ultron-dev \
  --from-literal=POSTGRES_USER=ultron_admin \
  --from-literal=POSTGRES_PASSWORD=ultron_dev_db_super_secret_2026 \
  --from-literal=REDIS_PASSWORD=ultron_redis_dev_secret \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 4.3: Deploy In-Cluster Redis (for Dev)
```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cache
  namespace: ultron-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis-cache
  template:
    metadata:
      labels:
        app: redis-cache
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
  namespace: ultron-dev
spec:
  selector:
    app: redis-cache
  ports:
  - port: 6379
    targetPort: 6379
EOF
```

### Step 4.4: Deploy with Kustomize
Update image references in `k8s/overlays/staging/kustomization.yaml` with your GCP project ID, then apply:
```bash
# Build and apply Kustomize manifests
kubectl apply -k k8s/overlays/staging/
```

### Step 4.5: Verify Kubernetes Pods & Services
```bash
# Watch pods starting up
kubectl get pods -n ultron-dev -w

# Check services and external endpoints
kubectl get svc -n ultron-dev
```

When the `gateway` and `frontend-store` LoadBalancer services show an `EXTERNAL-IP`, open the external IP in your browser to access the live store!

---

## 9. Phase 5: GitOps Automation with ArgoCD

In enterprise DevOps, we do not run `kubectl apply` manually from developer laptops. We let **ArgoCD** continuously synchronize our Git repository with the cluster.

### Step 5.1: Install ArgoCD in the GKE Cluster
```bash
# Create dedicated namespace
kubectl create namespace argocd

# Apply official ArgoCD manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD server to be ready
kubectl wait --namespace argocd --for=condition=ready pod --selector=app.kubernetes.io/name=argocd-server --timeout=180s
```

### Step 5.2: Access ArgoCD Dashboard
```bash
# Forward ArgoCD UI port to local machine
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```
Now visit [https://localhost:8080](https://localhost:8080). Username: `admin` | Password: (output from above command).

### Step 5.3: Register GitOps Application
Apply the GitOps application specification:
```bash
kubectl apply -f gitops/argocd/applications/ultron-store-staging.yaml
```

ArgoCD will now visualize your entire microservices dependency graph, health checks, and sync status. Any commit pushed to `main` will automatically trigger a rolling zero-downtime deployment!

---

## 10. Phase 6: Production Environment Promotion (Prod Project)

Promoting to Production tests your architecture for **high availability (HA)**, **security hardening**, and **fault tolerance**.

### Differences Between Dev and Prod:
| Aspect | Development (`ultron-store-dev`) | Production (`ultron-store-prod`) |
| :--- | :--- | :--- |
| **GCP Project** | Isolated Dev Project | Isolated Prod Project |
| **GKE Nodes** | `e2-medium` (1 to 3 nodes) | `e2-standard-4` (3 to 12 nodes, Multi-Zonal) |
| **Cloud SQL** | `db-f1-micro` (Single zone, no backup) | `db-custom-4-16384` (HA Regional, automated failover replica, Point-In-Time-Recovery) |
| **Redis** | In-cluster pod | Google Cloud Memorystore (Multi-zone HA cluster) |
| **DDoS & WAF** | Basic firewall | Google Cloud Armor with rate-limiting policies |
| **Replication** | 1 replica per microservice | Min 3 replicas with Horizontal Pod Autoscaler (HPA) |

### Step 10.1: Create Prod Project
```bash
export PROD_PROJECT_ID="ultron-store-prod-$USER"
gcloud projects create $PROD_PROJECT_ID --name="ULTRON Store Prod"
gcloud billing projects link $PROD_PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID

# Enable APIs
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  servicenetworking.googleapis.com \
  monitoring.googleapis.com \
  --project=$PROD_PROJECT_ID
```

### Step 10.2: Deploy Production Terraform
```bash
cd infrastructure/terraform

# Create prod state bucket
export PROD_TF_BUCKET="ultron-store-tfstate-prod-$USER"
gcloud storage buckets create gs://$PROD_TF_BUCKET --project=$PROD_PROJECT_ID --location=$GCP_REGION

# Initialize with Prod Backend
terraform init -reconfigure -backend-config="bucket=$PROD_TF_BUCKET"

# Apply Production Configuration
terraform plan -var-file="environments/prod.tfvars" -out=prod.tfplan
terraform apply prod.tfplan
```

### Step 10.3: Deploy Production Kubernetes Overlay with HPA
```bash
# Switch kubectl context to Prod GKE
gcloud container clusters get-credentials ultron-gke-prod --region $GCP_REGION --project $PROD_PROJECT_ID

# Apply Production Overlays (Includes HorizontalPodAutoscalers and PodDisruptionBudgets)
kubectl apply -k k8s/overlays/prod/
```

---

## 11. Phase 7: Observability, Day-2 Operations & Teardown

### Observability & Health Checks
1. **Google Cloud Operations (formerly Stackdriver)**:
   - Navigate to Google Cloud Console → **Kubernetes Engine** → **Workloads** to inspect CPU/Memory utilization per container.
   - Logs are automatically aggregated in **Cloud Logging** (`resource.type="k8s_container"`).
2. **Prometheus & Grafana**:
   - Prometheus metrics are scraped on port `:9090` from microservices exporting `/metrics`.

### Cost-Saving Strategy for Learning / Testing
When you are done practicing for the day, **scale your GKE node pool to 0** so you do not get charged while sleeping:
```bash
gcloud container clusters resize ultron-gke-dev \
  --num-nodes=0 \
  --region=$GCP_REGION \
  --project=$DEV_PROJECT_ID --quiet
```
When you resume tomorrow, scale back up:
```bash
gcloud container clusters resize ultron-gke-dev \
  --num-nodes=2 \
  --region=$GCP_REGION \
  --project=$DEV_PROJECT_ID --quiet
```

### Complete Clean-up / Teardown
To prevent any unexpected billing, run Terraform destroy when you are finished testing the project:
```bash
cd infrastructure/terraform

# Destroy all dev infrastructure (VPC, Cloud SQL, GKE cluster)
terraform destroy -var-file="environments/dev.tfvars" --auto-approve
```

---

## 12. Troubleshooting & Common Pitfalls

1. **`CrashLoopBackOff` on Microservices Pods**:
   - *Cause*: Database or Redis service not reachable yet.
   - *Fix*: Check pod logs: `kubectl logs <pod-name> -n ultron-dev`. Verify Kubernetes service names match environment variables (`DB_HOST=postgres-service`, `REDIS_HOST=redis-service`).
2. **Terraform GCS State Bucket Access Denied**:
   - *Cause*: Your local gcloud credentials don't have Storage Admin permissions.
   - *Fix*: Run `gcloud auth application-default login` and verify your account has Owner or Editor role on the project.
3. **Artifact Registry `unauthorized: You do not have permission to push`**:
   - *Cause*: Docker daemon is not configured with GCP auth helper.
   - *Fix*: Run `gcloud auth configure-docker us-central1-docker.pkg.dev`.
4. **Cloud SQL Connection Failure from GKE**:
   - *Cause*: Private Service Access VPC peering has not been established.
   - *Fix*: Ensure `servicenetworking.googleapis.com` is enabled and Terraform module `networking` has executed successfully.

---
*Happy Shipping! You now have a complete, enterprise-grade, reproducible Cloud Native platform running on Google Cloud Platform with Kubernetes and GitOps.*
