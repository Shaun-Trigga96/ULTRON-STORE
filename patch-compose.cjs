const fs = require('fs');
let content = fs.readFileSync('docker-compose.yml', 'utf8');

const replacement = `
      - ./services/catalog-service/src/schema/01-catalog-schema.sql:/docker-entrypoint-initdb.d/01-catalog.sql:ro
      - ./services/inventory-service/src/schema/02-inventory-schema.sql:/docker-entrypoint-initdb.d/02-inventory.sql:ro
      - ./services/order-service/src/schema/03-orders-schema.sql:/docker-entrypoint-initdb.d/03-orders.sql:ro
      - ./services/payment-service/src/schema/04-payments-schema.sql:/docker-entrypoint-initdb.d/04-payments.sql:ro
`;

content = content.replace(/      - \.\/services\/inventory-service\/src\/schema\/database\.sql:\/docker-entrypoint-initdb\.d\/init\.sql:ro/g, replacement.trim('\n'));
fs.writeFileSync('docker-compose.yml', content);
