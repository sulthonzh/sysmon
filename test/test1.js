const { SysMonitor } = require('../index');
const assert = require('assert');

// Test basic functionality
console.log('🧪 Testing SysMonitor basic functionality...');

async function testSnapshot() {
  const monitor = new SysMonitor();
  const snapshot = await monitor.snapshot();
  
  // Check required fields
  assert(snapshot.timestamp, 'Timestamp should exist');
  assert(snapshot.hostname, 'Hostname should exist');
  assert(snapshot.platform, 'Platform should exist');
  assert(snapshot.cpu, 'CPU info should exist');
  assert(snapshot.memory, 'Memory info should exist');
  assert(Array.isArray(snapshot.load), 'Load average should be array');
  assert(snapshot.load.length === 3, 'Load average should have 3 values');
  
  // Check CPU info
  assert(typeof snapshot.cpu.usage === 'number', 'CPU usage should be number');
  assert(snapshot.cpu.usage >= 0 && snapshot.cpu.usage <= 100, 'CPU usage should be between 0-100');
  assert(typeof snapshot.cpu.cores === 'number', 'CPU cores should be number');
  assert(snapshot.cpu.cores > 0, 'Should have at least 1 CPU core');
  
  // Check memory info
  assert(typeof snapshot.memory.usage === 'number', 'Memory usage should be number');
  assert(snapshot.memory.usage >= 0 && snapshot.memory.usage <= 100, 'Memory usage should be between 0-100');
  assert(typeof snapshot.memory.total === 'number', 'Memory total should be number');
  assert(snapshot.memory.total > 0, 'Memory total should be positive');
  
  console.log('✅ Basic snapshot test passed');
  return true;
}

async function testContinuousMonitoring() {
  const monitor = new SysMonitor();
  const snapshots = [];
  
  await monitor.start({
    interval: 100, // Fast for testing
    count: 3
  }, (snapshot, index) => {
    snapshots.push(snapshot);
    assert(index === snapshots.length - 1, 'Index should match array position');
  });
  
  assert(snapshots.length === 3, 'Should have exactly 3 snapshots');
  
  // Check timestamps are increasing
  for (let i = 1; i < snapshots.length; i++) {
    const prevTime = new Date(snapshots[i-1].timestamp);
    const currTime = new Date(snapshots[i].timestamp);
    assert(currTime > prevTime, 'Timestamps should be increasing');
  }
  
  console.log('✅ Continuous monitoring test passed');
  return true;
}

async function testErrorHandling() {
  const monitor = new SysMonitor();
  
  // Test invalid input
  try {
    await monitor.start({
      interval: -1, // Invalid
      count: 0
    }, () => {});
    console.log('❌ Should have thrown error for invalid interval');
    return false;
  } catch (error) {
    console.log('✅ Error handling works correctly');
    return true;
  }
}

async function runTests() {
  try {
    await testSnapshot();
    await testContinuousMonitoring();
    await testErrorHandling();
    
    console.log('\n🎉 All SysMonitor tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();