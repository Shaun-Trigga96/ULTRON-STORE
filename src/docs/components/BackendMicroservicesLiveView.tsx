import React, { useState } from 'react';
import {
  Server,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers,
  Activity,
  Terminal,
  RefreshCw,
  Clock,
  ShieldCheck,
  CreditCard,
  Package,
  ShoppingBag
} from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  service: 'inventory' | 'catalog' | 'order' | 'payment' | 'gateway';
  servicePort: number;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultHeaders?: Record<string, string>;
  defaultBody?: any;
}

const ENDPOINTS: EndpointConfig[] = [
  // 1. Inventory Service
  {
    id: 'inv_health',
    name: 'Inventory Health Check',
    service: 'inventory',
    servicePort: 4001,
    method: 'GET',
    path: '/health',
    description: 'Liveness and readiness probe for GKE container lifecycle'
  },
  {
    id: 'inv_items',
    name: 'Get Real-Time Inventory Items',
    service: 'inventory',
    servicePort: 4001,
    method: 'GET',
    path: '/api/v1/inventory/items',
    description: 'Returns available pre-owned units with active lock status and warehouse bins'
  },
  {
    id: 'inv_acquire_lock',
    name: 'Acquire Redis Redlock (SET NX PX)',
    service: 'inventory',
    servicePort: 4001,
    method: 'POST',
    path: '/api/v1/inventory/locks/acquire',
    description: 'Atomically reserves device IMEI with 10-minute TTL to prevent race conditions',
    defaultBody: {
      imei: '354892019482910',
      sessionId: 'sess_cpt_9812',
      ttlMs: 600000
    }
  },
  {
    id: 'inv_release_lock',
    name: 'Release Redis Redlock (Lua Script)',
    service: 'inventory',
    servicePort: 4001,
    method: 'POST',
    path: '/api/v1/inventory/locks/release',
    description: 'Safely releases lock verified against caller session ID',
    defaultBody: {
      imei: '354892019482910',
      sessionId: 'sess_cpt_9812',
      reason: 'USER_CANCELLED_CHECKOUT'
    }
  },
  {
    id: 'inv_schema',
    name: 'Inventory Architecture Schema',
    service: 'inventory',
    servicePort: 4001,
    method: 'GET',
    path: '/api/v1/inventory/schema',
    description: 'Returns database tables and distributed lock specifications'
  },

  // 2. Catalog Service
  {
    id: 'cat_health',
    name: 'Catalog Health Check',
    service: 'catalog',
    servicePort: 4002,
    method: 'GET',
    path: '/health',
    description: 'Catalog microservice health status and total loaded device models'
  },
  {
    id: 'cat_devices',
    name: 'List Certified Devices Catalog',
    service: 'catalog',
    servicePort: 4002,
    method: 'GET',
    path: '/api/v1/catalog/devices',
    description: 'Full device catalog with cosmetic grades, original MSRP, and savings'
  },
  {
    id: 'cat_diagnostics',
    name: '40-Point Hardware Diagnostics Passport',
    service: 'catalog',
    servicePort: 4002,
    method: 'GET',
    path: '/api/v1/catalog/diagnostics/354892019482910',
    description: 'Clean ESN, battery health, OEM OLED colorimeter, and IP68 barometric pressure test'
  },
  {
    id: 'cat_stats',
    name: 'Catalog Analytics & Grade Distribution',
    service: 'catalog',
    servicePort: 4002,
    method: 'GET',
    path: '/api/v1/catalog/stats',
    description: 'Aggregated average battery percentage, pricing metrics, and grade breakdown'
  },

  // 3. Order Service
  {
    id: 'ord_health',
    name: 'Order Service Health Check',
    service: 'order',
    servicePort: 4003,
    method: 'GET',
    path: '/health',
    description: 'Order management engine status and upstream inventory service configuration'
  },
  {
    id: 'ord_checkout',
    name: 'Checkout & Create Order',
    service: 'order',
    servicePort: 4003,
    method: 'POST',
    path: '/api/v1/orders/checkout',
    description: 'Generates ULT-XXXXXX order reference, calculates delivery, and reserves courier tracking',
    defaultBody: {
      customer: {
        name: 'Thabiso Matsaba',
        email: 'thabisomatsaba1976@gmail.com',
        phone: '+27 82 555 0199',
        address: '14 Long Street, Cape Town City Centre',
        city: 'Cape Town',
        postalCode: '8001'
      },
      items: [
        {
          imei: '354892019482910',
          model: 'iPhone 15 Pro Max',
          brand: 'Apple',
          storageGb: 256,
          priceZar: 22499,
          conditionGrade: 'MINT'
        }
      ],
      paymentMethod: 'instant-eft'
    }
  },
  {
    id: 'ord_list',
    name: 'List Orders Ledger',
    service: 'order',
    servicePort: 4003,
    method: 'GET',
    path: '/api/v1/orders',
    description: 'Recent orders with fulfillment status and courier consignment codes'
  },

  // 4. Payment Service
  {
    id: 'pay_health',
    name: 'Payment Service Health Check',
    service: 'payment',
    servicePort: 4004,
    method: 'GET',
    path: '/health',
    description: 'Payment gateway health, supported providers, and idempotency store size'
  },
  {
    id: 'pay_authorize',
    name: 'Authorize Payment with Idempotency Key',
    service: 'payment',
    servicePort: 4004,
    method: 'POST',
    path: '/api/v1/payments/authorize',
    description: 'Processes payment with Idempotency-Key to prevent duplicate customer billing',
    defaultHeaders: {
      'Idempotency-Key': 'idem_key_za_84920'
    },
    defaultBody: {
      orderId: 'ULT-749201',
      amountZar: 22499,
      currency: 'ZAR',
      paymentMethod: 'instant-eft',
      customerEmail: 'customer@ultron.store'
    }
  },
  {
    id: 'pay_ledger',
    name: 'Payment Transactions Ledger',
    service: 'payment',
    servicePort: 4004,
    method: 'GET',
    path: '/api/v1/payments/transactions',
    description: 'Audit log of authorized transactions, gateway fees, and settled amounts'
  },

  // 5. Ingress Gateway
  {
    id: 'gw_health',
    name: 'API Gateway Ingress Health (Nginx)',
    service: 'gateway',
    servicePort: 8080,
    method: 'GET',
    path: '/health',
    description: 'Edge reverse proxy status routing traffic across all microservices'
  }
];

export function BackendMicroservicesLiveView() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('inv_items');
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [requestHeadersText, setRequestHeadersText] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    data: any;
  } | null>(null);

  const selectedEndpoint = ENDPOINTS.find(e => e.id === selectedEndpointId) || ENDPOINTS[0];

  // Sync request body when endpoint changes
  React.useEffect(() => {
    if (selectedEndpoint.defaultBody) {
      setRequestBodyText(JSON.stringify(selectedEndpoint.defaultBody, null, 2));
    } else {
      setRequestBodyText('');
    }

    if (selectedEndpoint.defaultHeaders) {
      setRequestHeadersText(JSON.stringify(selectedEndpoint.defaultHeaders, null, 2));
    } else {
      setRequestHeadersText(JSON.stringify({ 'Content-Type': 'application/json' }, null, 2));
    }
  }, [selectedEndpointId]);

  const handleExecuteRequest = async () => {
    setIsRunning(true);
    const startTime = performance.now();

    // Try fetching from local endpoint if microservice is running locally,
    // or provide accurate simulated backend response
    try {
      const url = `http://localhost:${selectedEndpoint.servicePort}${selectedEndpoint.path}`;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      try {
        if (requestHeadersText) {
          headers = { ...headers, ...JSON.parse(requestHeadersText) };
        }
      } catch (e) {
        // use default
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers
      };

      if (selectedEndpoint.method === 'POST' && requestBodyText) {
        options.body = requestBodyText;
      }

      // Live fetch with 1.5s timeout for fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);

        setResponseOutput({
          status: res.status,
          statusText: res.statusText || (res.status === 200 ? 'OK' : 'Created'),
          durationMs: duration,
          headers: {
            'content-type': 'application/json',
            'x-service': `${selectedEndpoint.service}-service`,
            'x-powered-by': 'ULTRON Microservices Engine'
          },
          data
        });
      } catch (fetchErr) {
        // Generate simulated microservice response based on endpoint
        const duration = Math.floor(2 + Math.random() * 8);
        const mockData = generateMockResponse(selectedEndpoint, requestBodyText);

        setResponseOutput({
          status: selectedEndpoint.method === 'POST' ? 201 : 200,
          statusText: selectedEndpoint.method === 'POST' ? 'Created (Simulated Microservice)' : 'OK (Simulated Microservice)',
          durationMs: duration,
          headers: {
            'content-type': 'application/json',
            'x-service': `${selectedEndpoint.service}-service`,
            'x-cluster-zone': 'europe-west2-a',
            'x-ratelimit-remaining': '998'
          },
          data: mockData
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const generateMockResponse = (ep: EndpointConfig, bodyRaw: string) => {
    let parsedBody: any = {};
    try {
      parsedBody = bodyRaw ? JSON.parse(bodyRaw) : {};
    } catch (e) {
      // ignore
    }

    if (ep.id === 'inv_health') {
      return {
        status: 'UP',
        service: 'inventory-service',
        port: 4001,
        version: '1.0.0',
        activeLocks: 1,
        availableUnits: 4,
        database: 'Cloud SQL PostgreSQL 15 (Connected)',
        redis: 'Memorystore Redis 7.2 (Connected)',
        timestamp: new Date().toISOString()
      };
    }

    if (ep.id === 'inv_items') {
      return {
        success: true,
        count: 5,
        totalCatalog: 5,
        data: [
          {
            id: 'ph_01',
            imei: '354892019482910',
            model: 'iPhone 15 Pro Max',
            brand: 'Apple',
            storageGb: 256,
            color: 'Natural Titanium',
            grade: 'MINT',
            batteryHealth: 98,
            sellingPriceCents: 2249900,
            status: 'AVAILABLE'
          },
          {
            id: 'ph_02',
            imei: '358291029482109',
            model: 'Samsung Galaxy S24 Ultra',
            brand: 'Samsung',
            storageGb: 512,
            color: 'Titanium Black',
            grade: 'GOOD',
            batteryHealth: 94,
            sellingPriceCents: 1999900,
            status: 'AVAILABLE'
          }
        ]
      };
    }

    if (ep.id === 'inv_acquire_lock') {
      return {
        success: true,
        message: 'Redis Redlock acquired successfully',
        lock: {
          success: true,
          conflict: false,
          imei: parsedBody.imei || '354892019482910',
          sessionId: parsedBody.sessionId || 'sess_cpt_9812',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
          ttlSeconds: 600
        }
      };
    }

    if (ep.id === 'inv_release_lock') {
      return {
        success: true,
        message: 'Lock released successfully',
        imei: parsedBody.imei || '354892019482910'
      };
    }

    if (ep.id === 'cat_health') {
      return {
        status: 'UP',
        service: 'catalog-service',
        port: 4002,
        version: '1.0.0',
        totalDevices: 5,
        timestamp: new Date().toISOString()
      };
    }

    if (ep.id === 'cat_devices') {
      return {
        success: true,
        count: 5,
        data: [
          {
            id: 'ph_01',
            brand: 'Apple',
            model: 'iPhone 15 Pro Max',
            conditionGrade: 'MINT',
            priceZar: 22499,
            savingsZar: 6500,
            batteryHealthPct: 98
          },
          {
            id: 'ph_02',
            brand: 'Samsung',
            model: 'Galaxy S24 Ultra',
            conditionGrade: 'GOOD',
            priceZar: 19999,
            savingsZar: 7000,
            batteryHealthPct: 94
          }
        ]
      };
    }

    if (ep.id === 'cat_diagnostics') {
      return {
        success: true,
        imei: '354892019482910',
        serialNumber: 'F2LL89V0PZ',
        model: 'Apple iPhone 15 Pro Max',
        overallResult: 'PASSED_100_PERCENT',
        conditionGrade: 'MINT',
        battery: { healthPercentage: 98, cycleCount: 42, originalOEMPart: true },
        hardwareChecks: [
          { test: 'ESN / Blacklist / Stolen Database Check', status: 'CLEAN_VERIFIED' },
          { test: 'Biometric Face ID', status: 'PASSED', latencyMs: 140 },
          { test: 'OEM OLED Display Colorimeter', status: 'PASSED', trueToneActive: true },
          { test: 'Hermetic Seal Barometric IP68', status: 'PASSED' }
        ]
      };
    }

    if (ep.id === 'ord_checkout') {
      const orderRef = `ULT-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        success: true,
        message: 'Order created and authorized successfully',
        order: {
          orderId: orderRef,
          trackingNumber: `TCG-ZA-${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'CONFIRMED',
          fulfillmentStatus: 'QUEUED_FOR_DISPATCH',
          courier: 'The Courier Guy (Express Overnight Insured)',
          estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          customer: parsedBody.customer || { name: 'Thabiso Matsaba' },
          pricing: {
            subtotalZar: 22499,
            shippingZar: 0,
            vatIncludedZar: 3375,
            grandTotalZar: 22499
          },
          createdAt: new Date().toISOString()
        }
      };
    }

    if (ep.id === 'pay_authorize') {
      return {
        success: true,
        message: 'Payment authorized and settled',
        transaction: {
          transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          orderId: parsedBody.orderId || 'ULT-749201',
          amountZar: parsedBody.amountZar || 22499,
          currency: 'ZAR',
          paymentMethod: parsedBody.paymentMethod || 'instant-eft',
          status: 'SETTLED',
          authorizationCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          gatewayProvider: 'Ozow South Africa',
          feeZar: 337,
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      status: 'UP',
      service: `${ep.service}-service`,
      port: ep.servicePort,
      message: 'OK',
      timestamp: new Date().toISOString()
    };
  };

  const copyResponse = () => {
    if (responseOutput) {
      navigator.clipboard.writeText(JSON.stringify(responseOutput.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Microservices Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              REST APIs, Dockerfiles & Idempotency
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Backend Microservices & Live API Console
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Execute real HTTP requests against the 4 standalone Node.js microservices & Nginx API gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#010409] border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>4 Services + Gateway</span>
          </div>
        </div>
      </div>

      {/* Services Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Service 1: Inventory */}
        <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              Inventory
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PORT 4001
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Redis Redlock & Stock</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>node:20-alpine</span>
          </div>
        </div>

        {/* Service 2: Catalog */}
        <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Catalog
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PORT 4002
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">40-Pt Diagnostics</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>node:20-alpine</span>
          </div>
        </div>

        {/* Service 3: Order */}
        <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              Order
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PORT 4003
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Checkout & Fulfillment</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>node:20-alpine</span>
          </div>
        </div>

        {/* Service 4: Payment */}
        <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Payment
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PORT 4004
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Idempotency & EFT</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>node:20-alpine</span>
          </div>
        </div>

        {/* Service 5: Ingress */}
        <div className="p-3.5 bg-[#0d1117] rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Gateway
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              PORT 8080
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Nginx Ingress Proxy</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>nginx:alpine</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column API Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Directory & Request Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0d1117] rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Select Endpoint to Test</span>
              <span className="text-cyan-400 font-normal">{ENDPOINTS.length} Endpoints</span>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {ENDPOINTS.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpointId(ep.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs font-mono ${
                    selectedEndpointId === ep.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-sm'
                      : 'bg-[#010409] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 text-[10px] rounded font-bold ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="truncate max-w-[210px]">{ep.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">:{ep.servicePort}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">
                    {ep.path}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Request Config Card */}
          <div className="bg-[#0d1117] rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Request Configuration
            </div>

            <div className="p-2.5 bg-[#010409] rounded-lg border border-slate-800 space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target URL:</span>
                <span className="text-cyan-300">
                  http://localhost:{selectedEndpoint.servicePort}{selectedEndpoint.path}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Description:</span>
                <span className="text-slate-300 text-right">{selectedEndpoint.description}</span>
              </div>
            </div>

            {selectedEndpoint.method === 'POST' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  JSON Request Body (Editable):
                </label>
                <textarea
                  rows={6}
                  value={requestBodyText}
                  onChange={e => setRequestBodyText(e.target.value)}
                  className="w-full p-2.5 bg-[#010409] border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <button
              onClick={handleExecuteRequest}
              disabled={isRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-500/20 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching HTTP Call...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Send {selectedEndpoint.method} Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live HTTP Response Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0d1117] rounded-xl p-5 border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">HTTP Response Console</span>
              </div>

              {responseOutput && (
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-xs ${
                      responseOutput.status >= 200 && responseOutput.status < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {responseOutput.status} {responseOutput.statusText}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {responseOutput.durationMs}ms
                  </span>
                  <button
                    onClick={copyResponse}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy response JSON"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {responseOutput ? (
              <div className="space-y-3">
                {/* Headers */}
                <div className="p-2.5 rounded-lg bg-[#010409] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    Response Headers
                  </div>
                  {Object.entries(responseOutput.headers).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-cyan-300">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Body */}
                <div className="relative bg-[#010409] text-slate-200 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
                  <pre className="text-emerald-300 selection:bg-cyan-900/80 selection:text-white">
                    {JSON.stringify(responseOutput.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Server className="w-8 h-8 mx-auto text-slate-600" />
                <div>Click "Send Request" to test live microservice endpoints.</div>
                <div className="text-[11px] text-slate-600">
                  Runs against ports 4001, 4002, 4003, 4004 & 8080.
                </div>
              </div>
            )}
          </div>

          {/* Quick CLI Run Instructions */}
          <div className="bg-[#0d1117] rounded-xl p-4 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>How to Run All Microservices in Local Docker</span>
            </div>
            <div className="p-3 bg-[#010409] rounded-lg border border-slate-800 text-cyan-300 overflow-x-auto">
              <code>docker compose up --build -d</code>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Launches PostgreSQL 15, Redis 7, Inventory Service (4001), Catalog Service (4002), Order Service (4003), Payment Service (4004), and Nginx Ingress Gateway (8080) with automatic network peering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
