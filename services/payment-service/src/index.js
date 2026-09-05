const http = require('http');

const PORT = process.env.PORT || 4004;

// Idempotency cache: idempotencyKey -> transaction response
const idempotencyStore = new Map();
// Transaction ledger: transactionId -> record
const transactions = new Map();

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health
    if (pathname === '/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'payment-service',
        port: PORT,
        totalTransactions: transactions.size,
        idempotencyRecords: idempotencyStore.size,
        supportedGateways: ['Ozow Instant EFT', 'Credit/Debit (3D Secure 2.0)', 'BTC Lightning'],
        timestamp: new Date().toISOString()
      });
    }

    // 2. Authorize Payment with Idempotency Key
    if (pathname === '/api/v1/payments/authorize' && req.method === 'POST') {
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
      const body = await parseRequestBody(req);
      const { orderId, amountZar, currency = 'ZAR', paymentMethod = 'instant-eft', customerEmail } = body;

      if (!orderId || !amountZar) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required payment fields: orderId and amountZar'
        });
      }

      // Check Idempotency Store to prevent duplicate billing
      if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
        const cached = idempotencyStore.get(idempotencyKey);
        return sendJson(res, 200, {
          ...cached,
          idempotentReplay: true
        });
      }

      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const authorizationCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const txRecord = {
        transactionId,
        orderId,
        amountZar,
        currency,
        paymentMethod,
        customerEmail: customerEmail || 'customer@ultron.store',
        status: 'SETTLED',
        authorizationCode,
        gatewayProvider: paymentMethod === 'instant-eft' ? 'Ozow South Africa' : paymentMethod === 'crypto' ? 'Lightning Network' : 'Visa/Mastercard 3DS',
        feeZar: Math.round(amountZar * 0.015), // 1.5% gateway fee
        timestamp: new Date().toISOString()
      };

      transactions.set(transactionId, txRecord);

      if (idempotencyKey) {
        idempotencyStore.set(idempotencyKey, {
          success: true,
          message: 'Payment authorized and settled',
          transaction: txRecord
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Payment authorized and settled',
        transaction: txRecord
      });
    }

    // 3. Transactions Ledger
    if (pathname === '/api/v1/payments/transactions' && req.method === 'GET') {
      const list = Array.from(transactions.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return sendJson(res, 200, {
        success: true,
        count: list.length,
        transactions: list
      });
    }

    // 4. Single Transaction Query
    const txMatch = pathname.match(/^\/api\/v1\/payments\/([0-9a-zA-Z_-]+)$/);
    if (txMatch && req.method === 'GET') {
      const txId = txMatch[1];
      const tx = transactions.get(txId);
      if (!tx) {
        return sendJson(res, 404, { success: false, error: `Transaction ${txId} not found` });
      }
      return sendJson(res, 200, { success: true, transaction: tx });
    }

    // 5. Webhook Simulator
    if (pathname === '/api/v1/payments/webhook' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      return sendJson(res, 200, {
        received: true,
        event: body.event || 'payment.success',
        processedAt: new Date().toISOString()
      });
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error('Payment Service Error:', err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error', message: err.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Payment Service] Listening on http://0.0.0.0:${PORT}`);
});
