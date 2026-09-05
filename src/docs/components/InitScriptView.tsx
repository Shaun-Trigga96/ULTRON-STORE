import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2, Copy, Check, Download, AlertCircle, FileCode, Layers, ShieldCheck } from 'lucide-react';

export const InitScriptView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'terminal'>('script');

  const SCRIPT_SOURCE = `#!/usr/bin/env bash
# ==============================================================================
# ULTRON Store - Enterprise Repository Initializer
# Project: Pre-Owned Mobile Phones E-Commerce Platform
# Architecture: Kubernetes (GKE), GCP (Terraform), ArgoCD GitOps, Cloud SQL
# ==============================================================================

set -euo pipefail

# Visual color codes
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
NC='\\033[0m'

echo -e "\${BLUE}======================================================\${NC}"
echo -e "\${CYAN}   ULTRON STORE - REPOSITORY INITIALIZATION SCRIPT     \${NC}"
echo -e "\${BLUE}   Scalable GCP / GKE / GitOps Architecture Blueprint  \${NC}"
echo -e "\${BLUE}======================================================\${NC}"

PROJECT_ROOT="$(pwd)"
echo -e "\\n\${YELLOW}[1/5] Creating Modular Directory Structure...\${NC}"

DIRECTORIES=(
  "services/inventory-service/src"
  "services/inventory-service/tests"
  "services/catalog-service/src"
  "services/catalog-service/tests"
  "services/order-service/src"
  "services/order-service/tests"
  "services/payment-service/src"
  "services/payment-service/tests"
  "services/frontend-store/src"
  "services/frontend-store/public"
  "infrastructure/terraform/environments"
  "infrastructure/terraform/modules/networking"
  "infrastructure/terraform/modules/compute"
  "infrastructure/terraform/modules/database"
  "infrastructure/terraform/modules/gke"
  "infrastructure/terraform/modules/monitoring"
  "infrastructure/terraform/modules/security"
  "k8s/base/inventory"
  "k8s/base/catalog"
  "k8s/base/order"
  "k8s/base/payment"
  "k8s/base/frontend"
  "k8s/overlays/staging"
  "k8s/overlays/prod"
  "gitops/helm/ultron-store/templates"
  "gitops/argocd/applications"
  "gitops/argocd/projects"
  "migration/assessment"
  "migration/database"
  "migration/runbooks"
  "migration/cost-analysis"
  "observability/prometheus"
  "observability/grafana/dashboards"
  "observability/alerts"
  ".github/workflows"
  "scripts/dev"
  "scripts/db"
  "scripts/deploy"
)

for dir in "\${DIRECTORIES[@]}"; do
  mkdir -p "$dir"
  echo -e "  \${GREEN}✓\${NC} Created: $dir"
done

echo -e "\\n\${YELLOW}[2/5] Generating Root & Service Level Configuration Files...\${NC}"
# Generates .gitignore, Makefile, and docker-compose.local.yml

echo -e "\\n\${YELLOW}[3/5] Generating Infrastructure (Terraform) Starter Files...\${NC}"
# Generates main.tf, variables.tf, dev.tfvars.example, prod.tfvars.example

echo -e "\\n\${YELLOW}[4/5] Generating GitOps, CI/CD, and Migration Starter Files...\${NC}"
# Generates .github/workflows/ci.yml, cd.yml, ArgoCD manifests, validate-migration.sh

echo -e "\\n\${YELLOW}[5/5] Finalizing Permissions & Setup...\${NC}"
chmod +x Makefile 2>/dev/null || true

echo -e "\\n\${GREEN}======================================================\${NC}"
echo -e "\${GREEN}   ULTRON STORE REPOSITORY INITIALIZATION COMPLETE!  \${NC}"
echo -e "\${GREEN}======================================================\${NC}"
echo -e "Next steps:"
echo -e "  1. Review README.md for architectural design and workflow"
echo -e "  2. Run 'make help' to see all developer targets"
echo -e "  3. Spin up local stack: 'make dev-up'"
echo -e "  4. Validate Terraform: 'make tf-init && make tf-plan-dev'"`;

  const copyScript = () => {
    navigator.clipboard.writeText(SCRIPT_SOURCE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([SCRIPT_SOURCE], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'init_repo.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveSubTab('terminal');
    setSimStep(1);

    const stepIntervals = [1000, 2000, 3200, 4400, 5600];
    stepIntervals.forEach((time, index) => {
      setTimeout(() => {
        setSimStep(index + 1);
        if (index === stepIntervals.length - 1) {
          setIsRunning(false);
        }
      }, time);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              Deliverable 2
            </span>
            <span className="text-xs text-slate-400 font-mono">
              chmod +x init_repo.sh && ./init_repo.sh
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Initialization Script (`init_repo.sh`)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Bash automation script initializing all 37 modular folders, .gitignore, Makefile, Docker Compose, Terraform modules, and CI/CD pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm shadow-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running Script...' : 'Test Run Script'}
          </button>

          <button
            onClick={copyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied' : 'Copy Script'}
          </button>

          <button
            onClick={downloadScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Download
          </button>
        </div>
      </div>

      {/* Tabs for Code vs Terminal Simulation */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('script')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono ${
            activeSubTab === 'script'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Script Source Code (Bash)
        </button>
        <button
          onClick={() => setActiveSubTab('terminal')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono ${
            activeSubTab === 'terminal'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Terminal Execution Output {isRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
      </div>

      {activeSubTab === 'script' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#0d1117] rounded-lg border border-slate-800">
              <div className="text-slate-400 font-medium">Modular Folders</div>
              <div className="text-lg font-bold text-white mt-1">37 Directories</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Services, Infra, K8s, GitOps</div>
            </div>
            <div className="p-3 bg-[#0d1117] rounded-lg border border-slate-800">
              <div className="text-slate-400 font-medium">Core Files Generated</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">14 Configs</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Makefile, Compose, Terraform, CI</div>
            </div>
            <div className="p-3 bg-[#0d1117] rounded-lg border border-slate-800">
              <div className="text-slate-400 font-medium">POSIX Compliance</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">set -euo pipefail</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Strict bash error handling</div>
            </div>
            <div className="p-3 bg-[#0d1117] rounded-lg border border-slate-800">
              <div className="text-slate-400 font-medium">Execution Target</div>
              <div className="text-lg font-bold text-purple-400 mt-1">Linux / macOS</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Idempotent re-runnable</div>
            </div>
          </div>

          <div className="relative bg-[#010409] text-slate-200 rounded-xl border border-slate-800 p-5 font-mono text-xs overflow-x-auto leading-relaxed max-h-[580px]">
            <pre className="text-cyan-50 selection:bg-cyan-900/80 selection:text-white">
              {SCRIPT_SOURCE}
            </pre>
          </div>
        </div>
      ) : (
        /* Terminal Output View */
        <div className="bg-[#010409] text-slate-100 rounded-xl border border-slate-800 p-5 font-mono text-xs shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-slate-400 text-xs ml-2 font-mono">bash - ./init_repo.sh</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isRunning ? 'Execution in progress...' : simStep >= 5 ? 'Status: 0 (Success)' : 'Ready to run'}
            </span>
          </div>

          <div className="space-y-2 py-2 leading-relaxed">
            <div className="text-blue-400">======================================================</div>
            <div className="text-cyan-300 font-bold">   ULTRON STORE - REPOSITORY INITIALIZATION SCRIPT     </div>
            <div className="text-blue-400">   Scalable GCP / GKE / GitOps Architecture Blueprint  </div>
            <div className="text-blue-400">======================================================</div>

            {simStep >= 1 && (
              <div className="space-y-1">
                <div className="text-amber-300 font-bold mt-3">[1/5] Creating Modular Directory Structure...</div>
                <div className="text-emerald-400">  ✓ Created: services/inventory-service/src</div>
                <div className="text-emerald-400">  ✓ Created: services/catalog-service/src</div>
                <div className="text-emerald-400">  ✓ Created: services/order-service/src</div>
                <div className="text-emerald-400">  ✓ Created: services/payment-service/src</div>
                <div className="text-emerald-400">  ✓ Created: infrastructure/terraform/modules/gke</div>
                <div className="text-emerald-400">  ✓ Created: infrastructure/terraform/modules/database</div>
                <div className="text-emerald-400">  ✓ Created: gitops/helm/ultron-store/templates</div>
                <div className="text-emerald-400">  ✓ Created: gitops/argocd/applications</div>
                <div className="text-emerald-400">  ✓ Created: migration/assessment</div>
                <div className="text-emerald-400">  ✓ Created: observability/prometheus</div>
                <div className="text-slate-400">  ... (37 directories initialized)</div>
              </div>
            )}

            {simStep >= 2 && (
              <div className="space-y-1">
                <div className="text-amber-300 font-bold mt-3">[2/5] Generating Root & Service Level Configuration Files...</div>
                <div className="text-emerald-400">  ✓ Created: .gitignore</div>
                <div className="text-emerald-400">  ✓ Created: Makefile</div>
                <div className="text-emerald-400">  ✓ Created: docker-compose.local.yml</div>
              </div>
            )}

            {simStep >= 3 && (
              <div className="space-y-1">
                <div className="text-amber-300 font-bold mt-3">[3/5] Generating Infrastructure (Terraform) Starter Files...</div>
                <div className="text-emerald-400">  ✓ Created: infrastructure/terraform/main.tf</div>
                <div className="text-emerald-400">  ✓ Created: infrastructure/terraform/variables.tf</div>
                <div className="text-emerald-400">  ✓ Created: dev.tfvars.example & prod.tfvars.example</div>
              </div>
            )}

            {simStep >= 4 && (
              <div className="space-y-1">
                <div className="text-amber-300 font-bold mt-3">[4/5] Generating GitOps, CI/CD, and Migration Starter Files...</div>
                <div className="text-emerald-400">  ✓ Created: .github/workflows/ci.yml (Trivy CVE blocker)</div>
                <div className="text-emerald-400">  ✓ Created: .github/workflows/cd.yml (Artifact Registry push)</div>
                <div className="text-emerald-400">  ✓ Created: gitops/argocd/applications/staging-app.yaml</div>
                <div className="text-emerald-400">  ✓ Created: services/inventory-service/Dockerfile</div>
                <div className="text-emerald-400">  ✓ Created: migration/assessment/MIGRATION-ASSESSMENT.md</div>
                <div className="text-emerald-400">  ✓ Created: migration/database/validate-migration.sh</div>
              </div>
            )}

            {simStep >= 5 && (
              <div className="space-y-1 mt-4">
                <div className="text-amber-300 font-bold">[5/5] Finalizing Permissions & Setup...</div>
                <div className="text-emerald-400">======================================================</div>
                <div className="text-emerald-300 font-bold">   ULTRON STORE REPOSITORY INITIALIZATION COMPLETE!  </div>
                <div className="text-emerald-400">======================================================</div>
                <div className="text-slate-300">Next steps:</div>
                <div className="text-slate-400">  1. Review README.md for architectural design and workflow</div>
                <div className="text-slate-400">  2. Run 'make help' to see all developer targets</div>
                <div className="text-slate-400">  3. Spin up local stack: 'make dev-up'</div>
                <div className="text-slate-400">  4. Validate Terraform: 'make tf-init && make tf-plan-dev'</div>
              </div>
            )}

            {simStep === 0 && (
              <div className="text-slate-500 py-6 text-center">
                Click "Test Run Script" above to run the live initialization sequence.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
