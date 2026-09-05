const fs = require('fs');
let content = fs.readFileSync('docker-compose.yml', 'utf8');

const regex = /(      - WEBHOOK_SECRET=whsec_mock_dummy\n)/;
content = content.replace(regex, `$1    depends_on:\n      - postgres\n`);
fs.writeFileSync('docker-compose.yml', content);
