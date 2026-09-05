const fs = require('fs');
let content = fs.readFileSync('docker-compose.yml', 'utf8');

const regex = /(      - REDIS_PORT=6379\n)(      - DB_HOST=postgres\n      - DB_NAME=ultrondb\n      - DB_USER=appuser\n      - DB_PASSWORD=devsecret\n){2}/g;
content = content.replace(regex, `$1      - DB_HOST=postgres\n      - DB_NAME=ultrondb\n      - DB_USER=appuser\n      - DB_PASSWORD=devsecret\n`);
fs.writeFileSync('docker-compose.yml', content);
