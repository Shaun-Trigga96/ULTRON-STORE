const express = require('express');
const router = express.Router();
const { query } = require('../../core/db/index');

router.get('/phones', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT 
        i.id,
        i.imei,
        i.serial_number,
        i.condition_grade,
        i.battery_health_percentage,
        i.cosmetic_scratches_rating,
        i.selling_price_cents,
        i.warehouse_facility_code,
        i.warehouse_bin_location,
        i.status,
        c.brand,
        c.model_name
      FROM ultron_inventory.inventory_items i
      JOIN ultron_catalog.catalog_devices c ON i.device_id = c.id
      WHERE i.status = 'AVAILABLE' OR i.status = 'LOCKED_CHECKOUT_HOLD'
    `);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/lock', async (req, res) => {
  try {
    const { imei, sessionId } = req.body;
    // Real distributed lock logic via Redlock/Redis omitted for brevity; using PostgreSQL row-level lock
    const { rowCount } = await query(`
      UPDATE ultron_inventory.inventory_items
      SET status = 'LOCKED_CHECKOUT_HOLD', active_lock_session_id = $1, lock_expires_at = NOW() + INTERVAL '10 minutes'
      WHERE imei = $2 AND status = 'AVAILABLE'
    `, [sessionId, imei]);
    
    if (rowCount === 0) {
      return res.status(409).json({ success: false, error: 'Device is already held by another customer' });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/release', async (req, res) => {
  try {
    const { imei, sessionId } = req.body;
    const { rowCount } = await query(`
      UPDATE ultron_inventory.inventory_items
      SET status = 'AVAILABLE', active_lock_session_id = NULL, lock_expires_at = NULL
      WHERE imei = $1 AND active_lock_session_id = $2
    `, [imei, sessionId]);
    
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
