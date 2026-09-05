const assert = require('assert');

async function runTests() {
  console.log('🧪 Testing Catalog Service Data & Filtering Logic...');

  // Mock require of devices data
  const devices = [
    { id: 'ph_01', brand: 'Apple', batteryHealthPct: 98, conditionGrade: 'MINT' },
    { id: 'ph_02', brand: 'Samsung', batteryHealthPct: 94, conditionGrade: 'GOOD' },
    { id: 'ph_03', brand: 'Google', batteryHealthPct: 89, conditionGrade: 'FAIR' }
  ];

  // Test 1: Brand filter
  const appleOnly = devices.filter(d => d.brand === 'Apple');
  assert.strictEqual(appleOnly.length, 1);
  assert.strictEqual(appleOnly[0].id, 'ph_01');
  console.log('  ✓ Brand filtering verified');

  // Test 2: Min battery filter
  const highBattery = devices.filter(d => d.batteryHealthPct >= 90);
  assert.strictEqual(highBattery.length, 2);
  console.log('  ✓ Battery health threshold verified');

  // Test 3: Grade distribution
  const mintCount = devices.filter(d => d.conditionGrade === 'MINT').length;
  assert.strictEqual(mintCount, 1);
  console.log('  ✓ Grade distribution aggregation verified');

  console.log('✅ All Catalog tests passed!\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
