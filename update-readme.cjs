const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');

const newStructure = `
├── src/                          # Root UI: Developer Portfolio & Documentation Site
│   ├── docs/                     # Documentation modules (Architecture, Terraform, GitOps Views)
│   ├── App.tsx                   # Unified documentation portfolio entrypoint
│   └── main.tsx                  
├── services/                     # Core Microservices Backend & E-commerce App
│   ├── frontend-store/           # Standalone Customer E-Commerce UI (React/Vite)
│   │   └── src/                  # Production Storefront React components
│   ├── inventory-service/        # Node.js: Atomic Redis Redlock stock holds
│   ├── catalog-service/          # Node.js: Product schemas & specs metadata
│   ├── order-service/            # Node.js: Orchestration & checkout transition
│   ├── payment-service/          # Node.js: Payment gateway endpoints
│   └── gateway/                  # Nginx API Reverse Proxy
`;

content = content.replace(/├── src\/[\s\S]*?│   └── gateway\/[\s\S]*?# Nginx API Reverse Proxy/m, newStructure.trim());
fs.writeFileSync('README.md', content);
