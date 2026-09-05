# ULTRON Store: Cloud Migration Assessment (On-Premise Docker Compose -> GCP GKE)

## 1. Executive Summary
- **Current System**: Monolithic / Multi-container Docker Compose running on dedicated on-prem hardware.
- **Target Platform**: Google Kubernetes Engine (GKE) + Cloud SQL PostgreSQL + Redis Memorystore + Cloud Armor WAF.
- **Migration Strategy**: Rehost (Lift-and-Shift) with concurrent Replatforming (Managed DB & Containerized Microservices).

## 2. Inventory & Dependencies
| Component | Technology | Target GCP Service | Migration Path |
|---|---|---|---|
| Ingress / SSL | Nginx on-prem | Google Cloud HTTPS Load Balancer + Cloud Armor | Replace with GCP Global LB & Managed Certs |
| Inventory & IMEI | Node.js + Redis | GKE Pods + Redis Memorystore (HA) | Containerize & Helm chart deploy |
| Product Catalog | Spring/Node.js | GKE Pods | Migrate to GKE Auto-scaling Deployment |
| Order & Cart | Node.js | GKE Pods with HPA | Migrate with Horizontal Pod Autoscaler |
| Primary Database | PostgreSQL 14 (on-prem) | Cloud SQL for PostgreSQL 15 | pg_dump / DMS -> Cloud SQL Private IP |

## 3. Risk Matrix & Mitigations
- **Risk**: Inventory race conditions during high-demand phone drop cutover.
  - *Mitigation*: Redis distributed locking (`Redlock`), 90-second item reservation hold window.
- **Risk**: Database replication lag during final cutover.
  - *Mitigation*: Pre-migration delta replication, maintenance window off-peak (02:00 SAST), binary log syncing.
