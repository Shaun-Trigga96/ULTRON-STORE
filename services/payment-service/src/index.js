const http = require('http');
const { pool, query } = require('./db');
const PORT = process.env.PORT || 4004;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key'
  });
  res.end(JSON.stringify(data, null, 2));
}

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    try { resolve(body ? JSON.parse(body) : {}); } 
    catch (e) { reject(e); }
  });
});

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
      const dbHealth = await query('SELECT 1 as healthy').catch(() => ({ rows: [] }));
      return sendJson(res, 200, {
        status: 'UP',
        service: 'payment-service',
        database: dbHealth.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
        outboxWorker: 'RUNNING',
        port: PORT
      });
    }

    // 2. Process Payment (with Idempotency & Transactional Outbox Pattern)
    if (pathname === '/api/v1/payments/process' && req.method === 'POST') {
      const idempotencyKey = req.headers['idempotency-key'];
      if (!idempotencyKey) {
        return sendJson(res, 400, { success: false, error: 'Idempotency-Key header is required' });
      }

      const body = await parseBody(req);
      const { orderId, amountCents, providerName = 'ULTRON_PAY' } = body;

      if (!orderId || !amountCents) {
        return sendJson(res, 400, { success: false, error: 'orderId and amountCents are required' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check for idempotency
        const { rows: existingTx } = await client.query(
          'SELECT id, status, provider_transaction_id FROM ultron_payments.payment_transactions WHERE idempotency_key = $1 FOR UPDATE',
          [idempotencyKey]
        );

        if (existingTx.length > 0) {
          await client.query('ROLLBACK');
          return sendJson(res, 200, {
            success: true,
            idempotent: true,
            transactionId: existingTx[0].id,
            status: existingTx[0].status,
            message: 'Returned existing transaction via idempotency key.'
          });
        }

        // Simulate Gateway Processing Delay
        const providerTxId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const status = 'AUTHORIZED';

        // 1. Insert Payment Transaction
        const { rows: newTx } = await client.query(
          `INSERT INTO ultron_payments.payment_transactions 
          (order_id, idempotency_key, provider_name, provider_transaction_id, amount_cents, status) 
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [orderId, idempotencyKey, providerName, providerTxId, amountCents, status]
        );
        const transactionId = newTx[0].id;

        // 2. Insert Outbox Event (IN THE SAME TRANSACTION)
        const payload = JSON.stringify({
          transactionId,
          orderId,
          amountCents,
          status,
          providerTxId,
          timestamp: new Date().toISOString()
        });

        await client.query(
          `INSERT INTO ultron_payments.payment_outbox_events 
          (aggregate_type, aggregate_id, event_type, payload) 
          VALUES ($1, $2, $3, $4)`,
          ['Payment', transactionId, 'PaymentAuthorized', payload]
        );

        await client.query('COMMIT');

        return sendJson(res, 200, {
          success: true,
          idempotent: false,
          transactionId,
          status,
          message: 'Payment authorized and outbox event persisted atomically.'
        });

      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Payment Processing Error:', err);
        return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
      } finally {
        client.release();
      }
    }

    return sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { success: false, error: 'Internal Server Error' });
  }
});

// ============================================================================
// OUTBOX POLLING WORKER (Guarantees at-least-once delivery)
// ============================================================================
async function processOutbox() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Lock rows for update to prevent concurrent worker collisions
    const { rows: events } = await client.query(`
      SELECT id, event_type, payload 
      FROM ultron_payments.payment_outbox_events 
      WHERE published = FALSE 
      ORDER BY created_at ASC 
      FOR UPDATE SKIP LOCKED 
      LIMIT 10
    `);

    if (events.length > 0) {
      console.log(`[Outbox Relay] Found ${events.length} unpublished events. Processing...`);
      
      for (const event of events) {
        // Here you would publish to Kafka, RabbitMQ, or an external Webhook.
        // We simulate successful publishing:
        console.log(`[Outbox Relay] Publishing Event [${event.event_type}]:`, JSON.stringify(event.payload));
        
        // Mark as published
        await client.query(
          'UPDATE ultron_payments.payment_outbox_events SET published = TRUE WHERE id = $1',
          [event.id]
        );
      }
      console.log(`[Outbox Relay] Successfully published ${events.length} events.`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Outbox Relay] Error processing events:', err);
  } finally {
    client.release();
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Payment Service] Listening on http://0.0.0.0:${PORT}`);
  // Start the background Outbox relay worker
  setInterval(processOutbox, 5000);
});
