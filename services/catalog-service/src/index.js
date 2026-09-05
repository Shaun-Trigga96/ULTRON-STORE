const http = require('http');
const { pool, query } = require('./db');

const PORT = process.env.PORT || 4002;

// Original mock data, used to seed the DB on startup
const SEED_DEVICES = [
  { brand: 'Apple', model_name: 'iPhone 15 Pro Max', storage_capacity_gb: 256, color_name: 'Natural Titanium', model_number: 'A3106', release_year: 2023, base_retail_price_cents: 2249900, image_gallery_urls: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85'], technical_specs: { screen: '6.7-inch Super Retina XDR OLED', chipset: 'Apple A17 Pro' } },
  { brand: 'Samsung', model_name: 'Galaxy S24 Ultra', storage_capacity_gb: 512, color_name: 'Titanium Black', model_number: 'SM-S928B', release_year: 2024, base_retail_price_cents: 1999900, image_gallery_urls: ['https://images.unsplash.com/photo-1706132711002-c6fdb98a0eb0?auto=format&fit=crop&w=1000&q=85'], technical_specs: { screen: '6.8-inch Dynamic AMOLED 2X', chipset: 'Snapdragon 8 Gen 3 for Galaxy' } },
  { brand: 'Google', model_name: 'Pixel 8 Pro', storage_capacity_gb: 128, color_name: 'Bay Blue', model_number: 'G1MNW', release_year: 2023, base_retail_price_cents: 1449900, image_gallery_urls: ['https://images.unsplash.com/photo-1696446702330-07eef3ff247e?auto=format&fit=crop&w=1000&q=85'], technical_specs: { screen: '6.7-inch Super Actua LTPO OLED', chipset: 'Google Tensor G3' } }
];

async function seedCatalogDb() {
  try {
    const { rows } = await query('SELECT count(*) FROM ultron_catalog.catalog_devices');
    if (parseInt(rows[0].count) === 0) {
      console.log('Seeding ultron_catalog.catalog_devices...');
      for (const d of SEED_DEVICES) {
        await query(
          `INSERT INTO ultron_catalog.catalog_devices 
          (brand, model_name, storage_capacity_gb, color_name, model_number, release_year, base_retail_price_cents, image_gallery_urls, technical_specs)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT DO NOTHING`,
          [d.brand, d.model_name, d.storage_capacity_gb, d.color_name, d.model_number, d.release_year, d.base_retail_price_cents, JSON.stringify(d.image_gallery_urls), JSON.stringify(d.technical_specs)]
        );
      }
      console.log('Catalog seeding complete.');
    }
  } catch (err) {
    console.error('Catalog DB seed error:', err.message);
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health
    if (pathname === '/health' && req.method === 'GET') {
      const dbHealth = await query('SELECT 1 as healthy').catch(() => ({ rows: [] }));
      return sendJson(res, 200, {
        status: 'UP',
        service: 'catalog-service',
        database: dbHealth.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
        port: PORT,
        timestamp: new Date().toISOString()
      });
    }

    // 2. All Devices
    if (pathname === '/api/v1/catalog/devices' && req.method === 'GET') {
      const brand = url.searchParams.get('brand');
      let sql = 'SELECT * FROM ultron_catalog.catalog_devices';
      let params = [];
      
      if (brand && brand !== 'ALL') {
        sql += ' WHERE UPPER(brand) = UPPER($1)';
        params.push(brand);
      }

      const { rows } = await query(sql, params);
      return sendJson(res, 200, { success: true, count: rows.length, data: rows });
    }

    // 3. Single Device by ID
    const deviceMatch = pathname.match(/^\/api\/v1\/catalog\/devices\/([0-9a-fA-F\-]+)$/);
    if (deviceMatch && req.method === 'GET') {
      const { rows } = await query('SELECT * FROM ultron_catalog.catalog_devices WHERE id = $1', [deviceMatch[1]]);
      if (rows.length === 0) return sendJson(res, 404, { success: false, error: 'Device not found' });
      return sendJson(res, 200, { success: true, data: rows[0] });
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Catalog Service] Listening on http://0.0.0.0:${PORT}`);
  seedCatalogDb();
});
