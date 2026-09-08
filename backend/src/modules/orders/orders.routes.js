const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../../core/db/index');

const JWT_SECRET = process.env.JWT_SECRET || 'ultron_super_secret_jwt_key_2026';

router.post('/checkout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let customerId = 'guest_' + Math.floor(Math.random()*10000);
    if (authHeader) {
      try {
        const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        customerId = payload.userId;
      } catch(e) {}
    }
    
    const { items, totalCents, customerInfo } = req.body;
    const orderRes = await query('INSERT INTO ultron_orders.orders (customer_id, customer_email, total_amount_cents, shipping_address) VALUES ($1, $2, $3, $4) RETURNING id', [customerId, customerInfo.email, totalCents, JSON.stringify(customerInfo)]);
    const orderId = orderRes.rows[0].id;
    
    for (const item of items) {
      await query('INSERT INTO ultron_orders.order_items (order_id, product_id, imei, price_cents) VALUES ($1, $2, $3, $4)', [orderId, item.id, item.imei || 'PENDING', item.priceCents]);
    }
    res.json({ success: true, orderId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    
    const { rows } = await query('SELECT * FROM ultron_orders.orders WHERE customer_id = $1 ORDER BY created_at DESC', [payload.userId]);
    for (let order of rows) {
      const items = await query('SELECT * FROM ultron_orders.order_items WHERE order_id = $1', [order.id]);
      order.items = items.rows;
    }
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
