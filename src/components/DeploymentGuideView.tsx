import React, { useState } from 'react';
import {
  Cloud,
  Terminal,
  Server,
  Database,
  ShieldCheck,
  GitBranch,
  GitPullRequest,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Layers,
  Cpu,
  Trash2,
  Zap,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Box,
  Compass
} from 'lucide-react';

interface GuideSection {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  shortDesc: string;
  content: React.ReactNode;
}

export function DeploymentGuideView() {
  const [activeSection, setActiveSection] = useState('prereqs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections: GuideSection[] = [
    {
      id: 'prereqs',
      badge: 'Step 01',
      badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
      title: 'Prerequisites & Accounts Needed',
      shortDesc: 'GCP Free Tier, GitHub, Docker, and CLI tooling setup.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Required Cloud Accounts & Free Tiers</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Everything in this guide is designed to run within the <span className="text-emerald-400 font-semibold">Google Cloud Platform $300 Free Trial</span> and GitHub Free tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                    GCP
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Cloud Platform</h4>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">Free $300 Trial (90 Days)</span>
                  </div>
                </div>
                <a
                  href="https://cloud.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Sign Up</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hosts our GKE Kubernetes cluster, Cloud SQL PostgreSQL database, Cloud Armor DDoS firewall, and Artifact Registry container storage.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-200 font-bold">Cost Control Note:</span> In Dev, we configure <code className="text-cyan-300">e2-medium</code> compute nodes and <code className="text-cyan-300">db-f1-micro</code> Cloud SQL to minimize spend.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                    GH
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">GitHub Account</h4>
                    <span className="text-[11px] text-purple-400 font-mono font-medium">100% Free Plan</span>
                  </div>
                </div>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hosts your source repository, triggers automated container vulnerability scans (Trivy), and acts as the GitOps single source of truth for ArgoCD.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-200 font-bold">GitOps Mechanism:</span> Committing manifest updates to GitHub causes ArgoCD in GKE to auto-sync.
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
              Required Local CLI Tools Verification:
            </h4>
            <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>Run in terminal to check installations:</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'gcloud version && terraform version && kubectl version --client && helm version && docker compose version',
                      'cli-check'
                    )
                  }
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedCode === 'cli-check' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'cli-check' ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
              <pre className="text-cyan-300 overflow-x-auto py-1">
{`# Check Google Cloud SDK
gcloud version

# Check Terraform (>= 1.6 required)
terraform version

# Check Kubernetes CLI & Helm
kubectl version --client
helm version

# Check Docker & Docker Compose
docker version && docker compose version`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'concepts',
      badge: 'Core Theory',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      title: 'DevOps Concepts for Aspiring Engineers',
      shortDesc: 'IaC, Workload Identity, GitOps, and Multi-Environment Isolation.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">The 4 Pillars of Modern Cloud DevOps</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Before running scripts, understand the fundamental architecture decisions that separate professional platforms from amateur setups:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cloud className="w-4 h-4" />
                <span>1. Declarative Infrastructure (Terraform)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never configure cloud resources by clicking in web consoles. In Terraform, we declare the end-state in HCL code (<code className="text-cyan-300">main.tf</code>). If an entire datacenter is deleted, one command (<code className="text-cyan-300">terraform apply</code>) reconstructs the entire network, cluster, and database identically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Workload Identity Federation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Storing service account private key JSON files on disk or in GitHub Secrets is a major security vulnerability. Google Cloud Workload Identity maps Kubernetes Service Accounts (KSA) directly to GCP IAM roles using temporary OIDC tokens with zero stored keys.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <GitPullRequest className="w-4 h-4" />
                <span>3. GitOps vs. Direct Push</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                In traditional setups, developers run <code className="text-purple-300">kubectl apply</code> from laptops, creating "configuration drift". In GitOps, ArgoCD sits inside the cluster, polls GitHub every 3 minutes, detects drift, and reconciles the cluster to match Git exactly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>4. Blast Radius Containment (Dev vs. Prod)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dev and Prod are separated into distinct GCP projects (<code className="text-amber-300">ultron-store-dev</code> vs <code className="text-amber-300">ultron-store-prod</code>). A bug, broken test, or accidental teardown in Dev can never touch or disrupt production customer transactions.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase0',
      badge: 'Phase 0',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      title: 'Zero-Cloud Local Sandbox (Docker Compose)',
      shortDesc: 'Test the complete microservices stack locally with $0 cloud spend.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 0: Run Entire Stack on Local Machine</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify how PostgreSQL, Redis, API Gateway, Inventory Service, and the Apple-style Storefront communicate before touching any cloud provider.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Terminal Commands:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `docker compose -f docker-compose.local.yml up -d --build\ndocker compose -f docker-compose.local.yml ps`,
                    'p0-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p0-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p0-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Boot PostgreSQL, Redis, Gateway, Inventory, Catalog & Storefront
docker compose -f docker-compose.local.yml up -d --build

# 2. Inspect running microservices containers
docker compose -f docker-compose.local.yml ps`}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CUSTOMER STOREFRONT:</span>
                <span className="text-emerald-400 font-bold">http://localhost:3000</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">API GATEWAY REVERSE PROXY:</span>
                <span className="text-cyan-400 font-bold">http://localhost:8080/health</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase1',
      badge: 'Phase 1',
      badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
      title: 'Google Cloud Platform (GCP) Dev Project Setup',
      shortDesc: 'Authenticate gcloud, enable APIs, and configure GCS state bucket.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 1: Setup GCP Development Project</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Initialize your Google Cloud credentials, create the isolated dev project, and provision an encrypted remote Terraform state bucket in GCS.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Step 1.1–1.4 Terminal Runbook:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `# Log into Google Cloud\ngcloud auth login\ngcloud auth application-default login\n\n# Create Dev Project\nexport DEV_PROJECT="ultron-store-dev-$USER"\nexport REGION="us-central1"\ngcloud projects create $DEV_PROJECT --name="ULTRON Store Dev"\ngcloud config set project $DEV_PROJECT\n\n# Enable APIs\ngcloud services enable container.googleapis.com compute.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com\n\n# Create GCS Remote State Bucket\ngcloud storage buckets create gs://ultron-store-tfstate-$USER --project=$DEV_PROJECT --location=$REGION --uniform-bucket-level-access\ngcloud storage buckets update gs://ultron-store-tfstate-$USER --versioning`,
                    'p1-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p1-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p1-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Authenticate with Google Cloud
gcloud auth login
gcloud auth application-default login

# 2. Create your isolated Dev project
export DEV_PROJECT="ultron-store-dev-$USER"
export REGION="us-central1"

gcloud projects create $DEV_PROJECT --name="ULTRON Store Dev"
gcloud config set project $DEV_PROJECT

# 3. Link your billing account (from: gcloud billing accounts list)
export BILLING_ID="YOUR-BILLING-ACCOUNT-ID"
gcloud billing projects link $DEV_PROJECT --billing-account=$BILLING_ID

# 4. Enable Google Cloud APIs
gcloud services enable \\
  container.googleapis.com \\
  compute.googleapis.com \\
  sqladmin.googleapis.com \\
  artifactregistry.googleapis.com \\
  secretmanager.googleapis.com \\
  servicenetworking.googleapis.com

# 5. Create versioned remote state bucket for Terraform
gcloud storage buckets create gs://ultron-store-tfstate-$USER \\
  --project=$DEV_PROJECT \\
  --location=$REGION \\
  --uniform-bucket-level-access

gcloud storage buckets update gs://ultron-store-tfstate-$USER --versioning`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'phase2',
      badge: 'Phase 2',
      badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
      title: 'Infrastructure as Code with Terraform',
      shortDesc: 'Provision VPC, Cloud NAT, GKE Cluster, and Cloud SQL Postgres.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 2: Terraform Init, Plan & Apply</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated provisioning of our enterprise network and managed infrastructure using modular HCL files.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Terraform Workflow:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `cd infrastructure/terraform\nterraform init -backend-config="bucket=ultron-store-tfstate-$USER"\nterraform plan -var-file="environments/dev.tfvars" -out=dev.tfplan\nterraform apply dev.tfplan`,
                    'p2-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p2-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p2-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`cd infrastructure/terraform

# 1. Initialize backend providers and connect to remote state bucket
terraform init -backend-config="bucket=ultron-store-tfstate-$USER"

# 2. Preview resources (VPC, GKE, Cloud SQL, Cloud Armor)
terraform plan -var-file="environments/dev.tfvars" -out=dev.tfplan

# 3. Apply infrastructure (takes ~8-10 minutes for GKE + Cloud SQL)
terraform apply dev.tfplan`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold mb-1">Custom Private VPC</div>
              <div className="text-slate-400 text-[11px]">Strict RFC-1918 subnets with Cloud NAT for egress. No public IPs on nodes.</div>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-bold mb-1">GKE Kubernetes</div>
              <div className="text-slate-400 text-[11px]">Autoscaling node pool (1 to 3 e2-medium nodes) with Workload Identity.</div>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-purple-400 font-bold mb-1">Cloud SQL Postgres</div>
              <div className="text-slate-400 text-[11px]">Private IP database attached to VPC via Google Private Service Access.</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'phase3',
      badge: 'Phase 3',
      badgeColor: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
      title: 'Containerization & Google Artifact Registry',
      shortDesc: 'Build multi-stage Docker images and push to GCP Docker registry.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 3: Build & Push Microservices to Artifact Registry</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Package our 6 services into lightweight OCI-compliant container images and publish them to Google Artifact Registry.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Docker Build & Push Pipeline:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `export REGION="us-central1"\nexport DEV_PROJECT="ultron-store-dev-$USER"\nexport REGISTRY="$REGION-docker.pkg.dev/$DEV_PROJECT/ultron-repo"\nexport GIT_TAG=$(git rev-parse --short HEAD)\n\ngcloud auth configure-docker $REGION-docker.pkg.dev\n\n# Build and push API Gateway\ndocker build -t $REGISTRY/gateway:$GIT_TAG services/gateway\ndocker push $REGISTRY/gateway:$GIT_TAG\n\n# Build and push Inventory Service\ndocker build -t $REGISTRY/inventory-service:$GIT_TAG services/inventory-service\ndocker push $REGISTRY/inventory-service:$GIT_TAG\n\n# Build and push Frontend Store\ndocker build -t $REGISTRY/frontend-store:$GIT_TAG services/frontend-store\ndocker push $REGISTRY/frontend-store:$GIT_TAG`,
                    'p3-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p3-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p3-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Authenticate Docker CLI with Google Cloud Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# 2. Define Registry URL & Tag
export REGISTRY="us-central1-docker.pkg.dev/$DEV_PROJECT/ultron-repo"
export GIT_TAG=$(git rev-parse --short HEAD)

# 3. Build & push microservices:
docker build -t $REGISTRY/gateway:$GIT_TAG services/gateway && docker push $REGISTRY/gateway:$GIT_TAG
docker build -t $REGISTRY/inventory-service:$GIT_TAG services/inventory-service && docker push $REGISTRY/inventory-service:$GIT_TAG
docker build -t $REGISTRY/catalog-service:$GIT_TAG services/catalog-service && docker push $REGISTRY/catalog-service:$GIT_TAG
docker build -t $REGISTRY/order-service:$GIT_TAG services/order-service && docker push $REGISTRY/order-service:$GIT_TAG
docker build -t $REGISTRY/payment-service:$GIT_TAG services/payment-service && docker push $REGISTRY/payment-service:$GIT_TAG
docker build -t $REGISTRY/frontend-store:$GIT_TAG services/frontend-store && docker push $REGISTRY/frontend-store:$GIT_TAG`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'phase4',
      badge: 'Phase 4',
      badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30',
      title: 'Kubernetes Workloads & Kustomize Overlays',
      shortDesc: 'Connect kubectl to GKE, create secrets, and deploy with Kustomize.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 4: Deploying Microservices to GKE</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect your local <code className="text-cyan-300">kubectl</code> to GKE and roll out the staging/dev overlay.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Kubectl Commands:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `# Connect kubectl to cluster\ngcloud container clusters get-credentials ultron-gke-dev --region us-central1 --project $DEV_PROJECT\n\n# Create namespace & secrets\nkubectl create namespace ultron-dev\nkubectl create secret generic ultron-secrets --namespace=ultron-dev --from-literal=POSTGRES_USER=ultron_admin --from-literal=POSTGRES_PASSWORD=ultron_dev_db_super_secret_2026\n\n# Deploy via Kustomize\nkubectl apply -k k8s/overlays/staging/\n\n# Check pods\nkubectl get pods -n ultron-dev -w`,
                    'p4-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p4-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p4-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Download cluster credentials into local kubeconfig
gcloud container clusters get-credentials ultron-gke-dev \\
  --region us-central1 \\
  --project $DEV_PROJECT

# 2. Create application namespace & secrets
kubectl create namespace ultron-dev --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic ultron-secrets \\
  --namespace=ultron-dev \\
  --from-literal=POSTGRES_USER=ultron_admin \\
  --from-literal=POSTGRES_PASSWORD=ultron_dev_db_super_secret_2026 \\
  --from-literal=REDIS_PASSWORD=ultron_redis_dev_secret

# 3. Apply the Staging/Dev Kustomize Overlay
kubectl apply -k k8s/overlays/staging/

# 4. Watch pods stabilize
kubectl get pods -n ultron-dev -w`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'phase5',
      badge: 'Phase 5',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
      title: 'GitOps Continuous Delivery with ArgoCD',
      shortDesc: 'Automate cluster sync and drift correction directly from GitHub.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 5: Install & Connect ArgoCD</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transition from manual <code className="text-cyan-300">kubectl</code> deployment to automated GitOps reconciliation.
            </p>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">ArgoCD Setup:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `kubectl create namespace argocd\nkubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml\n\n# Forward UI port\nkubectl port-forward svc/argocd-server -n argocd 8080:443 &\n\n# Retrieve initial admin password\nkubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo\n\n# Register GitOps application\nkubectl apply -f gitops/argocd/applications/ultron-store-staging.yaml`,
                    'p5-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p5-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p5-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Install ArgoCD in dedicated namespace
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Port-forward UI to your machine
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# 3. Retrieve admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# 4. Register ULTRON Store GitOps Application
kubectl apply -f gitops/argocd/applications/ultron-store-staging.yaml`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'phase6',
      badge: 'Phase 6',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      title: 'Promoting to Production (Prod Project)',
      shortDesc: 'Multi-zonal GKE, HA Cloud SQL, Cloud Armor WAF, and HPA.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 6: Production Promotion & Hardening</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Production uses an isolated GCP project with multi-zone redundancy, Cloud Armor WAF, and automated failover.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-300">Production Differences:</span> Prod runs on <code className="text-white">e2-standard-4</code> nodes with Horizontal Pod Autoscalers (HPA) scaling between 3 to 12 nodes, High-Availability Cloud SQL with automated failover replicas, and Cloud Memorystore Redis.
            </div>
          </div>

          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">Prod Deployment Commands:</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `export PROD_PROJECT="ultron-store-prod-$USER"\ngcloud projects create $PROD_PROJECT --name="ULTRON Store Prod"\ngcloud billing projects link $PROD_PROJECT --billing-account=$BILLING_ID\n\ncd infrastructure/terraform\nterraform init -reconfigure -backend-config="bucket=ultron-store-tfstate-prod-$USER"\nterraform apply -var-file="environments/prod.tfvars"\n\nkubectl apply -k k8s/overlays/prod/`,
                    'p6-code'
                  )
                }
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedCode === 'p6-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'p6-code' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Create Prod GCP Project
export PROD_PROJECT="ultron-store-prod-$USER"
gcloud projects create $PROD_PROJECT --name="ULTRON Store Prod"
gcloud billing projects link $PROD_PROJECT --billing-account=$BILLING_ID

# 2. Deploy Prod Terraform
cd infrastructure/terraform
terraform init -reconfigure -backend-config="bucket=ultron-store-tfstate-prod-$USER"
terraform apply -var-file="environments/prod.tfvars"

# 3. Apply Production Kubernetes Overlays (HPA + PodDisruptionBudgets)
gcloud container clusters get-credentials ultron-gke-prod --region us-central1 --project $PROD_PROJECT
kubectl apply -k k8s/overlays/prod/`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'phase7',
      badge: 'Cost & Teardown',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
      title: 'Cost-Saving Nightly Scaling & Clean Teardown',
      shortDesc: 'Scale GKE nodes to 0 when sleeping; run clean terraform destroy.',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Step 7: Protect Your Budget (Day-2 & Teardown)</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Crucial DevOps hygiene: Never leave idle cloud resources running when not actively practicing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Nightly Cost-Saving Pause (Zero Cost Compute)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you finish practicing for the day, scale the GKE node pool to 0 so Google Cloud stops billing compute hours while you sleep:
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`# Scale to 0 nodes (pause compute bill)
gcloud container clusters resize ultron-gke-dev \\
  --num-nodes=0 --region=us-central1 --project=$DEV_PROJECT

# Next day: scale back up to 2 nodes
gcloud container clusters resize ultron-gke-dev \\
  --num-nodes=2 --region=us-central1 --project=$DEV_PROJECT`}
              </pre>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Complete Clean Teardown</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you are completely finished with the project or want to test tearing down and recreating from scratch:
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-rose-300 overflow-x-auto">
{`cd infrastructure/terraform

# Destroy all cloud resources automatically
terraform destroy -var-file="environments/dev.tfvars" --auto-approve

# Delete dev project (optional)
gcloud projects delete $DEV_PROJECT`}
              </pre>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                DEVOPS RUNBOOK & CLOUD GUIDE
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                REPRODUCIBLE (DEV → PROD)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master Cloud Deployment Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Step-by-step hands-on runbook from zero to Google Cloud Platform (GKE + Cloud SQL + Terraform + ArgoCD). Perfect for aspiring DevOps engineers mastering cloud-native infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Shaun-Trigga96/ULTRON-STORE/blob/main/DEPLOYMENT_GUIDE.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>View in GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Steps Menu */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1 mb-2">
            Execution Steps & Phases:
          </div>
          {sections.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-start justify-between gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0d1117] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sec.badgeColor}`}>
                      {sec.badge}
                    </span>
                    <span className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {sec.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    {sec.shortDesc}
                  </p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Active Section Content Card */}
        <div className="lg:col-span-8 bg-[#161b22] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {currentSection.content}
        </div>
      </div>
    </div>
  );
}
