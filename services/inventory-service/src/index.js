const http = require('http');
const PORT = process.env.PORT || 4001;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'inventory-service', timestamp: new Date() }));
    return;
  }
  if (req.url === '/api/v1/inventory/phones') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'ULTRON Store Inventory Sync Active',
      data: [
        { imei: '354892019482910', model: 'iPhone 15 Pro Max', grade: 'Pristine (Grade A)', batteryHealth: 98, locked: false },
        { imei: '358291029482109', model: 'Samsung Galaxy S24 Ultra', grade: 'Good (Grade B)', batteryHealth: 92, locked: false }
      ]
    }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
