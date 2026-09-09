const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Load SDLC Modules
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/inventory', require('./modules/inventory/inventory.routes'));
app.use('/api/v1/orders', require('./modules/orders/orders.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'UP', service: 'ULTRON Monolith' }));
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'ULTRON Monolith' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`[ULTRON Backend] Server running on port ${PORT}`));
