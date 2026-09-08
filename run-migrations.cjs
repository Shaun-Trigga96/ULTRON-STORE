const { Client } = require('pg');
const fs = require('fs');

async function migrate() {
  const client = new Client({
    user: 'appuser',
    host: 'localhost',
    database: 'ultrondb',
    password: 'devsecret',
    port: 5432,
  });

  await client.connect();
  console.log('Connected to DB');

  const schemas = [
    'services/catalog-service/src/schema/01-catalog-schema.sql',
    'services/inventory-service/src/schema/02-inventory-schema.sql',
    'services/order-service/src/schema/03-orders-schema.sql',
    'services/payment-service/src/schema/04-payments-schema.sql'
  ];

  for (const file of schemas) {
    if (fs.existsSync(file)) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(file, 'utf8');
      try {
        await client.query(sql);
        console.log(`Success: ${file}`);
      } catch (err) {
        console.error(`Error in ${file}:`, err.message);
      }
    } else {
      console.log(`File not found: ${file}`);
    }
  }
  
  await client.end();
}

migrate();
