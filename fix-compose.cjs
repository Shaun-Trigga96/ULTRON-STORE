const fs = require('fs');

const ymls = ['docker-compose.local.yml', 'docker-compose.yml'];
for (const file of ymls) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /- \.\/services\/inventory-service\/src\/schema\/02-inventory-schema\.sql:\/docker-entrypoint-initdb\.d\/init\.sql:ro/g,
    `- ./services/catalog-service/src/schema/01-catalog-schema.sql:/docker-entrypoint-initdb.d/01-catalog-schema.sql:ro
      - ./services/inventory-service/src/schema/02-inventory-schema.sql:/docker-entrypoint-initdb.d/02-inventory-schema.sql:ro
      - ./services/order-service/src/schema/03-orders-schema.sql:/docker-entrypoint-initdb.d/03-orders-schema.sql:ro
      - ./services/payment-service/src/schema/04-payments-schema.sql:/docker-entrypoint-initdb.d/04-payments-schema.sql:ro`
  );
  fs.writeFileSync(file, content);
}
