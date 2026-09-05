import React, { useState, useEffect } from 'react';
import { InventoryPhone, SimulationEventLog } from '../../types';
import { BackendMicroservicesLiveView } from './BackendMicroservicesLiveView';
import {
  Server,
  Database,
  Lock,
  Unlock,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Cpu,
  RefreshCw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

const INITIAL_PHONES: InventoryPhone[] = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    serialNumber: 'SN-APL-15PM-0981',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storageGb: 256,
    color: 'Natural Titanium',
    conditionGrade: 'MINT',
    batteryHealthPct: 98,
    cosmeticRating: 10,
    priceZar: 22499,
    warehouseLocation: 'CPT-WH-01 / BIN-A-12',
    status: 'AVAILABLE',
    lockedBySessionId: null,
    lockedAt: null,
    lockExpiresAt: null,
    heartbeatRenewals: 0
  },
  {
    id: 'ph_02',
    imei: '358291029482109',
    serialNumber: 'SN-SMG-S24U-4820',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storageGb: 512,
    color: 'Titanium Black',
    conditionGrade: 'GOOD',
    batteryHealthPct: 94,
    cosmeticRating: 9,
    priceZar: 19999,
    warehouseLocation: 'JHB-WH-02 / BIN-C-05',
    status: 'AVAILABLE',
    lockedBySessionId: null,
    lockedAt: null,
    lockExpiresAt: null,
    heartbeatRenewals: 0
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    serialNumber: 'SN-GGL-P8P-3319',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storageGb: 128,
    color: 'Bay Blue',
    conditionGrade: 'FAIR',
    batteryHealthPct: 89,
    cosmeticRating: 8,
    priceZar: 14499,
    warehouseLocation: 'CPT-WH-01 / BIN-B-29',
    status: 'AVAILABLE',
    lockedBySessionId: null,
    lockedAt: null,
    lockExpiresAt: null,
    heartbeatRenewals: 0
  }
];

const SQL_SCHEMA_SNIPPET = `-- ============================================================================
-- ULTRON STORE — ENTERPRISE MICROSERVICES DATABASE SCHEMA
-- PostgreSQL 15+ (GCP Cloud SQL Private IP Peering)
-- Invariant: Every refurbished phone is 1-of-1 (Quantity: 1) by IMEI
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES catalog_devices(id),
    imei VARCHAR(15) NOT NULL UNIQUE,          -- Hard unique hardware constraint
    serial_number VARCHAR(32) NOT NULL UNIQUE,
    condition_grade VARCHAR(10) NOT NULL CHECK (condition_grade IN ('MINT', 'GOOD', 'FAIR')),
    battery_health_percentage INT NOT NULL CHECK (battery_health_percentage BETWEEN 50 AND 100),
    cosmetic_scratches_rating INT NOT NULL CHECK (cosmetic_scratches_rating BETWEEN 1 AND 10),
    selling_price_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    active_lock_session_id VARCHAR(128) DEFAULT NULL,
    lock_expires_at TIMESTAMPTZ DEFAULT NULL,
    warehouse_bin_location VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sub-millisecond partial index for storefront filtering
CREATE INDEX idx_inventory_available 
ON inventory_items(device_id, condition_grade, selling_price_cents) 
WHERE status = 'AVAILABLE';

-- Background worker TTL sweep index
CREATE INDEX idx_inventory_lock_expiry 
ON inventory_items(lock_expires_at) 
WHERE status = 'LOCKED_CHECKOUT_HOLD';`;

const REDIS_LUA_SNIPPET = `-- ============================================================================
-- REDIS REDLOCK ATOMIC ACQUIRE SCRIPT (acquire_lock.lua)
-- Key: lock:imei:{IMEI}
-- ARGV[1]: session_id (Buyer Correlation ID)
-- ARGV[2]: ttl_milliseconds (e.g. 600000 = 10m)
-- ============================================================================
local lock_key = KEYS[1]
local session_id = ARGV[1]
local ttl_ms = tonumber(ARGV[2])

-- Atomic SET NX PX (Set if Not eXists with Millisecond Expiry)
local acquired = redis.call('SET', lock_key, session_id, 'NX', 'PX', ttl_ms)

if acquired then
    -- Broadcast event to Redis Pub/Sub topic for WebSocket relay
    local imei = string.match(lock_key, "lock:imei:(%d+)")
    local payload = string.format('{"event":"inventory.locked","imei":"%s","session_id":"%s","ttl_ms":%d}', imei, session_id, ttl_ms)
    redis.call('PUBLISH', 'ultron:inventory:events', payload)
    return 1
else
    return 0 -- Rejected: lock already active
end`;

export function Phase2MicroservicesView() {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'apis' | 'sql' | 'redis' | 'flow'>('simulator');
  const [phones, setPhones] = useState<InventoryPhone[]>(INITIAL_PHONES);
  const [selectedImei, setSelectedImei] = useState<string>('354892019482910');
  const [activeBuyer, setActiveBuyer] = useState<'buyerA' | 'buyerB'>('buyerA');
  const [logs, setLogs] = useState<SimulationEventLog[]>([
    {
      id: 'log_0',
      timestamp: new Date().toLocaleTimeString(),
      eventType: 'websocket.broadcast',
      imei: '354892019482910',
      sessionId: 'sys_init',
      actor: 'GKE Inventory Daemon',
      details: 'WebSocket gateway connected. 3 certified pre-owned units loaded with Quantity: 1 constraint.',
      badgeColor: 'cyan'
    }
  ]);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Timer loop for TTL countdown calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      // Check for expired locks automatically
      setPhones(prev =>
        prev.map(p => {
          if (p.status === 'LOCKED_CHECKOUT_HOLD' && p.lockExpiresAt && Date.now() > p.lockExpiresAt) {
            // Auto expire
            addLog({
              eventType: 'lock.released',
              imei: p.imei,
              sessionId: p.lockedBySessionId || 'unknown',
              actor: 'TTL Expiry Worker',
              details: `10-minute hold on IMEI ${p.imei} expired. Redis lock deleted. Device returned to AVAILABLE pool.`,
              badgeColor: 'amber'
            });
            return {
              ...p,
              status: 'AVAILABLE',
              lockedBySessionId: null,
              lockedAt: null,
              lockExpiresAt: null,
              heartbeatRenewals: 0
            };
          }
          return p;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (log: Omit<SimulationEventLog, 'id' | 'timestamp'>) => {
    const newLog: SimulationEventLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const activePhone = phones.find(p => p.imei === selectedImei) || phones[0];

  // Buyer definitions
  const buyers = {
    buyerA: {
      id: 'sess_cpt_9812',
      name: 'Buyer A (Cape Town)',
      location: 'Western Cape',
      ip: '102.132.8.44'
    },
    buyerB: {
      id: 'sess_jhb_4419',
      name: 'Buyer B (Johannesburg)',
      location: 'Gauteng',
      ip: '197.89.204.12'
    }
  };

  const handleAcquireLock = (buyerKey: 'buyerA' | 'buyerB') => {
    const buyer = buyers[buyerKey];
    const phone = activePhone;

    if (phone.status === 'SOLD') {
      addLog({
        eventType: 'lock.conflict',
        imei: phone.imei,
        sessionId: buyer.id,
        actor: buyer.name,
        details: `Rejected 400 Bad Request: IMEI ${phone.imei} is permanently SOLD.`,
        badgeColor: 'rose'
      });
      return;
    }

    if (phone.status === 'LOCKED_CHECKOUT_HOLD') {
      if (phone.lockedBySessionId === buyer.id) {
        addLog({
          eventType: 'heartbeat.renewed',
          imei: phone.imei,
          sessionId: buyer.id,
          actor: buyer.name,
          details: `Heartbeat acknowledged: Checkout reservation extended by 300s.`,
          badgeColor: 'purple'
        });
        handleRenewHeartbeat(phone.imei);
        return;
      } else {
        // RACE CONDITION / CONFLICT
        const remaining = Math.max(0, Math.ceil(((phone.lockExpiresAt || 0) - Date.now()) / 1000));
        addLog({
          eventType: 'lock.conflict',
          imei: phone.imei,
          sessionId: buyer.id,
          actor: buyer.name,
          details: `HTTP 409 Conflict: Phone is locked by ${phone.lockedBySessionId} (${remaining}s remaining). Redlock atomic rejection.`,
          badgeColor: 'rose'
        });
        return;
      }
    }

    // Acquire lock (600s = 10 minutes)
    const ttlMs = 600000;
    const expiresAt = Date.now() + ttlMs;

    setPhones(prev =>
      prev.map(p =>
        p.imei === phone.imei
          ? {
              ...p,
              status: 'LOCKED_CHECKOUT_HOLD',
              lockedBySessionId: buyer.id,
              lockedAt: Date.now(),
              lockExpiresAt: expiresAt,
              heartbeatRenewals: 0
            }
          : p
      )
    );

    addLog({
      eventType: 'lock.acquired',
      imei: phone.imei,
      sessionId: buyer.id,
      actor: buyer.name,
      details: `Redis Redlock acquired: SET lock:imei:${phone.imei} ${buyer.id} NX PX 600000 (10m TTL). Storefront reservation confirmed.`,
      badgeColor: 'cyan'
    });

    addLog({
      eventType: 'websocket.broadcast',
      imei: phone.imei,
      sessionId: buyer.id,
      actor: 'WebSocket Gateway',
      details: `Broadcast "inventory.locked" to all connected storefronts. Status changed to RESERVED.`,
      badgeColor: 'emerald'
    });
  };

  const handleRenewHeartbeat = (imei: string) => {
    setPhones(prev =>
      prev.map(p => {
        if (p.imei === imei && p.status === 'LOCKED_CHECKOUT_HOLD') {
          const newExpires = (p.lockExpiresAt || Date.now()) + 180000; // +3 minutes
          return {
            ...p,
            lockExpiresAt: newExpires,
            heartbeatRenewals: (p.heartbeatRenewals || 0) + 1
          };
        }
        return p;
      })
    );
  };

  const handleReleaseLock = (imei: string, reason: string = 'User Clicked Cancel / Left Checkout') => {
    const phone = phones.find(p => p.imei === imei);
    if (!phone || phone.status !== 'LOCKED_CHECKOUT_HOLD') return;

    setPhones(prev =>
      prev.map(p =>
        p.imei === imei
          ? {
              ...p,
              status: 'AVAILABLE',
              lockedBySessionId: null,
              lockedAt: null,
              lockExpiresAt: null,
              heartbeatRenewals: 0
            }
          : p
      )
    );

    addLog({
      eventType: 'lock.released',
      imei,
      sessionId: phone.lockedBySessionId || 'unknown',
      actor: 'Redlock Lua Engine',
      details: `Lock released safely: DEL lock:imei:${imei}. Reason: ${reason}. Device returned to AVAILABLE pool.`,
      badgeColor: 'amber'
    });

    addLog({
      eventType: 'websocket.broadcast',
      imei,
      sessionId: phone.lockedBySessionId || 'unknown',
      actor: 'WebSocket Gateway',
      details: `Broadcast "inventory.released" to all clients. Instant real-time unlock.`,
      badgeColor: 'emerald'
    });
  };

  const handleSimulatePayment = (imei: string) => {
    const phone = phones.find(p => p.imei === imei);
    if (!phone) return;

    const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    setPhones(prev =>
      prev.map(p =>
        p.imei === imei
          ? {
              ...p,
              status: 'SOLD',
              lockedBySessionId: null,
              lockedAt: null,
              lockExpiresAt: null
            }
          : p
      )
    );

    addLog({
      eventType: 'inventory.sold',
      imei,
      sessionId: phone.lockedBySessionId || 'sess_verified',
      actor: 'Stripe Webhook Worker',
      details: `Payment confirmed (R${(phone.priceZar).toLocaleString()}). Cloud SQL transaction: UPDATE inventory_items SET status='SOLD', order_id='${orderId}' WHERE imei='${imei}'.`,
      badgeColor: 'emerald'
    });

    addLog({
      eventType: 'websocket.broadcast',
      imei,
      sessionId: phone.lockedBySessionId || 'sess_verified',
      actor: 'WebSocket Gateway',
      details: `Broadcast "inventory.sold" for IMEI ${imei}. Unit permanently removed from all storefront listings.`,
      badgeColor: 'purple'
    });
  };

  const handleResetAll = () => {
    setPhones(INITIAL_PHONES);
    addLog({
      eventType: 'websocket.broadcast',
      imei: 'ALL',
      sessionId: 'sys_admin',
      actor: 'Simulation Admin',
      details: 'Reset all phone inventory states to AVAILABLE.',
      badgeColor: 'cyan'
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getRemainingSeconds = (phone: InventoryPhone) => {
    if (phone.status !== 'LOCKED_CHECKOUT_HOLD' || !phone.lockExpiresAt) return 0;
    return Math.max(0, Math.ceil((phone.lockExpiresAt - currentTime) / 1000));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Phase 02 Deliverable
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Microservices Schema & Real-Time Sync Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Real-Time Inventory Sync & Distributed Redlock Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Sub-millisecond Redis Redlock coordination, PostgreSQL 15 Cloud SQL DDL with IMEI uniqueness (Qty: 1), and WebSocket delta sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Simulator
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono shrink-0 ${
            activeSubTab === 'simulator'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Interactive Redlock Simulator & WebSocket Stream
        </button>

        <button
          onClick={() => setActiveSubTab('apis')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono shrink-0 ${
            activeSubTab === 'apis'
              ? 'border-cyan-500 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Backend Microservices & API Console</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">PORTS 4001-4004</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono shrink-0 ${
            activeSubTab === 'sql'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          PostgreSQL Cloud SQL Schema (DDL)
        </button>

        <button
          onClick={() => setActiveSubTab('redis')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono shrink-0 ${
            activeSubTab === 'redis'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Redis Redlock Lua Scripts
        </button>

        <button
          onClick={() => setActiveSubTab('flow')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 font-mono shrink-0 ${
            activeSubTab === 'flow'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Sequence & Microservices Data Flow
        </button>
      </div>

      {/* TAB 1: INTERACTIVE SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium">Core Constraint</div>
              <div className="text-base font-bold text-white mt-1">Quantity: 1 per Phone</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Unique 15-Digit IMEI PK</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium">Lock Latency</div>
              <div className="text-base font-bold text-cyan-400 mt-1">&lt; 1.2ms (Atomic)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Redis Cluster SET NX PX</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium">Standard Hold Window</div>
              <div className="text-base font-bold text-emerald-400 mt-1">10 Minutes (600s)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Auto-Release TTL Sweep</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium">Real-Time Sync Protocol</div>
              <div className="text-base font-bold text-purple-400 mt-1">WebSockets + Pub/Sub</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero-Polling Delta Broadcast</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Device Selection & State Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Certified Pre-Owned Inventory (Select Unit)</span>
                <span className="text-cyan-400">{phones.length} Units Online</span>
              </div>

              <div className="space-y-3">
                {phones.map(phone => {
                  const isSelected = phone.imei === selectedImei;
                  const remainingSec = getRemainingSeconds(phone);

                  return (
                    <div
                      key={phone.imei}
                      onClick={() => setSelectedImei(phone.imei)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-sm shadow-cyan-500/10'
                          : 'bg-[#0d1117] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {phone.brand} {phone.model}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {phone.storageGb}GB
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Color: {phone.color} • {phone.warehouseLocation}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {phone.status === 'AVAILABLE' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              AVAILABLE
                            </span>
                          )}
                          {phone.status === 'LOCKED_CHECKOUT_HOLD' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-400" />
                              RESERVED ({formatSeconds(remainingSec)})
                            </span>
                          )}
                          {phone.status === 'SOLD' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-purple-400" />
                              SOLD (COMMITTED)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500">IMEI:</span>{' '}
                          <span className="text-cyan-300 font-bold">{phone.imei.slice(-6)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Battery:</span>{' '}
                          <span className="text-emerald-400 font-bold">{phone.batteryHealthPct}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold">R{phone.priceZar.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Active Holder Banner if locked */}
                      {phone.status === 'LOCKED_CHECKOUT_HOLD' && (
                        <div className="mt-3 p-2 rounded bg-[#010409] border border-amber-500/30 text-[11px] flex items-center justify-between text-amber-200">
                          <span className="truncate">Held by: {phone.lockedBySessionId}</span>
                          <span className="shrink-0 font-bold text-amber-400 ml-2">
                            {formatSeconds(remainingSec)} left
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Dual-Buyer Concurrent Race Playground (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Concurrent Checkout Race Workbench
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Target Phone: <span className="text-cyan-300 font-bold">{activePhone.brand} {activePhone.model}</span> (IMEI: <code className="text-white">{activePhone.imei}</code>)
                    </p>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#010409] border border-slate-800 text-slate-300">
                    Status: <strong className={activePhone.status === 'AVAILABLE' ? 'text-emerald-400' : activePhone.status === 'LOCKED_CHECKOUT_HOLD' ? 'text-amber-400' : 'text-purple-400'}>{activePhone.status}</strong>
                  </span>
                </div>

                {/* Two Buyer Simulation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Buyer A */}
                  <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-xs font-bold text-white">Buyer A (Cape Town)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{buyers.buyerA.id}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Session opened on Storefront. Browsing iPhone 15 Pro Max.
                    </p>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleAcquireLock('buyerA')}
                        disabled={activePhone.status === 'SOLD'}
                        className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Buyer A: Lock Phone for Checkout
                      </button>

                      {activePhone.status === 'LOCKED_CHECKOUT_HOLD' && activePhone.lockedBySessionId === buyers.buyerA.id && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSimulatePayment(activePhone.imei)}
                            className="py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirm Payment
                          </button>
                          <button
                            onClick={() => handleReleaseLock(activePhone.imei, 'Buyer A Cancelled')}
                            className="py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Abandon Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buyer B */}
                  <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-xs font-bold text-white">Buyer B (Johannesburg)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{buyers.buyerB.id}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Competing buyer attempting to buy the exact same unique phone.
                    </p>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleAcquireLock('buyerB')}
                        disabled={activePhone.status === 'SOLD'}
                        className="w-full py-2 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Buyer B: Attempt Simultaneous Lock
                      </button>

                      {activePhone.status === 'LOCKED_CHECKOUT_HOLD' && activePhone.lockedBySessionId === buyers.buyerB.id && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSimulatePayment(activePhone.imei)}
                            className="py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirm Payment
                          </button>
                          <button
                            onClick={() => handleReleaseLock(activePhone.imei, 'Buyer B Cancelled')}
                            className="py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Abandon Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Explanation Banner of the Conflict Protection */}
                <div className="p-3.5 rounded-lg bg-[#010409] border border-cyan-500/30 text-xs font-mono space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    How Redlock Prevents Double-Selling:
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Because pre-owned units cannot be back-ordered (Quantity: 1), when Buyer A locks the device, Redis executes <code className="text-cyan-300">SET lock:imei:35489... sess_cpt_9812 NX PX 600000</code>. When Buyer B clicks, the <code className="text-rose-300">NX</code> flag immediately evaluates to <code className="text-rose-300">NIL</code> (atomic rejection). The WebSocket gateway broadcasts a reservation hold to Buyer B’s screen in &lt;10ms.
                  </p>
                </div>
              </div>

              {/* Live Real-Time Event & WebSocket Log Terminal */}
              <div className="bg-[#010409] rounded-xl border border-slate-800 p-4 font-mono text-xs space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-white font-bold text-xs">Live Event Stream & WebSocket Broadcast</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{logs.length} Events Recorded</span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-[11px] leading-relaxed">
                  {logs.map(log => (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-[#0d1117]/80 border border-slate-800/80 flex items-start gap-2.5"
                    >
                      <span className="text-slate-500 shrink-0">{log.timestamp}</span>

                      {log.badgeColor === 'cyan' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                          LOCK_ACQUIRED
                        </span>
                      )}
                      {log.badgeColor === 'rose' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          CONFLICT_409
                        </span>
                      )}
                      {log.badgeColor === 'emerald' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          PAYMENT_COMMITTED
                        </span>
                      )}
                      {log.badgeColor === 'amber' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          LOCK_RELEASED
                        </span>
                      )}
                      {log.badgeColor === 'purple' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          BROADCAST
                        </span>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="text-slate-300 font-medium">{log.actor}:</span>{' '}
                        <span className="text-slate-400">{log.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BACKEND MICROSERVICES & LIVE API CONSOLE */}
      {activeSubTab === 'apis' && (
        <BackendMicroservicesLiveView />
      )}

      {/* TAB 3: POSTGRESQL CLOUD SQL DDL */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold">services/inventory-service/src/schema/database.sql</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                PostgreSQL 15+ Microservices Relational DDL
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Declarative table schemas for catalog devices, 1-of-1 physical IMEI items, checkout reservations, and state audit logs.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(SQL_SCHEMA_SNIPPET, 'sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors shrink-0"
            >
              {copied === 'sql' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied === 'sql' ? 'Copied' : 'Copy DDL SQL'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">Unique Hardware Constraint</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">CONSTRAINT uq_inventory_imei</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Enforces Qty: 1 at database engine level</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">High-Performance Index</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Partial Storefront Index</div>
              <div className="text-[11px] text-slate-500 mt-0.5">WHERE status = 'AVAILABLE'</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">Zero-Loss Compliance</div>
              <div className="text-sm font-bold text-purple-400 mt-1">Postgres Audit Trigger</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Immutable state history records</div>
            </div>
          </div>

          <div className="relative bg-[#010409] text-slate-200 rounded-xl border border-slate-800 p-5 font-mono text-xs overflow-x-auto leading-relaxed max-h-[560px]">
            <pre className="text-cyan-50 selection:bg-cyan-900/80 selection:text-white">
              {SQL_SCHEMA_SNIPPET}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: REDIS REDLOCK LUA SCRIPTS */}
      {activeSubTab === 'redis' && (
        <div className="space-y-4">
          <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold">services/inventory-service/src/schema/redis-redlock.lua</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                Atomic Redis Redlock & Lua Execution Scripts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Guarantees mutual exclusion across distributed GKE pods without race conditions or deadlock.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(REDIS_LUA_SNIPPET, 'lua')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors shrink-0"
            >
              {copied === 'lua' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied === 'lua' ? 'Copied' : 'Copy Lua Script'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">Atomic Execution</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">Single-Threaded Lua</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Evaluated atomically inside Redis</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">Deadlock Prevention</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">PX Millisecond TTL</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Guaranteed auto-release on crash</div>
            </div>

            <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800">
              <div className="text-slate-400">Owner Verification</div>
              <div className="text-sm font-bold text-purple-400 mt-1">Safe Release Script</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Prevents deleting another user's lock</div>
            </div>
          </div>

          <div className="relative bg-[#010409] text-slate-200 rounded-xl border border-slate-800 p-5 font-mono text-xs overflow-x-auto leading-relaxed max-h-[560px]">
            <pre className="text-cyan-50 selection:bg-cyan-900/80 selection:text-white">
              {REDIS_LUA_SNIPPET}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: SEQUENCE & DATA FLOW */}
      {activeSubTab === 'flow' && (
        <div className="bg-[#0d1117] rounded-xl border border-slate-800 p-6 space-y-6 font-mono text-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              End-to-End Real-Time Inventory & Checkout Flow
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Step-by-step transaction lifecycle preventing double-selling during flash sales.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">1</span>
                Storefront Ingress & Catalog Filtering
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Customer browses certified refurbished smartphones. The GKE Inventory Service queries Cloud SQL using the partial index <code className="text-cyan-300">WHERE status = 'AVAILABLE'</code>. Devices cached in Redis with 30s TTL.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">2</span>
                Sub-Millisecond Atomic Lock Acquisition
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Customer clicks "Proceed to Checkout". API Gateway routes request to Inventory Service. The service calls Redis Redlock <code className="text-cyan-300">SET lock:imei:&#123;IMEI&#125; &#123;session_id&#125; NX PX 600000</code>. If lock is acquired, status transitions to <code className="text-amber-300">LOCKED_CHECKOUT_HOLD</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px]">3</span>
                Zero-Polling Real-Time WebSocket Broadcast
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Redis Pub/Sub receives the <code className="text-purple-300">inventory.locked</code> event. The WebSocket Gateway broadcasts the lock event to all active browsers viewing that model. Other buyers immediately see "Reserved by another shopper" in real time without refreshing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">4</span>
                Transactional Cloud SQL Commit on Payment
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Customer completes payment with Stripe/PayGate. The payment webhook calls <code className="text-emerald-300">/api/v1/inventory/commit</code>. A PostgreSQL transaction executes: updates <code className="text-emerald-300">status = 'SOLD'</code>, logs the state change in <code className="text-emerald-300">inventory_state_audit_log</code>, deletes the Redis lock, and broadcasts <code className="text-emerald-300">inventory.sold</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
