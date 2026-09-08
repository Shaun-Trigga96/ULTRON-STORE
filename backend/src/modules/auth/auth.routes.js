const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../core/db/index');

const JWT_SECRET = process.env.JWT_SECRET || 'ultron_super_secret_jwt_key_2026';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query('INSERT INTO ultron_users.users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name', [email, hash, name]);
    const user = rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query('SELECT * FROM ultron_users.users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: rows[0].id, name: rows[0].full_name, email: rows[0].email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
