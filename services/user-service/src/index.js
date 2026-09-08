const http = require('http');
const { pool, query } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 4005;
const JWT_SECRET = process.env.JWT_SECRET || 'ultron_super_secret_jwt_key_2026';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
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
      return sendJson(res, 200, { status: 'UP', database: dbHealth.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED' });
    }

    if (pathname === '/api/v1/auth/register' && req.method === 'POST') {
      const { email, password, name } = await parseBody(req);
      if (!email || !password || !name) return sendJson(res, 400, { success: false, error: 'Missing fields' });
      
      const existing = await query('SELECT id FROM ultron_users.users WHERE email = $1', [email]);
      if (existing.rows.length > 0) return sendJson(res, 400, { success: false, error: 'Email already exists' });

      const hash = await bcrypt.hash(password, 10);
      const { rows } = await query(
        'INSERT INTO ultron_users.users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
        [email, hash, name]
      );
      
      const user = rows[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return sendJson(res, 201, { success: true, token, user });
    }

    if (pathname === '/api/v1/auth/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) return sendJson(res, 400, { success: false, error: 'Missing fields' });

      const { rows } = await query('SELECT * FROM ultron_users.users WHERE email = $1', [email]);
      if (rows.length === 0) return sendJson(res, 401, { success: false, error: 'Invalid credentials' });

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return sendJson(res, 401, { success: false, error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return sendJson(res, 200, { success: true, token, user: { id: user.id, email: user.email, name: user.full_name } });
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON User Service] Listening on http://0.0.0.0:${PORT}`);
});
