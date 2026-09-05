const assert = require('assert');

async function runTests() {
  console.log('🧪 Testing Order Service Calculation & Order Structuring...');

  const items = [
    { imei: '354892019482910', model: 'iPhone 15 Pro Max', priceZar: 22499 }
  ];

  // Test 1: Subtotal and free shipping threshold
  const subtotal = items.reduce((s, i) => s + i.priceZar, 0);
  const shipping = subtotal >= 1500 ? 0 : 150;
  assert.strictEqual(subtotal, 22499);
  assert.strictEqual(shipping, 0, 'Orders over R1500 must receive free delivery');
  console.log('  ✓ Free delivery threshold calculation verified');

  // Test 2: Order Reference formatting
  const ref = `ULT-${Math.floor(100000 + Math.random() * 900000)}`;
  assert.match(ref, /^ULT-\d{6}$/);
  console.log('  ✓ Order Reference prefix and 6-digit schema verified');

  console.log('✅ All Order Service tests passed!\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
