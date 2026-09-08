const fs = require('fs');
const files = ['docker-compose.yml', 'docker-compose.local.yml'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /- INVENTORY_URL=http:\/\/inventory-service:4001/g,
    `- INVENTORY_URL=http://inventory-service:4001\n      - PAYMENT_URL=http://payment-service:4004`
  );
  fs.writeFileSync(file, content);
}
