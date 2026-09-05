import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, ExternalLink, ShieldCheck, Terminal, Server, Layers } from 'lucide-react';

export const ReadmeView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');

  const copyMarkdown = () => {
    // Read the current README content
    fetch('/README.md')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              Deliverable 3
            </span>
            <span className="text-xs text-slate-400 font-mono">
              README.md (Production-Ready)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Project Documentation & Architecture Guide
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Full enterprise documentation detailing ULTRON Store scope, technical specs from Projects 1-3, local setup, and CI/CD pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied Markdown' : 'Copy README.md'}
          </button>
        </div>
      </div>

      {/* Main Documentation Card */}
      <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-sm p-6 sm:p-8 space-y-8 text-slate-300">
        {/* Title & Badges */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-purple-300 border border-slate-700">
              Terraform 1.6+
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
              Google Cloud Platform
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-blue-300 border border-slate-700">
              GKE Kubernetes v1.28
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-amber-300 border border-slate-700">
              ArgoCD GitOps v2.9
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-emerald-300 border border-slate-700">
              Cloud SQL Postgres 15
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-rose-300 border border-slate-700">
              Trivy Vulnerability Gate
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ULTRON Store — Enterprise Cloud Platform & E-Commerce Infrastructure
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            High-availability, auto-scaling platform for pre-owned certified mobile phones featuring real-time inventory locking, declarative GCP infrastructure, and zero-downtime GitOps deployment.
          </p>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-mono">1.</span>
            Executive Summary & Project Scope
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Unlike traditional retail where products have identical barcodes and hundreds of inventory units per SKU, refurbished and pre-owned smartphone commerce has a unique constraint: <strong className="text-white">every single listed phone is one-of-a-kind (Quantity: 1)</strong> with a distinct <strong className="text-cyan-300 font-mono">IMEI serial number, battery health percentage, and cosmetic condition grade (Mint, Good, Fair)</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-[#010409] border border-slate-800">
              <div className="font-bold text-xs text-white mb-1 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Real-Time Inventory & Locking
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-millisecond Redis distributed locks prevent two concurrent buyers from checking out the exact same physical phone during high-demand drops.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#010409] border border-slate-800">
              <div className="font-bold text-xs text-white mb-1 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Elastic Auto-Scaling
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                GKE Horizontal Pod Autoscalers (HPA) and GCP Managed Instance Groups scale pods and nodes from 2 up to 10 instances during traffic surges.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#010409] border border-slate-800">
              <div className="font-bold text-xs text-white mb-1 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Declarative GitOps Delivery
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single source of truth in Git. ArgoCD reconciles GKE cluster state automatically with zero-downtime rolling updates.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#010409] border border-slate-800">
              <div className="font-bold text-xs text-white mb-1 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Zero-Loss Cloud Migration
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured 6R migration roadmap from on-premise Docker Compose to Cloud SQL and GKE with automated data integrity verification.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Architecture Overview */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-mono">2.</span>
            Architectural Specifications (Projects 1, 2, & 3)
          </h2>

          <div className="space-y-4 text-xs">
            {/* Project 1 Spec */}
            <div className="p-4 rounded-lg bg-[#010409] border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="font-bold text-sm text-cyan-300 mb-1 font-mono">
                From PROJECT-1: Terraform GCP Platform & Networking
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 mt-2">
                <li><strong className="text-white">Custom VPC Network:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-cyan-300 font-mono">10.0.0.0/16</code> with isolated public (<code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-cyan-300 font-mono">10.0.1.0/24</code>) and private (<code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-cyan-300 font-mono">10.0.2.0/24</code>) subnets.</li>
                <li><strong className="text-white">Cloud NAT:</strong> Private GKE worker nodes reach external container registries and APIs without public IPs.</li>
                <li><strong className="text-white">Cloud SQL PostgreSQL 15:</strong> Strictly private IP via VPC Peering; no public IPv4 address. Passwords bound via Google Secret Manager.</li>
                <li><strong className="text-white">Edge Security:</strong> Global HTTPS Load Balancer with Cloud Armor WAF rules to block DDoS, XSS, and SQL injection.</li>
              </ul>
            </div>

            {/* Project 2 Spec */}
            <div className="p-4 rounded-lg bg-[#010409] border border-slate-800 hover:border-purple-500/40 transition-colors">
              <div className="font-bold text-sm text-purple-300 mb-1 font-mono">
                From PROJECT-2: GitOps CI/CD Pipeline & ArgoCD
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 mt-2">
                <li><strong className="text-white">Dual-Repo / Modular Pattern:</strong> Application code separated from declarative Kubernetes deployment configurations.</li>
                <li><strong className="text-white">Quality & CVE Gate:</strong> GitHub Actions runs multi-job pipelines executing Jest unit tests and Trivy container scans (<code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-purple-300 font-mono">--exit-code 1 --severity CRITICAL</code>).</li>
                <li><strong className="text-white">Helm Chart Templating:</strong> Umbrella chart in <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-purple-300 font-mono">gitops/helm/ultron-store</code> with environment-specific values for Staging and Production.</li>
                <li><strong className="text-white">ArgoCD Pull-Based Sync:</strong> Automated reconciliation with self-healing, pruning, and 1-command rollback via <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-purple-300 font-mono">git revert</code>.</li>
              </ul>
            </div>

            {/* Project 3 Spec */}
            <div className="p-4 rounded-lg bg-[#010409] border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="font-bold text-sm text-emerald-300 mb-1 font-mono">
                From PROJECT-3: Cloud Migration Simulation & Observability
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 mt-2">
                <li><strong className="text-white">Legacy On-Prem Simulation:</strong> Multi-container Docker Compose running services, Nginx reverse proxy, and local PostgreSQL (<code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-emerald-300 font-mono">docker-compose.local.yml</code>).</li>
                <li><strong className="text-white">Database Cutover Runbook:</strong> Scheduled 90-minute maintenance window at 02:00 SAST using consistent mysqldump/pg_dump snapshots uploaded to GCS.</li>
                <li><strong className="text-white">Data Integrity Verification:</strong> Automated bash script (<code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-emerald-300 font-mono">validate-migration.sh</code>) certifying row counts and checksum parity.</li>
                <li><strong className="text-white">Full Observability Stack:</strong> Prometheus + Grafana via <code className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-emerald-300 font-mono">kube-prometheus-stack</code> scraping metrics for P99 latency and active locks.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Quickstart Instructions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-mono">3.</span>
            Local Development & Quickstart Commands
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="text-slate-400 mb-1">1. Initialize the Workspace</div>
              <pre className="bg-[#010409] text-cyan-200 p-3 rounded-lg border border-slate-800 font-mono">
                chmod +x init_repo.sh && ./init_repo.sh
              </pre>
            </div>

            <div>
              <div className="text-slate-400 mb-1">2. Spin Up Local Microservices Stack</div>
              <pre className="bg-[#010409] text-cyan-200 p-3 rounded-lg border border-slate-800 font-mono">
                make dev-up
              </pre>
            </div>

            <div>
              <div className="text-slate-400 mb-1">3. Provision GCP Infrastructure with Terraform</div>
              <pre className="bg-[#010409] text-cyan-200 p-3 rounded-lg border border-slate-800 font-mono">
                make tf-init{"\n"}
                make tf-plan-dev{"\n"}
                make tf-apply-dev
              </pre>
            </div>

            <div>
              <div className="text-slate-400 mb-1">4. Deploy ArgoCD Applications to GKE</div>
              <pre className="bg-[#010409] text-cyan-200 p-3 rounded-lg border border-slate-800 font-mono">
                kubectl apply -f gitops/argocd/applications/staging-app.yaml{"\n"}
                argocd app get ultron-store-staging
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
