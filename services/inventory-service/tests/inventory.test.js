const assert = require('assert');
const { InventoryLockManager } = require('../src/services/lockManager');

async function runTests() {
  console.log('🧪 Testing InventoryLockManager...');
  const lockManager = new InventoryLockManager();

  // Test 1: Acquire lock
  const res1 = await lockManager.acquireLock('354892019482910', 'session_user_a', 5000);
  assert.strictEqual(res1.success, true, 'Lock should be acquired successfully');
  assert.strictEqual(res1.conflict, false, 'Should have no conflict');
  console.log('  ✓ Lock acquisition succeeded');

  // Test 2: Double-lock conflict
  const res2 = await lockManager.acquireLock('354892019482910', 'session_user_b', 5000);
  assert.strictEqual(res2.success, false, 'Lock should fail due to conflict');
  assert.strictEqual(res2.conflict, true, 'Conflict flag must be true');
  assert.strictEqual(res2.currentHolder, 'session_user_a', 'Current holder must be session_user_a');
  console.log('  ✓ Double-lock race condition prevention succeeded');

  // Test 3: Release lock
  const res3 = await lockManager.releaseLock('354892019482910', 'session_user_a');
  assert.strictEqual(res3.success, true, 'Release should succeed for owner');
  console.log('  ✓ Lock release succeeded');

  // Test 4: Acquire again after release
  const res4 = await lockManager.acquireLock('354892019482910', 'session_user_b', 5000);
  assert.strictEqual(res4.success, true, 'Should acquire lock after previous release');
  console.log('  ✓ Subsequent lock acquisition succeeded');

  console.log('✅ All Inventory tests passed successfully!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
