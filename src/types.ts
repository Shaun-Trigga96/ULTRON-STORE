export type ActiveTab = 'architecture' | 'tree' | 'script' | 'readme' | 'gitops-infra';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  description?: string;
  badge?: string;
  children?: FileNode[];
  content?: string;
}

export interface ArchitectureComponent {
  id: string;
  title: string;
  category: 'Edge & Ingress' | 'Microservices (GKE)' | 'Data & Cache' | 'CI/CD & GitOps' | 'Observability';
  description: string;
  gcpService: string;
  specs: string[];
  keyFeature: string;
}
