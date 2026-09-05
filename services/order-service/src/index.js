const http = require('http');
const { pool, query } = require('./db');
const PORT = process.env.PORT || 4003;
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:4001'; // Not actually needed if using nginx gateway, but internal is better. Wait, we should use inventory-service:4001 internally.

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

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
    if (pathname === '/health' && req.method === 'GET') {
      const dbHealth = await query('SELECT 1 as healthy').catch(() => ({ rows: [] }));
      return sendJson(res, 200, {
        status: 'UP',
        service: 'order-service',
        database: dbHealth.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
        port: PORT
      });
    }

    if (pathname === '/api/v1/orders/checkout' && req.method === 'POST') {
      const body = await parseBody(req);
      const { customerInfo, items, sessionId, totalCents } = body;

      if (!items || items.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Cart is empty' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Create Order
        const { rows: orderRows } = await client.query(
          `INSERT INTO ultron_orders.orders 
          (customer_id, customer_email, total_amount_cents, shipping_address) 
          VALUES ($1, $2, $3, $4) RETURNING id`,
          ['cust_' + Math.floor(Math.random()*10000), customerInfo.email, totalCents, JSON.stringify(customerInfo)]
        );
        const orderId = orderRows[0].id;

        // 2. Insert Order Items & Commit Sale in Inventory
        for (const item of items) {
          await client.query(
            `INSERT INTO ultron_orders.order_items (order_id, inventory_item_id, imei, price_cents) VALUES ($1, $2, $3, $4)`,
            [orderId, item.id, item.imei, item.priceZar * 100] // id here maps to inventory item id if we fetched it, but wait: the frontend sends the whole phone object.
          );

          // We must communicate with Inventory Service to transition from LOCKED_CHECKOUT_HOLD to SOLD
          const invRes = await fetch(`${INVENTORY_URL}/api/v1/inventory/commit-sale`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imei: item.imei, sessionId })
          });
          const invData = await invRes.json();
          if (!invRes.ok || !invData.success) {
            throw new Error(`Inventory commit failed for IMEI ${item.imei}: ${invData.error}`);
          }
        }

        await client.query('COMMIT');
        
        return sendJson(res, 200, { 
          success: true, 
          orderId: orderId,
          message: 'Order successfully orchestrated and stock committed.' 
        });
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Checkout Error:', err);
        return sendJson(res, 500, { success: false, error: err.message || 'Orchestration failed' });
      } finally {
        client.release();
      }
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Order Service] Listening on http://0.0.0.0:${PORT}`);
});
