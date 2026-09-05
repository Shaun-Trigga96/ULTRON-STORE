const http = require('http');
const { pool, query } = require('./db');
const { InventoryLockManager } = require('./services/lockManager');

const PORT = process.env.PORT || 4001;
const lockManager = new InventoryLockManager();

async function seedInventoryDb() {
  try {
    // 1. Fetch catalog devices to map them to inventory
    const { rows: devices } = await query('SELECT id, brand, model_name FROM ultron_catalog.catalog_devices LIMIT 10');
    if (devices.length === 0) {
      console.log('Catalog is empty. Cannot seed inventory yet.');
      return;
    }

    const { rows: currentInventory } = await query('SELECT count(*) FROM ultron_inventory.inventory_items');
    if (parseInt(currentInventory[0].count) === 0) {
      console.log('Seeding ultron_inventory.inventory_items...');
      
      const appleId = devices.find(d => d.brand === 'Apple')?.id;
      const samsungId = devices.find(d => d.brand === 'Samsung')?.id;

      if (appleId) {
        await query(
          `INSERT INTO ultron_inventory.inventory_items 
          (device_id, imei, serial_number, condition_grade, battery_health_percentage, cosmetic_scratches_rating, inspection_id, inspector_technician_id, selling_price_cents, status)
          VALUES ($1, '354892019482910', 'F2LL89V0PZ', 'MINT', 98, 10, 'INS-8491', 'TECH-8491', 2249900, 'AVAILABLE')
          ON CONFLICT DO NOTHING`,
          [appleId]
        );
      }
      
      if (samsungId) {
        await query(
          `INSERT INTO ultron_inventory.inventory_items 
          (device_id, imei, serial_number, condition_grade, battery_health_percentage, cosmetic_scratches_rating, inspection_id, inspector_technician_id, selling_price_cents, status)
          VALUES ($1, '358291029482109', '38191FDH29', 'GOOD', 92, 8, 'INS-8492', 'TECH-8491', 1999900, 'AVAILABLE')
          ON CONFLICT DO NOTHING`,
          [samsungId]
        );
      }
      console.log('Inventory seeding complete.');
    }
  } catch (err) {
    console.error('Inventory DB seed error:', err.message);
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

// Ensure payload parses correctly
const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try { resolve(body ? JSON.parse(body) : {}); } 
    catch (e) { reject(e); }
  });
});

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health
    if (pathname === '/health' && req.method === 'GET') {
      const dbHealth = await query('SELECT 1 as healthy').catch(() => ({ rows: [] }));
      return sendJson(res, 200, {
        status: 'UP',
        service: 'inventory-service',
        database: dbHealth.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
        port: PORT,
        timestamp: new Date().toISOString()
      });
    }

    // 2. All Inventory
    if (pathname === '/api/v1/inventory' && req.method === 'GET') {
      const { rows } = await query(`
        SELECT i.*, c.brand, c.model_name 
        FROM ultron_inventory.inventory_items i
        JOIN ultron_catalog.catalog_devices c ON i.device_id = c.id
        ORDER BY i.created_at DESC
      `);
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    }

    // 3. Single Item by IMEI
    const imeiMatch = pathname.match(/^\/api\/v1\/inventory\/imei\/([0-9]+)$/);
    if (imeiMatch && req.method === 'GET') {
      const imei = imeiMatch[1];
      const { rows } = await query(`
        SELECT i.*, c.brand, c.model_name 
        FROM ultron_inventory.inventory_items i
        JOIN ultron_catalog.catalog_devices c ON i.device_id = c.id
        WHERE i.imei = $1
      `, [imei]);
      if (rows.length === 0) return sendJson(res, 404, { success: false, error: 'IMEI not found' });
      return sendJson(res, 200, { success: true, data: rows[0] });
    }

    // 4. Redis Redlock Acquire
    if (pathname === '/api/v1/inventory/lock' && req.method === 'POST') {
      const body = await parseBody(req);
      const { imei, sessionId } = body;
      
      if (!imei || !sessionId) {
        return sendJson(res, 400, { success: false, error: 'imei and sessionId required' });
      }

      // Check existence
      const { rows: items } = await query('SELECT id, status FROM ultron_inventory.inventory_items WHERE imei = $1', [imei]);
      if (items.length === 0) return sendJson(res, 404, { success: false, error: 'IMEI not found' });
      
      const lockResult = await lockManager.acquireLock(imei, sessionId);
      if (lockResult.success) {
        // Update PG to match Redis lock state
        await query(
          "UPDATE ultron_inventory.inventory_items SET status = 'LOCKED_CHECKOUT_HOLD', active_lock_session_id = $1, lock_expires_at = NOW() + interval '10 minutes' WHERE imei = $2",
          [sessionId, imei]
        );
      }
      return sendJson(res, lockResult.success ? 200 : 409, lockResult);
    }

    // 5. Redis Redlock Release
    if (pathname === '/api/v1/inventory/release' && req.method === 'POST') {
      const body = await parseBody(req);
      const { imei, sessionId } = body;

      const releaseResult = await lockManager.releaseLock(imei, sessionId);
      if (releaseResult.success) {
        await query(
          "UPDATE ultron_inventory.inventory_items SET status = 'AVAILABLE', active_lock_session_id = NULL, lock_expires_at = NULL WHERE imei = $1 AND active_lock_session_id = $2",
          [imei, sessionId]
        );
      }
      return sendJson(res, releaseResult.success ? 200 : 400, releaseResult);
    }

    // 5.5 Redis Redlock Commit Sale (Transition from Locked to Sold)
    if (pathname === '/api/v1/inventory/commit-sale' && req.method === 'POST') {
      const body = await parseBody(req);
      const { imei, sessionId } = body;
      
      const { rows } = await query(
        "UPDATE ultron_inventory.inventory_items SET status = 'SOLD', active_lock_session_id = NULL, lock_expires_at = NULL WHERE imei = $1 AND active_lock_session_id = $2 RETURNING id",
        [imei, sessionId]
      );
      
      if (rows.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Failed to commit sale. Lock invalid or IMEI mismatch.' });
      }
      
      return sendJson(res, 200, { success: true, message: 'Stock successfully committed as SOLD.' });
    }

    // 6. DB Schema check
    if (pathname === '/api/v1/inventory/schema' && req.method === 'GET') {
      return sendJson(res, 200, {
        engine: 'PostgreSQL 15+ & Redis 7.2 Redlock',
        tables: ['catalog_devices', 'inventory_items', 'checkout_reservations', 'inventory_state_audit_log']
      });
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Inventory Service] Listening on http://0.0.0.0:${PORT}`);
  // Wait a bit to ensure catalog is seeded first
  setTimeout(seedInventoryDb, 3000);
});
