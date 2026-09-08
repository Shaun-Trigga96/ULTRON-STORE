const fs = require('fs');
let file = 'services/gateway/nginx.conf';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('user_backend')) {
  content = content.replace(
    /upstream payment_backend \{\s*server payment-service:4004;\s*\}/,
    `upstream payment_backend {
            server payment-service:4004;
        }
        upstream user_backend {
            server user-service:4005;
        }`
  );
  
  content = content.replace(
    /location \/api\/v1\/payments \{[\s\S]*?proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\s*\}/,
    `location /api/v1/payments {
            add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Idempotency-Key' always;

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Idempotency-Key' always;
                add_header 'Content-Length' 0;
                return 204;
            }

            proxy_pass http://payment_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 5. User & Auth Service Routes
        location /api/v1/auth {
            add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'http://localhost:3001' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
                add_header 'Content-Length' 0;
                return 204;
            }

            proxy_pass http://user_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }`
  );
  fs.writeFileSync(file, content);
}
