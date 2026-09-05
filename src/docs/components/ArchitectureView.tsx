import React, { useState } from 'react';
import { ARCHITECTURE_COMPONENTS } from '../data/repoStructure';
import { Shield, Server, Database, GitBranch, Activity, Cpu, Cloud, CheckCircle2, ArrowRight } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedCompId, setSelectedCompId] = useState<string>('inventory');

  const selectedComp = ARCHITECTURE_COMPONENTS.find(c => c.id === selectedCompId) || ARCHITECTURE_COMPONENTS[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Edge & Ingress': return <Shield className="w-5 h-5 text-amber-400" />;
      case 'Microservices (GKE)': return <Server className="w-5 h-5 text-cyan-400" />;
      case 'Data & Cache': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'CI/CD & GitOps': return <GitBranch className="w-5 h-5 text-purple-400" />;
      case 'Observability': return <Activity className="w-5 h-5 text-rose-400" />;
      default: return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Architecture Summary Banner */}
      <div className="bg-[#0d1117] text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                GCP Enterprise Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                High-Availability Multi-Zone
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              ULTRON Store System Topology
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-mono">
              Scalable e-commerce platform for pre-owned certified smartphones with real-time distributed IMEI locking, GKE autoscaling node pools, and private Cloud SQL database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#010409] px-4 py-3 rounded-lg border border-slate-800 text-center font-mono">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Region</div>
              <div className="text-sm font-bold text-white">us-central1</div>
            </div>
            <div className="bg-[#010409] px-4 py-3 rounded-lg border border-slate-800 text-center font-mono">
              <div className="text-xs text-slate-500 uppercase tracking-wider">K8s Runtime</div>
              <div className="text-sm font-bold text-emerald-400">GKE v1.28</div>
            </div>
            <div className="bg-[#010409] px-4 py-3 rounded-lg border border-slate-800 text-center font-mono">
              <div className="text-xs text-slate-500 uppercase tracking-wider">GitOps Sync</div>
              <div className="text-sm font-bold text-purple-400">ArgoCD</div>
            </div>
          </div>
        </div>

        {/* Visual High-Level Diagram Map */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
            <Cloud className="w-4 h-4 text-cyan-400" />
            End-to-End Traffic & Data Flow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center font-mono">
            <div className="bg-[#010409] rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-amber-400 font-semibold mb-1">1. Ingress & Security</div>
              <div className="text-sm font-bold text-slate-100">Cloud Armor WAF</div>
              <div className="text-xs text-slate-500 mt-1">HTTPS Global Load Balancer</div>
            </div>

            <div className="bg-[#010409] rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-blue-400 font-semibold mb-1">2. Gateway & Storefront</div>
              <div className="text-sm font-bold text-slate-100">Frontend / Ingress</div>
              <div className="text-xs text-slate-500 mt-1">React / CDN Static Assets</div>
            </div>

            <div className="bg-cyan-950/20 rounded-lg p-3 border border-cyan-500/50 ring-1 ring-cyan-500/40">
              <div className="text-xs text-cyan-400 font-semibold mb-1">3. Core Inventory Lock</div>
              <div className="text-sm font-bold text-white">Inventory Service</div>
              <div className="text-xs text-cyan-300 mt-1">Redis Redlock (IMEI Qty: 1)</div>
            </div>

            <div className="bg-[#010409] rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-purple-400 font-semibold mb-1">4. Orders & Payments</div>
              <div className="text-sm font-bold text-slate-100">Order & Payment Svcs</div>
              <div className="text-xs text-slate-500 mt-1">Stripe Webhooks & HPA</div>
            </div>

            <div className="bg-[#010409] rounded-lg p-3 border border-slate-800">
              <div className="text-xs text-emerald-400 font-semibold mb-1">5. Persistent Storage</div>
              <div className="text-sm font-bold text-slate-100">Cloud SQL Postgres</div>
              <div className="text-xs text-slate-500 mt-1">Private IP Peering (No Public IP)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Component Cards & Deep-Dive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Component Selection List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-sm font-bold text-slate-300 tracking-wide uppercase font-mono">
            Architectural Subsystems
          </div>

          <div className="space-y-2">
            {ARCHITECTURE_COMPONENTS.map(comp => {
              const isSelected = comp.id === selectedCompId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/40 text-white'
                      : 'bg-[#0d1117] border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-md bg-[#010409] border border-slate-800 shrink-0">
                    {getCategoryIcon(comp.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                        {comp.category}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                          Active <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white truncate mt-0.5">
                      {comp.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-1 font-mono">
                      {comp.gcpService}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Component Inspector */}
        <div className="lg:col-span-2 bg-[#0d1117] rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded">
                  {selectedComp.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target Service: {selectedComp.gcpService}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-2">
                {selectedComp.title}
              </h3>
            </div>
            <div className="p-3 bg-[#010409] rounded-lg border border-slate-800">
              {getCategoryIcon(selectedComp.category)}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Functional Scope & Context
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {selectedComp.description}
            </p>
          </div>

          <div className="bg-[#010409] border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1 font-mono">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              ULTRON Store Pre-Owned E-Commerce Requirement:
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-mono">
              {selectedComp.keyFeature}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
              Technical Specifications & Implementation Parameters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
              {selectedComp.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded bg-[#010409] border border-slate-800 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div>Managed via: <code className="bg-[#010409] text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono">infrastructure/terraform/</code></div>
            <div>Deployment: <code className="bg-[#010409] text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono">gitops/helm/ultron-store/</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};
