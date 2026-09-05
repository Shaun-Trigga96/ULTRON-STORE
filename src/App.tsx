import React, { useState } from 'react';
import { ActiveTab } from './types';
import { ArchitectureView } from './components/ArchitectureView';
import { DirectoryTreeView } from './components/DirectoryTreeView';
import { InitScriptView } from './components/InitScriptView';
import { ReadmeView } from './components/ReadmeView';
import { InfraGitOpsView } from './components/InfraGitOpsView';
import {
  Server,
  FolderTree,
  Terminal,
  BookOpen,
  Layers,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tree');

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 flex flex-col font-sans selection:bg-cyan-900/60 selection:text-cyan-200">
      {/* Top Enterprise Navigation Header */}
      <header className="bg-[#0d1117] border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-slate-900 font-bold shadow-sm shadow-cyan-500/20">
                U
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                  ULTRON <span className="text-cyan-500 italic">Store</span>
                </h1>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-300">GCP / Kubernetes / GitOps</span>
                </div>
              </div>
            </div>

            {/* Phase Progression Indicators */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-medium uppercase tracking-widest font-mono">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Phase 01: Repository
              </span>
              <span className="opacity-40 text-slate-400">Phase 02: Provisioning</span>
              <span className="opacity-40 text-slate-400">Phase 03: Deployment</span>
            </div>

            {/* Cloud Cluster & Telemetry Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  GCP CLUSTER ACTIVE
                </span>
              </div>
              
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#010409] border border-slate-800 text-[11px] font-mono text-slate-400">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>us-central1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables Sub-Navigation Bar */}
        <div className="border-t border-slate-800 bg-[#0d1117]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'tree'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Deliverable 1: Directory Tree</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'script'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Deliverable 2: Init Script (init_repo.sh)</span>
            </button>

            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'readme'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Deliverable 3: README Documentation</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>System Topology</span>
            </button>

            <button
              onClick={() => setActiveTab('gitops-infra')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'gitops-infra'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Terraform & GitOps Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tree' && <DirectoryTreeView />}
        {activeTab === 'script' && <InitScriptView />}
        {activeTab === 'readme' && <ReadmeView />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'gitops-infra' && <InfraGitOpsView />}
      </main>

      {/* Elegant Dark DevOps Footer */}
      <footer className="bg-[#0d1117] border-t border-slate-800 py-3 mt-12 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 italic">
              repo_status: <span className="text-emerald-400 font-semibold not-italic">INITIALIZED</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              commit: <span className="text-slate-300 font-semibold">af71b3e</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              branch: <span className="text-cyan-400 font-semibold">main</span>
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-slate-400">
            <span>
              region: <span className="text-slate-200">us-central1</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>
              orchestrator: <span className="text-slate-200">GKE Autopilot</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>
              iac: <span className="text-slate-200">Terraform v1.6+</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
