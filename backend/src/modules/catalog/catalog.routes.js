const express = require('express');
const router = express.Router();
const { query } = require('../../core/db/index');

router.get('/products', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM ultron_catalog.products WHERE is_active = true');
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
