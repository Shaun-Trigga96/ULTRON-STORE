const fs = require('fs');
let content = fs.readFileSync('docker-compose.yml', 'utf8');

const regex = /(    environment:\n      - PORT=4001[\s\S]*?      - DB_PASSWORD=devsecret\n)/;
content = content.replace(regex, `$1    depends_on:\n      - redis\n      - postgres\n`);
fs.writeFileSync('docker-compose.yml', content);
