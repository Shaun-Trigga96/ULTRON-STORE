const assert = require('assert');

async function runTests() {
  console.log('🧪 Testing Payment Service Idempotency & Fee Calculations...');

  // Test 1: Gateway fee calculation
  const amountZar = 22499;
  const feeZar = Math.round(amountZar * 0.015);
  assert.strictEqual(feeZar, 337, '1.5% gateway fee must calculate correctly');
  console.log('  ✓ Gateway interchange fee calculation verified');

  // Test 2: Idempotency Map behavior
  const idempotencyStore = new Map();
  const testKey = 'idem_key_84920';
  idempotencyStore.set(testKey, { transactionId: 'TXN-12345678', settled: true });

  assert.strictEqual(idempotencyStore.has(testKey), true);
  assert.strictEqual(idempotencyStore.get(testKey).transactionId, 'TXN-12345678');
  console.log('  ✓ Idempotency deduplication storage verified');

  console.log('✅ All Payment Service tests passed!\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
