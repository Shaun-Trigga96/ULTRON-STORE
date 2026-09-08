const fs = require('fs');
let file = 'services/order-service/src/index.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const INVENTORY_URL = (.*?);/;
content = content.replace(regex, `const INVENTORY_URL = $1;\nconst PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:4004';`);

// Replace the checkout flow
const checkoutRegex = /\/\/ 1\. Create Order[\s\S]*?await client\.query\('COMMIT'\);/g;

const newCheckoutLogic = `// 1. Create Order
        const { rows: orderRows } = await client.query(
          \`INSERT INTO ultron_orders.orders 
          (customer_id, customer_email, total_amount_cents, shipping_address) 
          VALUES ($1, $2, $3, $4) RETURNING id\`,
          ['cust_' + Math.floor(Math.random()*10000), customerInfo.email, totalCents, JSON.stringify(customerInfo)]
        );
        const orderId = orderRows[0].id;

        // 2. Call Payment Service
        const paymentRes = await fetch(\`\${PAYMENT_URL}/api/v1/payments/process\`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Idempotency-Key': 'idem_' + orderId // In reality frontend should send this
          },
          body: JSON.stringify({
            orderId: orderId,
            amountCents: totalCents,
            providerName: customerInfo.paymentMethod || 'CARD'
          })
        });
        
        const paymentData = await paymentRes.json();
        if (!paymentRes.ok || !paymentData.success) {
          throw new Error('Payment Authorization Failed: ' + (paymentData.error || 'Unknown error'));
        }

        // 3. Insert Order Items & Commit Sale in Inventory
        for (const item of items) {
          await client.query(
            \`INSERT INTO ultron_orders.order_items (order_id, inventory_item_id, imei, price_cents) VALUES ($1, $2, $3, $4)\`,
            [orderId, item.id, item.imei, item.priceZar * 100]
          );

          const invRes = await fetch(\`\${INVENTORY_URL}/api/v1/inventory/commit-sale\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imei: item.imei, sessionId })
          });
          const invData = await invRes.json();
          if (!invRes.ok || !invData.success) {
            throw new Error(\`Inventory commit failed for IMEI \${item.imei}: \${invData.error}\`);
          }
        }

        await client.query('COMMIT');`;

content = content.replace(checkoutRegex, newCheckoutLogic);
fs.writeFileSync(file, content);
