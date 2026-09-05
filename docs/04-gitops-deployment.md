# 4. Production Deployment (GitOps / ArgoCD)

The production infrastructure is defined completely as code (Infrastructure-as-Code) and deployed using the GitOps philosophy via **ArgoCD** and **Kustomize**.

## Directory Structure
All deployment configuration is located in the `gitops/` folder:

```text
gitops/
├── argocd-app.yaml              # ArgoCD Application CRD
└── manifests/
    ├── kustomization.yaml       # Kustomize root
    ├── namespace.yaml           # Kubernetes Namespace
    ├── datastores.yaml          # Redis & PostgreSQL (StatefulSet)
    ├── gateway.yaml             # Nginx LoadBalancer & ConfigMap
    └── *-service.yaml           # Microservice Deployments & Services
```

## How GitOps Works in ULTRON
1. **Declarative State:** The desired state of the entire Kubernetes cluster is committed to the `main` branch.
2. **Continuous Monitoring:** The `argocd-app.yaml` file points ArgoCD to the `gitops/manifests` path.
3. **Automated Syncing:** ArgoCD continually watches the repository. If you merge a PR updating the frontend image tag or altering a database environment variable, ArgoCD detects the drift and immediately applies the updates to the cluster.
4. **Self-Healing:** If an operator manually deletes a Deployment inside the cluster, ArgoCD will immediately recreate it to match the repository.

## Applying the Pipeline
Assuming you have a Kubernetes cluster running with ArgoCD installed:

```bash
kubectl apply -f gitops/argocd-app.yaml
```

ArgoCD will automatically create the `ultron-prod` namespace, inject the Nginx ConfigMap, stand up the Redis/PostgreSQL datastores, scale up the microservices (`replicas: 2` for high availability), and wire up the Kubernetes Services.
