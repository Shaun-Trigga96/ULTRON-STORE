const fs = require('fs');
let file = 'services/order-service/src/index.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("require('jsonwebtoken')")) {
  content = content.replace(
    /const \{ pool, query \} = require\('\.\/db'\);/,
    `const { pool, query } = require('./db');\nconst jwt = require('jsonwebtoken');`
  );

  const authHelper = `
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
`;

  content = content.replace(/const INVENTORY_URL =/, authHelper + '\nconst INVENTORY_URL =');
  
  // Update checkout route to link to logged in user if available
  content = content.replace(
    /const \{ customerInfo, items, sessionId, totalCents \} = body;/,
    `const { customerInfo, items, sessionId, totalCents } = body;
      const userPayload = verifyAuth(req);
      const customerId = userPayload ? userPayload.userId : 'cust_' + Math.floor(Math.random()*10000);`
  );
  
  content = content.replace(
    /\['cust_' \+ Math\.floor\(Math\.random\(\)\*10000\), customerInfo\.email, totalCents, JSON\.stringify\(customerInfo\)\]/,
    `[customerId, customerInfo.email, totalCents, JSON.stringify(customerInfo)]`
  );
  
  // Add history route
  const historyRoute = `
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
  `;
  
  content = content.replace(
    /if \(pathname === '\/api\/v1\/orders\/checkout'/,
    historyRoute + `\n    if (pathname === '/api/v1/orders/checkout'`
  );
  fs.writeFileSync(file, content);
}
