const fs = require('fs');

const ymls = ['docker-compose.local.yml', 'docker-compose.yml'];
for (const file of ymls) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('user-service:')) {
    content = content.replace(
      /payment-service:/,
      `user-service:
    build: ./services/user-service
    container_name: ultron-user-service
    environment:
      - PORT=4005
      - DB_HOST=postgres
      - DB_NAME=ultrondb
      - DB_USER=appuser
      - DB_PASSWORD=devsecret
      - JWT_SECRET=ultron_super_secret_jwt_key_2026
    ports:
      - "4005:4005"
    depends_on:
      - postgres
    networks:
      - ultron-network

  payment-service:`
    );
  }

  // Update postgres volumes
  if (!content.includes('05-users-schema.sql')) {
    content = content.replace(
      /- \.\/services\/payment-service\/src\/schema\/04-payments-schema\.sql:\/docker-entrypoint-initdb\.d\/04-payments-schema\.sql:ro/g,
      `- ./services/payment-service/src/schema/04-payments-schema.sql:/docker-entrypoint-initdb.d/04-payments-schema.sql:ro
      - ./services/user-service/src/schema/05-users-schema.sql:/docker-entrypoint-initdb.d/05-users-schema.sql:ro`
    );
  }
  fs.writeFileSync(file, content);
}
