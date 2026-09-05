const http = require('http');
const { InventoryLockManager } = require('./services/lockManager');

const PORT = process.env.PORT || 4001;
const lockManager = new InventoryLockManager();

// In-memory catalog store representing Cloud SQL database table
const inventoryItems = [
  {
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
    imei: '358291029482109',
    model: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    storageGb: 512,
    color: 'Titanium Black',
    grade: 'GOOD',
    batteryHealth: 94,
    sellingPriceCents: 1999900,
    status: 'AVAILABLE'
  },
  {
    imei: '867123901827461',
    model: 'Google Pixel 8 Pro',
    brand: 'Google',
    storageGb: 128,
    color: 'Bay Blue',
    grade: 'FAIR',
    batteryHealth: 89,
    sellingPriceCents: 1449900,
    status: 'AVAILABLE'
  }
];

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'inventory-service',
      phase: 'Phase 02: Microservices & Real-Time Sync',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.url === '/api/v1/inventory/phones') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ULTRON Store Real-Time Inventory Sync Active',
      phase: 'Phase 02',
      itemsCount: inventoryItems.length,
      data: inventoryItems
    }));
    return;
  }

  // Schema definition endpoint
  if (req.url === '/api/v1/inventory/schema') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      engine: 'PostgreSQL 15+ & Redis 7.2 Redlock',
      tables: ['catalog_devices', 'inventory_items', 'checkout_reservations', 'inventory_state_audit_log'],
      primaryInvariant: 'Unique IMEI per unit (Quantity: 1)',
      lockMechanism: 'Sub-millisecond Redis Redlock with 10m TTL'
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
});

server.listen(PORT, () => {
  console.log(`[Phase 2] Inventory Service running on port ${PORT}`);
});

