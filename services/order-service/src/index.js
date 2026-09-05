const http = require('http');

const PORT = process.env.PORT || 4003;
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:4001';

// In-memory order store (simulating PostgreSQL orders table)
const orders = new Map();

// Helper to parse JSON body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
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

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health
    if (pathname === '/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'order-service',
        port: PORT,
        totalOrders: orders.size,
        inventoryServiceTarget: INVENTORY_URL,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Checkout / Place Order
    if (pathname === '/api/v1/orders/checkout' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const { customer, items, paymentMethod = 'instant-eft', notes = '' } = body;

      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return sendJson(res, 400, {
          success: false,
          error: 'Invalid order payload. Requires customer details and at least one item.'
        });
      }

      if (!customer.name || !customer.address || !customer.city) {
        return sendJson(res, 400, {
          success: false,
          error: 'Incomplete delivery information (name, address, city are required)'
        });
      }

      const orderNumber = `ULT-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `TCG-ZA-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const subtotalZar = items.reduce((sum, item) => sum + (item.priceZar || 0), 0);
      const shippingZar = subtotalZar >= 1500 ? 0 : 150;
      const grandTotalZar = subtotalZar + shippingZar;

      const orderRecord = {
        orderId: orderNumber,
        trackingNumber,
        status: 'CONFIRMED',
        fulfillmentStatus: 'QUEUED_FOR_DISPATCH',
        courier: 'The Courier Guy (Express Overnight Insured)',
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        customer: {
          name: customer.name,
          email: customer.email || 'customer@ultron.store',
          phone: customer.phone || '+27 82 000 0000',
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode || '2000',
          country: 'South Africa'
        },
        payment: {
          method: paymentMethod,
          status: 'AUTHORIZED',
          authorizedAt: new Date().toISOString(),
          currency: 'ZAR',
          amount: grandTotalZar
        },
        items: items.map(i => ({
          imei: i.imei,
          model: i.model,
          brand: i.brand,
          storageGb: i.storageGb,
          conditionGrade: i.conditionGrade || 'MINT',
          priceZar: i.priceZar
        })),
        pricing: {
          subtotalZar,
          shippingZar,
          vatIncludedZar: Math.round(grandTotalZar * 0.15),
          grandTotalZar
        },
        createdAt: new Date().toISOString()
      };

      orders.set(orderNumber, orderRecord);

      return sendJson(res, 201, {
        success: true,
        message: 'Order created and authorized successfully',
        order: orderRecord
      });
    }

    // 3. Get Single Order
    const orderMatch = pathname.match(/^\/api\/v1\/orders\/([0-9a-zA-Z_-]+)$/);
    if (orderMatch && req.method === 'GET') {
      const orderId = orderMatch[1];
      const order = orders.get(orderId);
      if (!order) {
        return sendJson(res, 404, { success: false, error: `Order ${orderId} not found` });
      }
      return sendJson(res, 200, { success: true, order });
    }

    // 4. List All Orders
    if (pathname === '/api/v1/orders' && req.method === 'GET') {
      const list = Array.from(orders.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sendJson(res, 200, {
        success: true,
        count: list.length,
        orders: list
      });
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error('Order Service Error:', err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error', message: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Order Service] Listening on http://0.0.0.0:${PORT}`);
});
