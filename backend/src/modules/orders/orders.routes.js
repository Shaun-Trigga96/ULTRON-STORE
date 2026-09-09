const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../../core/db/index');
const JWT_SECRET = process.env.JWT_SECRET || 'ultron_super_secret_jwt_key_2026';
const { processPayment } = require('../payment/payment.service');

router.post('/checkout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let customerId = 'guest_' + Math.floor(Math.random()*10000);
    let userEmail = req.body.customerInfo?.email || 'guest@example.com';
    let userRecord = null;
    if (authHeader) {
      try {
        const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        customerId = payload.userId;
        userEmail = payload.email;
        userRecord = payload;
      } catch(e) {}
    }
    
    const { items, totalCents, customerInfo, sessionId } = req.body;
    
    // 1. Process payment (simulated for external gateway)
    const paymentResult = await processPayment({
       amountCents: totalCents,
       currency: 'ZAR',
       source: 'tok_visa'
    });
    
    if (!paymentResult.success) {
       return res.status(400).json({ success: false, error: 'Payment declined' });
    }

    // 2. Create Order
    const orderRes = await query(
      'INSERT INTO ultron_orders.orders (customer_id, customer_email, total_amount_cents, shipping_address, status) VALUES ($1, $2, $3, $4, $5) RETURNING id', 
      [customerId, customerInfo.email, totalCents, JSON.stringify(customerInfo), 'PAYMENT_CONFIRMED']
    );
    const orderId = orderRes.rows[0].id;
    
    // 3. Save Payment Transaction
    await query(
      'INSERT INTO ultron_payments.payment_transactions (order_id, idempotency_key, provider_name, provider_transaction_id, amount_cents, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [orderId, paymentResult.transactionId, 'STRIPE', paymentResult.transactionId, totalCents, 'CAPTURED']
    );

    // 4. Update Inventory Items to SOLD and clear checkout hold locks
    for (const item of items) {
      await query(
        'INSERT INTO ultron_orders.order_items (order_id, inventory_item_id, imei, price_cents) VALUES ($1, $2, $3, $4)', 
        [orderId, item.id, item.imei, item.priceZar ? item.priceZar * 100 : item.priceCents]
      );
      
      await query(`
        UPDATE ultron_inventory.inventory_items
        SET status = 'SOLD', active_lock_session_id = NULL, lock_expires_at = NULL
        WHERE imei = $1 AND (active_lock_session_id = $2 OR active_lock_session_id IS NULL)
      `, [item.imei, sessionId]);
    }

    res.json({ success: true, orderId, token: authHeader ? authHeader.split(' ')[1] : undefined, user: userRecord });
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
