# ULTRON Store — Customer Frontend Microservice

Production-grade React customer storefront with standalone client mode and live API capability.

## Features
- **Standalone Offline Capability**: Can run 100% independently without backend services.
- **Certified Catalog & Diagnostics**: 40-point hardware diagnostic inspection, battery health verification, IMEI tracking.
- **Simulated Redlock Stock Hold**: 15-minute countdown reserve timer matching backend Redis lock specifications.
- **Decoupled Checkout Simulator**: Multi-stage delivery address and payment verification.

## Running the Frontend Locally

### Option 1: Standalone Client Mode (No backend needed)
```bash
cd services/frontend-store
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### Option 2: Connecting to Local Backend Services
Once you are ready to connect to the backend server:
1. Start the inventory service:
   ```bash
   cd services/inventory-service
   node src/index.js
   ```
2. The frontend will automatically detect the backend on port 4001 or fallback smoothly to offline cache if offline.
