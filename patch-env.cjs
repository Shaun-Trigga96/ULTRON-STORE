const fs = require('fs');
let content = fs.readFileSync('docker-compose.yml', 'utf8');

const targetStr = `      - REDIS_PORT=6379`;
const replacementStr = `      - REDIS_PORT=6379\n      - DB_HOST=postgres\n      - DB_NAME=ultrondb\n      - DB_USER=appuser\n      - DB_PASSWORD=devsecret`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('docker-compose.yml', content);
