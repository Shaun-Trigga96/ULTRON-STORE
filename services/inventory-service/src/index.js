const http = require('http');
const { InventoryLockManager } = require('./services/lockManager');

const PORT = process.env.PORT || 4001;
const lockManager = new InventoryLockManager();

// Initial database records representing Cloud SQL table: inventory_items
const INITIAL_INVENTORY = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    model: 'iPhone 15 Pro Max',
    brand: 'Apple',
    storageGb: 256,
    color: 'Natural Titanium',
    grade: 'MINT',
    batteryHealth: 98,
    cycleCount: 42,
    sellingPriceCents: 2249900,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    serialNumber: 'F2LL89V0PZ'
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
    cycleCount: 112,
    sellingPriceCents: 1999900,
    warehouseLocation: 'JHB-WH-02',
    status: 'AVAILABLE',
    serialNumber: 'R5CW301X9AA'
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    model: 'Google Pixel 8 Pro',
    brand: 'Google',
    storageGb: 128,
    color: 'Bay Blue',
    grade: 'FAIR',
    batteryHealth: 89,
    cycleCount: 198,
    sellingPriceCents: 1449900,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    serialNumber: '38191FDH29'
  },
  {
    id: 'ph_04',
    imei: '359102948291039',
    model: 'iPhone 14 Pro',
    brand: 'Apple',
    storageGb: 256,
    color: 'Deep Purple',
    grade: 'MINT',
    batteryHealth: 96,
    cycleCount: 88,
    sellingPriceCents: 1699900,
    warehouseLocation: 'JHB-WH-02',
    status: 'AVAILABLE',
    serialNumber: 'H90K2801LP'
  },
  {
    id: 'ph_05',
    imei: '861029481920491',
    model: 'OnePlus 12',
    brand: 'OnePlus',
    storageGb: 512,
    color: 'Silky Black',
    grade: 'MINT',
    batteryHealth: 99,
    cycleCount: 18,
    sellingPriceCents: 1599900,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    serialNumber: 'OP12998412'
  }
];

let inventoryItems = JSON.parse(JSON.stringify(INITIAL_INVENTORY));

// Helper to parse JSON body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health Endpoint
    if (pathname === '/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'inventory-service',
        port: PORT,
        version: '1.0.0',
        activeLocks: lockManager.locks.size,
        availableUnits: inventoryItems.filter(i => i.status === 'AVAILABLE').length,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Get All Inventory Items
    if ((pathname === '/api/v1/inventory/items' || pathname === '/api/v1/inventory/phones') && req.method === 'GET') {
      const grade = url.searchParams.get('grade');
      const brand = url.searchParams.get('brand');
      const status = url.searchParams.get('status');

      let filtered = [...inventoryItems];
      if (grade && grade !== 'ALL') filtered = filtered.filter(i => i.grade === grade);
      if (brand && brand !== 'ALL') filtered = filtered.filter(i => i.brand.toUpperCase() === brand.toUpperCase());
      if (status) filtered = filtered.filter(i => i.status === status);

      return sendJson(res, 200, {
        success: true,
        count: filtered.length,
        totalCatalog: inventoryItems.length,
        data: filtered
      });
    }

    // 3. Get Single Item by IMEI
    const itemMatch = pathname.match(/^\/api\/v1\/inventory\/items\/([0-9a-zA-Z_]+)$/);
    if (itemMatch && req.method === 'GET') {
      const imei = itemMatch[1];
      const item = inventoryItems.find(i => i.imei === imei || i.id === imei);
      if (!item) {
        return sendJson(res, 404, { success: false, error: `Device with IMEI ${imei} not found` });
      }

      // Check current lock status
      const lockKey = `lock:imei:${item.imei}`;
      const isLocked = lockManager.locks.has(lockKey);
      const meta = lockManager.lockMeta.get(lockKey);

      return sendJson(res, 200, {
        success: true,
        data: {
          ...item,
          isLocked,
          lockHolder: meta ? meta.sessionId : null,
          lockExpiresAt: meta ? new Date(meta.expiresAt).toISOString() : null
        }
      });
    }

    // 4. Redlock Acquire Lock
    if (pathname === '/api/v1/inventory/locks/acquire' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const { imei, sessionId = `sess_${Date.now()}`, ttlMs = 900000 } = body;

      if (!imei) {
        return sendJson(res, 400, { success: false, error: 'Missing required parameter: imei' });
      }

      const item = inventoryItems.find(i => i.imei === imei);
      if (!item) {
        return sendJson(res, 404, { success: false, error: `Item with IMEI ${imei} not found` });
      }

      if (item.status === 'SOLD') {
        return sendJson(res, 409, { success: false, error: 'Device has already been sold and dispatched' });
      }

      const result = await lockManager.acquireLock(imei, sessionId, ttlMs);
      if (result.success) {
        // Update item status to reflect hold
        item.status = 'LOCKED_CHECKOUT_HOLD';
        return sendJson(res, 200, {
          success: true,
          message: 'Redis Redlock acquired successfully',
          lock: result
        });
      } else {
        return sendJson(res, 409, {
          success: false,
          message: result.message,
          conflict: result
        });
      }
    }

    // 5. Redlock Release Lock
    if (pathname === '/api/v1/inventory/locks/release' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const { imei, sessionId, reason = 'USER_RELEASE' } = body;

      if (!imei) {
        return sendJson(res, 400, { success: false, error: 'Missing parameter: imei' });
      }

      const result = await lockManager.releaseLock(imei, sessionId, reason);
      const item = inventoryItems.find(i => i.imei === imei);
      if (item && item.status === 'LOCKED_CHECKOUT_HOLD') {
        item.status = 'AVAILABLE';
      }

      return sendJson(res, result.success ? 200 : 400, result);
    }

    // 6. Check Lock Status
    if (pathname === '/api/v1/inventory/locks/status' && (req.method === 'GET' || req.method === 'POST')) {
      let imei = url.searchParams.get('imei');
      if (!imei && req.method === 'POST') {
        const body = await parseRequestBody(req);
        imei = body.imei;
      }

      if (!imei) {
        return sendJson(res, 400, { success: false, error: 'Missing imei parameter' });
      }

      const key = `lock:imei:${imei}`;
      const isLocked = lockManager.locks.has(key);
      const meta = lockManager.lockMeta.get(key);

      return sendJson(res, 200, {
        imei,
        isLocked,
        meta: meta || null
      });
    }

    // 7. Update Item Status (e.g., mark SOLD upon order confirmation)
    const statusMatch = pathname.match(/^\/api\/v1\/inventory\/items\/([0-9a-zA-Z_]+)\/status$/);
    if (statusMatch && req.method === 'POST') {
      const imei = statusMatch[1];
      const body = await parseRequestBody(req);
      const { status } = body;

      const item = inventoryItems.find(i => i.imei === imei || i.id === imei);
      if (!item) {
        return sendJson(res, 404, { success: false, error: `Device ${imei} not found` });
      }

      if (['AVAILABLE', 'LOCKED_CHECKOUT_HOLD', 'SOLD'].includes(status)) {
        item.status = status;
        // If marked SOLD, clear lock
        if (status === 'SOLD') {
          lockManager.locks.delete(`lock:imei:${item.imei}`);
          lockManager.lockMeta.delete(`lock:imei:${item.imei}`);
        }
        return sendJson(res, 200, { success: true, item });
      } else {
        return sendJson(res, 400, { success: false, error: 'Invalid status. Must be AVAILABLE, LOCKED_CHECKOUT_HOLD, or SOLD' });
      }
    }

    // 8. Reset Inventory
    if (pathname === '/api/v1/inventory/reset' && req.method === 'POST') {
      inventoryItems = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
      lockManager.locks.clear();
      lockManager.lockMeta.clear();
      return sendJson(res, 200, { success: true, message: 'Inventory and Redlock states reset to baseline' });
    }

    // 9. Architecture / Schema
    if (pathname === '/api/v1/inventory/schema' && req.method === 'GET') {
      return sendJson(res, 200, {
        engine: 'PostgreSQL 15+ & Redis 7.2 Redlock',
        tables: ['catalog_devices', 'inventory_items', 'checkout_reservations', 'inventory_state_audit_log'],
        primaryInvariant: 'Unique IMEI per unit (Quantity: 1)',
        lockMechanism: 'Sub-millisecond Redis Redlock with 15m TTL',
        compliance: 'POPIA / Clean ESN Certified'
      });
    }

    // Default 404
    return sendJson(res, 404, { success: false, error: `Route ${req.method} ${pathname} not found` });
  } catch (err) {
    console.error('Inventory Service Error:', err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error', message: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Inventory Service] Listening on http://0.0.0.0:${PORT}`);
});
