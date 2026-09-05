import React, { useState } from 'react';
import { ASCII_DIRECTORY_TREE, EXPLORABLE_TREE_DATA } from '../data/repoStructure';
import { FileNode } from '../types';
import { Folder, FolderOpen, FileText, Copy, Check, Search, ChevronRight, ChevronDown, Terminal, FileCode } from 'lucide-react';

export const DirectoryTreeView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ascii' | 'interactive'>('ascii');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    services: true,
    infra: true,
    terraform: true,
    gitops: true,
    k8s: false,
    migration: false,
    observability: false
  });
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  const copyAscii = () => {
    navigator.clipboard.writeText(ASCII_DIRECTORY_TREE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const renderTreeItem = (node: FileNode, depth = 0) => {
    const isDirectory = node.type === 'directory';
    const isExpanded = expandedFolders[node.id] ?? false;
    const isSelected = selectedNode?.id === node.id;

    // Filter match check
    if (searchQuery) {
      const matchSelf = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = node.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChildren = node.children?.some(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!matchSelf && !matchDesc && !matchChildren) {
        return null;
      }
    }

    return (
      <div key={node.id} className="select-none text-xs">
        <div
          onClick={() => {
            if (isDirectory) {
              toggleFolder(node.id);
            }
            setSelectedNode(node);
          }}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 font-medium'
              : 'hover:bg-slate-850/80 text-slate-300'
          }`}
        >
          {isDirectory ? (
            <span className="text-slate-500">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          ) : (
            <span className="w-3.5" />
          )}

          {isDirectory ? (
            isExpanded ? <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" /> : <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : (
            <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
          )}

          <span className="font-mono truncate">{node.name}</span>

          {node.badge && (
            <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-cyan-300 border border-slate-700">
              {node.badge}
            </span>
          )}
        </div>

        {isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Modular Repository Structure
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Deliverable 1: Comprehensive ASCII & Explorable Hierarchy separating Microservices, Terraform GCP, K8s, and GitOps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#010409] p-1 rounded-lg border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'ascii'
                  ? 'bg-slate-800 text-cyan-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ASCII Visual View
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'interactive'
                  ? 'bg-slate-800 text-cyan-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Tree Explorer
            </button>
          </div>

          <button
            onClick={copyAscii}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied ASCII' : 'Copy ASCII'}
          </button>
        </div>
      </div>

      {viewMode === 'ascii' ? (
        /* ASCII View */
        <div className="relative bg-[#010409] text-cyan-50 rounded-xl border border-slate-800 p-6 shadow-md font-mono text-xs overflow-x-auto leading-relaxed">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              Modular Monorepo Layout
            </span>
          </div>
          <pre className="text-emerald-400 selection:bg-emerald-950 selection:text-emerald-200">
            {ASCII_DIRECTORY_TREE}
          </pre>
        </div>
      ) : (
        /* Interactive Explorer View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tree Pane */}
          <div className="md:col-span-2 bg-[#0d1117] rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search files, modules, services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-800 bg-[#010409] text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="border border-slate-800/80 rounded-lg p-2 max-h-[520px] overflow-y-auto bg-[#010409]/40">
              {renderTreeItem(EXPLORABLE_TREE_DATA)}
            </div>
          </div>

          {/* Node Details Inspector */}
          <div className="md:col-span-1 bg-[#0d1117] rounded-xl border border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Component Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#010409] rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                    {selectedNode.type === 'directory' ? (
                      <Folder className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400" />
                    )}
                    {selectedNode.name}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-500/80 mt-1 break-all">
                    {selectedNode.path}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1 font-mono">Architectural Role:</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedNode.description || 'Core repository modular component.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs space-y-2 text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-semibold capitalize text-slate-300">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Environment:</span>
                    <span className="font-semibold text-slate-300">GCP / GKE</span>
                  </div>
                  {selectedNode.badge && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-semibold text-emerald-400">{selectedNode.badge}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Select any folder or file node in the tree to inspect its architectural purpose and configuration context.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
