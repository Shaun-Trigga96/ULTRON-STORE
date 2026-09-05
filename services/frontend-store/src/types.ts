export type ActiveTab = 'storefront' | 'phase2-sync' | 'phase3-terraform' | 'phase4-gitops' | 'deploy-guide' | 'tree' | 'script' | 'readme' | 'architecture' | 'gitops-infra';

export interface CartItem {
  phone: InventoryPhone;
  reservedAt: number;
  expiresAt: number;
}

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

export interface InventoryPhone {
  id: string;
  imei: string;
  serialNumber: string;
  brand: string;
  model: string;
  storageGb: number;
  color: string;
  conditionGrade: 'MINT' | 'GOOD' | 'FAIR';
  batteryHealthPct: number;
  cosmeticRating: number; // 1-10
  priceZar: number;
  warehouseLocation: string;
  status: 'AVAILABLE' | 'LOCKED_CHECKOUT_HOLD' | 'RESERVED_PAYMENT_PENDING' | 'SOLD';
  lockedBySessionId?: string | null;
  lockedAt?: number | null;
  lockExpiresAt?: number | null;
  heartbeatRenewals?: number;
}

export interface SimulationEventLog {
  id: string;
  timestamp: string;
  eventType: 'lock.acquired' | 'lock.conflict' | 'lock.released' | 'heartbeat.renewed' | 'inventory.sold' | 'websocket.broadcast';
  imei: string;
  sessionId: string;
  actor: string;
  details: string;
  badgeColor: 'cyan' | 'emerald' | 'rose' | 'amber' | 'purple';
}

