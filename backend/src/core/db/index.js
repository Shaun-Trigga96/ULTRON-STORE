const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'devsecret',
  database: process.env.DB_NAME || 'ultrondb',
  port: parseInt(process.env.DB_PORT || '5432'),
});
module.exports = { pool, query: (text, params) => pool.query(text, params) };
