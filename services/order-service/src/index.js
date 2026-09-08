const http = require('http');
const { pool, query } = require('./db');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 4003;

const JWT_SECRET = process.env.JWT_SECRET || 'ultron_super_secret_jwt_key_2026';

function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch(e) {
    return null;
  }
}

const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:4001';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:4004'; // Not actually needed if using nginx gateway, but internal is better. Wait, we should use inventory-service:4001 internally.

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

    
    if (pathname === '/api/v1/orders/history' && req.method === 'GET') {
      const userPayload = verifyAuth(req);
      if (!userPayload) return sendJson(res, 401, { success: false, error: 'Unauthorized' });
      
      const { rows } = await query(
        'SELECT * FROM ultron_orders.orders WHERE customer_id = $1 ORDER BY created_at DESC', 
        [userPayload.userId]
      );
      
      // For each order, fetch items
      const history = [];
      for (const order of rows) {
        const itemRes = await query('SELECT * FROM ultron_orders.order_items WHERE order_id = $1', [order.id]);
        history.push({ ...order, items: itemRes.rows });
      }
      
      return sendJson(res, 200, { success: true, data: history });
    }
  
    if (pathname === '/api/v1/orders/checkout' && req.method === 'POST') {
      const body = await parseBody(req);
      const { customerInfo, items, sessionId, totalCents } = body;
      const userPayload = verifyAuth(req);
      const customerId = userPayload ? userPayload.userId : 'cust_' + Math.floor(Math.random()*10000);

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
          [customerId, customerInfo.email, totalCents, JSON.stringify(customerInfo)]
        );
        const orderId = orderRows[0].id;

        // 2. Call Payment Service
        const paymentRes = await fetch(`${PAYMENT_URL}/api/v1/payments/process`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Idempotency-Key': 'idem_' + orderId // In reality frontend should send this
          },
          body: JSON.stringify({
            orderId: orderId,
            amountCents: totalCents,
            providerName: customerInfo.paymentMethod || 'CARD'
          })
        });
        
        const paymentData = await paymentRes.json();
        if (!paymentRes.ok || !paymentData.success) {
          throw new Error('Payment Authorization Failed: ' + (paymentData.error || 'Unknown error'));
        }

        // 3. Insert Order Items & Commit Sale in Inventory
        for (const item of items) {
          await client.query(
            `INSERT INTO ultron_orders.order_items (order_id, inventory_item_id, imei, price_cents) VALUES ($1, $2, $3, $4)`,
            [orderId, item.id, item.imei, item.priceZar * 100]
          );

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
