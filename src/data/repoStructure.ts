import { FileNode, ArchitectureComponent } from '../types';

export const ASCII_DIRECTORY_TREE = `ultron-store/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # PR Quality Gate, Unit Tests & Trivy CVE Scanner
│       └── cd.yml                     # Build, Artifact Registry push & GitOps manifest update
├── services/                          # Microservices Source Code & Tests
│   ├── gateway/                       # API Gateway reverse proxy & routing layer
│   │   ├── Dockerfile                 # Lightweight container image
│   │   ├── src/                       # Dynamic route proxy & CORS config
│   │   └── package.json
│   ├── inventory-service/             # Real-time IMEI locking & Redis state sync
│   │   ├── Dockerfile                 # Multi-stage container build (non-root)
│   │   ├── src/                       # API controllers & WebSocket pub/sub
│   │   └── tests/                     # Concurrency & race condition unit tests
│   ├── catalog-service/               # Phone models, IMEI specs & condition grading
│   │   ├── Dockerfile
│   │   ├── src/
│   │   └── tests/
│   ├── order-service/                 # Checkout flow & cart reservation hold timers
│   │   ├── Dockerfile
│   │   ├── src/
│   │   └── tests/
│   ├── payment-service/               # Stripe webhook ingestion & idempotent transactions
│   │   ├── Dockerfile
│   │   ├── src/
│   │   └── tests/
│   └── frontend-store/                # Customer storefront (Apple aesthetic, 40-point diagnostics)
│       ├── Dockerfile
│       ├── src/
│       │   ├── App.jsx                # Interactive store with studio photography & Redlock hold
│       │   └── main.jsx
│       └── public/
├── infrastructure/                    # Infrastructure as Code (Terraform)
│   └── terraform/
│       ├── main.tf                    # Root composition invoking modules
│       ├── variables.tf               # Global variable declarations
│       ├── outputs.tf                 # GKE endpoint, LB IP, Cloud SQL connection
│       ├── environments/
│       │   ├── dev.tfvars.example     # Staging/Dev environment overrides
│       │   └── prod.tfvars.example    # Production HA environment overrides
│       └── modules/
│           ├── networking/            # Custom VPC, private subnets & Cloud NAT
│           ├── compute/               # Managed Instance Groups & Autoscaler
│           ├── gke/                   # Autoscaling GKE Cluster (Workload Identity)
│           ├── database/              # Cloud SQL PostgreSQL 15 (Private IP only)
│           ├── monitoring/            # Cloud Monitoring dashboards & Uptime checks
│           └── security/              # Cloud Armor WAF rules & Secret Manager
├── k8s/                               # Raw Kubernetes Manifests (Base & Overlays)
│   ├── base/
│   │   ├── inventory/                 # Deployment, Service & HPA definitions
│   │   ├── catalog/
│   │   ├── order/
│   │   ├── payment/
│   │   └── frontend/
│   └── overlays/
│       ├── staging/                   # Staging replica count & resource limits
│       └── prod/                      # Multi-replica HA, PDBs & anti-affinity
├── gitops/                            # Declarative Continuous Delivery
│   ├── helm/
│   │   └── ultron-store/              # Master Helm Chart
│   │       ├── Chart.yaml             # Chart metadata
│   │       ├── values.yaml            # Base default values
│   │       ├── values-staging.yaml    # Staging image tag & configuration
│   │       ├── values-prod.yaml       # Production image tag & HA configuration
│   │       └── templates/             # Deployments, Services, Ingress, HPA
│   └── argocd/
│       └── applications/
│           ├── staging-app.yaml       # Auto-sync staging Application CRD
│           └── prod-app.yaml          # Manual approval production Application CRD
├── migration/                         # On-Premises to GCP Migration Suite
│   ├── assessment/
│   │   └── MIGRATION-ASSESSMENT.md    # 6R evaluation & cutover risk matrix
│   ├── database/
│   │   ├── init.sql                   # Schema definition & baseline seeds
│   │   └── validate-migration.sh      # Data validation & row-count verifier
│   ├── runbooks/
│   │   └── RUNBOOK-migration.md       # Step-by-step 90-min cutover playbook
│   └── cost-analysis/
│       └── COST-ANALYSIS.md           # On-prem vs GCP 3-year TCO comparison
├── observability/                     # Monitoring & Alerting
│   ├── prometheus/                    # ServiceMonitors & scrape intervals
│   ├── grafana/                       # Dashboards (IMEI lock contention, QPS, P99)
│   └── alerts/                        # AlertManager high-priority rules
├── docker-compose.local.yml           # Multi-container local development & migration stack
├── Makefile                           # DevOps target runner (dev-up, tf-plan, test, etc.)
├── init_repo.sh                       # Executable repository bootstrapper script
├── .gitignore                         # Security & artifact exclusions
└── README.md                          # Full architectural & developer documentation`;

export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  {
    id: 'edge',
    title: 'Cloud Armor & Global HTTPS Load Balancer',
    category: 'Edge & Ingress',
    description: 'Enterprise ingress layer providing DDoS mitigation, WAF security rules (OWASP Top 10, SQLi, XSS filtering), and SSL termination with Google-managed certificates.',
    gcpService: 'Google Cloud Armor + Cloud Load Balancing',
    specs: ['Global Anycast IP', 'Cloud Armor Security Policy', 'Backend Services with Health Checks', 'SSL Termination on Port 443'],
    keyFeature: 'Protects ULTRON Store flash sales from bot scraping and distributed Denial-of-Service attacks.'
  },
  {
    id: 'gke',
    title: 'GKE Autoscaling Microservice Cluster',
    category: 'Microservices (GKE)',
    description: 'High-availability Kubernetes cluster spanning multi-zone node pools. Uses Horizontal Pod Autoscalers (HPA) and GKE Cluster Autoscaler to handle 10x traffic surges during device drops.',
    gcpService: 'Google Kubernetes Engine (GKE)',
    specs: ['Private Node Pools (e2-standard-4)', 'Workload Identity enabled', 'NetworkPolicy pod isolation', 'RollingUpdate: maxSurge 1, maxUnavailable 0'],
    keyFeature: 'Hosts Inventory, Catalog, Order, Payment, and Frontend pods with zero-downtime rolling deployments.'
  },
  {
    id: 'inventory',
    title: 'Real-Time Inventory & IMEI Lock Engine',
    category: 'Microservices (GKE)',
    description: 'Custom microservice engineered specifically for refurbished/pre-owned phones where each listed item is unique (Qty: 1) with an immutable IMEI and diagnostic battery condition grade.',
    gcpService: 'GKE Pods + Redis Memorystore',
    specs: ['Sub-millisecond Redlock algorithm', '90-second checkout reservation hold', 'WebSocket push updates to client browsers', 'Automatic release on cart abandonment'],
    keyFeature: 'Guarantees that two concurrent buyers can never check out the same physical pre-owned smartphone.'
  },
  {
    id: 'data',
    title: 'Cloud SQL PostgreSQL 15 & Redis Memorystore',
    category: 'Data & Cache',
    description: 'Managed database tier isolated strictly inside private subnets via Private Service Connect (zero public internet exposure). Automated backups and point-in-time recovery.',
    gcpService: 'Cloud SQL (PostgreSQL 15) + Memorystore (Redis 7)',
    specs: ['Private IP Only (10.0.2.0/24)', 'Automated daily snapshots + WAL archiving', 'Master + Standby High Availability', 'Password secured via Secret Manager'],
    keyFeature: 'Zero data-loss storage for orders, transactions, IMEI hardware histories, and diagnostic audit logs.'
  },
  {
    id: 'gitops',
    title: 'ArgoCD & GitHub Actions CI/CD Pipeline',
    category: 'CI/CD & GitOps',
    description: 'Pull-based declarative GitOps pipeline. Commits trigger GitHub Actions for automated unit testing and Trivy container vulnerability scanning, with ArgoCD continuously reconciling state.',
    gcpService: 'Artifact Registry + ArgoCD on GKE',
    specs: ['Trivy CVE blocker on CRITICAL', 'Multi-stage Docker builds', 'Automated staging sync with self-healing', 'Manual promotion gate for production releases'],
    keyFeature: 'Eliminates configuration drift and enables 1-click audit-safe rollbacks via Git revert.'
  },
  {
    id: 'observability',
    title: 'Prometheus, Grafana & Cloud Monitoring',
    category: 'Observability',
    description: 'End-to-end telemetry collecting application metrics (Micrometer/Prometheus), cluster health, Redis lock latency, and Cloud SQL connection pool saturation.',
    gcpService: 'kube-prometheus-stack + Cloud Monitoring',
    specs: ['Prometheus ServiceMonitors', 'Custom Grafana Dashboards', 'AlertManager Pager integration', 'Uptime Checks with 60s frequency'],
    keyFeature: 'Real-time visibility into checkout failure rates, pod CPU/memory utilization, and database bottlenecks.'
  }
];

export const EXPLORABLE_TREE_DATA: FileNode = {
  id: 'root',
  name: 'ultron-store',
  type: 'directory',
  path: '/',
  description: 'Enterprise repository root for ULTRON Store e-commerce platform',
  children: [
    {
      id: 'services',
      name: 'services',
      type: 'directory',
      path: '/services',
      description: 'Microservices source code, tests, and Dockerfiles',
      children: [
        {
          id: 'svc-gateway',
          name: 'gateway',
          type: 'directory',
          path: '/services/gateway',
          description: 'Unified API Gateway reverse proxy routing client requests to microservices',
          badge: 'Reverse Proxy',
          children: [
            { id: 'gate-docker', name: 'Dockerfile', type: 'file', path: '/services/gateway/Dockerfile', description: 'Container image for proxy layer' },
            { id: 'gate-src', name: 'src/index.js', type: 'file', path: '/services/gateway/src/index.js', description: 'Reverse proxy server with dynamic routing & health probes' },
            { id: 'gate-pkg', name: 'package.json', type: 'file', path: '/services/gateway/package.json', description: 'Express & http-proxy-middleware dependencies' }
          ]
        },
        {
          id: 'svc-inventory',
          name: 'inventory-service',
          type: 'directory',
          path: '/services/inventory-service',
          description: 'Real-time IMEI locking and Redis inventory sync engine',
          badge: 'Core Engine',
          children: [
            { id: 'inv-docker', name: 'Dockerfile', type: 'file', path: '/services/inventory-service/Dockerfile', description: 'Multi-stage container build with non-root security context' },
            { id: 'inv-src', name: 'src/index.js', type: 'file', path: '/services/inventory-service/src/index.js', description: 'HTTP server & inventory state endpoints' },
            { id: 'inv-test', name: 'tests/inventory.test.js', type: 'file', path: '/services/inventory-service/tests/inventory.test.js', description: 'Concurrency & race condition test suite' }
          ]
        },
        {
          id: 'svc-catalog',
          name: 'catalog-service',
          type: 'directory',
          path: '/services/catalog-service',
          description: 'Phone device specs, IMEI tracking, and cosmetic grading ratings',
          children: [
            { id: 'cat-docker', name: 'Dockerfile', type: 'file', path: '/services/catalog-service/Dockerfile', description: 'Alpine container packaging' },
            { id: 'cat-src', name: 'src/catalog.js', type: 'file', path: '/services/catalog-service/src/catalog.js', description: 'Phone specifications & condition grade handler' }
          ]
        },
        {
          id: 'svc-order',
          name: 'order-service',
          type: 'directory',
          path: '/services/order-service',
          description: 'Checkout workflow, cart reservation timers, and order creation',
          children: [
            { id: 'ord-docker', name: 'Dockerfile', type: 'file', path: '/services/order-service/Dockerfile', description: 'Optimized production runner image' },
            { id: 'ord-src', name: 'src/order.js', type: 'file', path: '/services/order-service/src/order.js', description: 'Cart lock and checkout orchestration logic' }
          ]
        },
        {
          id: 'svc-payment',
          name: 'payment-service',
          type: 'directory',
          path: '/services/payment-service',
          description: 'Payment gateway webhooks, idempotency verification, and refunds',
          children: [
            { id: 'pay-docker', name: 'Dockerfile', type: 'file', path: '/services/payment-service/Dockerfile', description: 'Secure payment runner' },
            { id: 'pay-src', name: 'src/payment.js', type: 'file', path: '/services/payment-service/src/payment.js', description: 'Stripe webhook receiver & idempotency key store' }
          ]
        },
        {
          id: 'svc-frontend',
          name: 'frontend-store',
          type: 'directory',
          path: '/services/frontend-store',
          description: 'Customer storefront with Apple iStore aesthetic, studio photography & Redlock hold',
          badge: 'UI Storefront',
          children: [
            { id: 'front-docker', name: 'Dockerfile', type: 'file', path: '/services/frontend-store/Dockerfile', description: 'Vite multi-stage Nginx production container' },
            { id: 'front-src-app', name: 'src/App.jsx', type: 'file', path: '/services/frontend-store/src/App.jsx', description: 'Apple-style storefront UI with 40-point diagnostics' },
            { id: 'front-src-main', name: 'src/main.jsx', type: 'file', path: '/services/frontend-store/src/main.jsx', description: 'React 18 entrypoint' }
          ]
        }
      ]
    },
    {
      id: 'infra',
      name: 'infrastructure',
      type: 'directory',
      path: '/infrastructure',
      description: 'Declarative Infrastructure as Code managed with Terraform',
      children: [
        {
          id: 'terraform',
          name: 'terraform',
          type: 'directory',
          path: '/infrastructure/terraform',
          badge: 'Terraform 1.6+',
          children: [
            { id: 'tf-main', name: 'main.tf', type: 'file', path: '/infrastructure/terraform/main.tf', description: 'Root module declaring GCS backend and linking modules' },
            { id: 'tf-var', name: 'variables.tf', type: 'file', path: '/infrastructure/terraform/variables.tf', description: 'Input variables for project, region, cluster size' },
            { id: 'tf-out', name: 'outputs.tf', type: 'file', path: '/infrastructure/terraform/outputs.tf', description: 'Exported endpoints (GKE cluster, Load Balancer IP)' },
            {
              id: 'tf-env',
              name: 'environments',
              type: 'directory',
              path: '/infrastructure/terraform/environments',
              children: [
                { id: 'tf-dev', name: 'dev.tfvars.example', type: 'file', path: '/infrastructure/terraform/environments/dev.tfvars.example', description: 'Staging parameters (cost-optimized e2-micro/standard)' },
                { id: 'tf-prod', name: 'prod.tfvars.example', type: 'file', path: '/infrastructure/terraform/environments/prod.tfvars.example', description: 'Production parameters (multi-zone HA, e2-standard-4)' }
              ]
            },
            {
              id: 'tf-mod',
              name: 'modules',
              type: 'directory',
              path: '/infrastructure/terraform/modules',
              children: [
                { id: 'mod-net', name: 'networking', type: 'directory', path: '/infrastructure/terraform/modules/networking', description: 'VPC, public/private subnets, Cloud NAT, firewall' },
                { id: 'mod-gke', name: 'gke', type: 'directory', path: '/infrastructure/terraform/modules/gke', description: 'GKE cluster, autoscaling node pools, Workload Identity' },
                { id: 'mod-db', name: 'database', type: 'directory', path: '/infrastructure/terraform/modules/database', description: 'Cloud SQL PostgreSQL 15, private IP peering, backups' },
                { id: 'mod-mon', name: 'monitoring', type: 'directory', path: '/infrastructure/terraform/modules/monitoring', description: 'Uptime checks, CPU/memory alerts, notification channels' },
                { id: 'mod-sec', name: 'security', type: 'directory', path: '/infrastructure/terraform/modules/security', description: 'Cloud Armor WAF rules and Secret Manager bindings' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k8s',
      name: 'k8s',
      type: 'directory',
      path: '/k8s',
      description: 'Kubernetes declarative specs organized with Kustomize base & overlays',
      children: [
        {
          id: 'k8s-base',
          name: 'base',
          type: 'directory',
          path: '/k8s/base',
          children: [
            { id: 'k8s-b-inv', name: 'inventory', type: 'directory', path: '/k8s/base/inventory', description: 'Deployment, Service, and HPA for inventory' },
            { id: 'k8s-b-cat', name: 'catalog', type: 'directory', path: '/k8s/base/catalog', description: 'Catalog service base manifests' },
            { id: 'k8s-b-ord', name: 'order', type: 'directory', path: '/k8s/base/order', description: 'Order service base manifests' },
            { id: 'k8s-b-pay', name: 'payment', type: 'directory', path: '/k8s/base/payment', description: 'Payment service base manifests' }
          ]
        },
        {
          id: 'k8s-overlays',
          name: 'overlays',
          type: 'directory',
          path: '/k8s/overlays',
          children: [
            { id: 'k8s-o-stg', name: 'staging', type: 'directory', path: '/k8s/overlays/staging', description: 'Staging replicas, resource limits, namespace overrides' },
            { id: 'k8s-o-prd', name: 'prod', type: 'directory', path: '/k8s/overlays/prod', description: 'Production HA replicas, PDBs, anti-affinity rules' }
          ]
        }
      ]
    },
    {
      id: 'gitops',
      name: 'gitops',
      type: 'directory',
      path: '/gitops',
      description: 'GitOps Continuous Delivery with Helm and ArgoCD',
      badge: 'GitOps Single Source',
      children: [
        {
          id: 'gitops-helm',
          name: 'helm/ultron-store',
          type: 'directory',
          path: '/gitops/helm/ultron-store',
          children: [
            { id: 'helm-chart', name: 'Chart.yaml', type: 'file', path: '/gitops/helm/ultron-store/Chart.yaml', description: 'Helm chart definition and version metadata' },
            { id: 'helm-val', name: 'values.yaml', type: 'file', path: '/gitops/helm/ultron-store/values.yaml', description: 'Default values across microservices' },
            { id: 'helm-stg', name: 'values-staging.yaml', type: 'file', path: '/gitops/helm/ultron-store/values-staging.yaml', description: 'Staging values updated automatically by CD pipeline' },
            { id: 'helm-prd', name: 'values-prod.yaml', type: 'file', path: '/gitops/helm/ultron-store/values-prod.yaml', description: 'Production values with promotion approval gate' }
          ]
        },
        {
          id: 'gitops-argo',
          name: 'argocd/applications',
          type: 'directory',
          path: '/gitops/argocd/applications',
          children: [
            { id: 'argo-stg', name: 'staging-app.yaml', type: 'file', path: '/gitops/argocd/applications/staging-app.yaml', description: 'Auto-syncing ArgoCD Application CRD for staging' },
            { id: 'argo-prd', name: 'prod-app.yaml', type: 'file', path: '/gitops/argocd/applications/prod-app.yaml', description: 'Production Application CRD with manual sync gate' }
          ]
        }
      ]
    },
    {
      id: 'migration',
      name: 'migration',
      type: 'directory',
      path: '/migration',
      description: 'On-premise Docker Compose to GKE migration strategy & runbooks',
      children: [
        { id: 'mig-assess', name: 'assessment/MIGRATION-ASSESSMENT.md', type: 'file', path: '/migration/assessment/MIGRATION-ASSESSMENT.md', description: '6R assessment, inventory, and risk matrix' },
        { id: 'mig-val', name: 'database/validate-migration.sh', type: 'file', path: '/migration/database/validate-migration.sh', description: 'Data integrity validation & row count verifier' },
        { id: 'mig-run', name: 'runbooks/RUNBOOK-migration.md', type: 'file', path: '/migration/runbooks/RUNBOOK-migration.md', description: '90-minute cutover checklist & rollback guide' },
        { id: 'mig-cost', name: 'cost-analysis/COST-ANALYSIS.md', type: 'file', path: '/migration/cost-analysis/COST-ANALYSIS.md', description: 'TCO comparison: On-prem vs GCP with CUDs' }
      ]
    },
    {
      id: 'observability',
      name: 'observability',
      type: 'directory',
      path: '/observability',
      description: 'Prometheus ServiceMonitors, Grafana dashboards, Alert rules',
      children: [
        { id: 'obs-prom', name: 'prometheus/service-monitors.yaml', type: 'file', path: '/observability/prometheus/service-monitors.yaml', description: 'Prometheus endpoint scrapers for Spring/Node actuators' },
        { id: 'obs-graf', name: 'grafana/dashboards/ultron-overview.json', type: 'file', path: '/observability/grafana/dashboards/ultron-overview.json', description: 'Grafana dashboard: IMEI lock contention, QPS, P99' },
        { id: 'obs-alt', name: 'alerts/critical-alerts.yaml', type: 'file', path: '/observability/alerts/critical-alerts.yaml', description: 'AlertManager rules for 5xx spikes & DB saturation' }
      ]
    },
    { id: 'f-compose', name: 'docker-compose.local.yml', type: 'file', path: '/docker-compose.local.yml', description: 'Multi-container local emulation & migration source stack' },
    { id: 'f-make', name: 'Makefile', type: 'file', path: '/Makefile', description: 'Developer and DevOps task runner targets' },
    { id: 'f-init', name: 'init_repo.sh', type: 'file', path: '/init_repo.sh', badge: 'Executable', description: 'Runnable bash script initializing all directories and starter templates' },
    { id: 'f-ignore', name: '.gitignore', type: 'file', path: '/.gitignore', description: 'Enterprise gitignore rules for terraform state, secrets, and node_modules' },
    { id: 'f-readme', name: 'README.md', type: 'file', path: '/README.md', badge: 'Production Ready', description: 'Comprehensive architectural and operational documentation' }
  ]
};
