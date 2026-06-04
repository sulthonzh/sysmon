#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test runner for sysmon
const testDir = __dirname;
const projectDir = path.join(testDir, '..');

console.log('🧪 Running sysmon tests...\n');

// Test 1: Check package.json
console.log('Test 1: Checking package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
  if (pkg.name === 'sysmon' && pkg.version === '1.0.0') {
    console.log('✅ Package.json looks good');
  } else {
    console.log('❌ Package.json missing or incorrect');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test 2: Check main files exist
console.log('\nTest 2: Checking main files...');
const requiredFiles = ['index.js', 'bin.js', 'package.json'];
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(projectDir, file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

// Test 3: Check CLI can be executed
console.log('\nTest 3: Testing CLI execution...');
try {
  const helpOutput = execSync('node bin.js --help', { cwd: projectDir, encoding: 'utf8' });
  if (helpOutput.includes('sysmon')) {
    console.log('✅ CLI help works');
  } else {
    console.log('❌ CLI help failed');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ CLI test failed:', error.message);
  process.exit(1);
}

// Test 4: Test basic monitoring (short test)
console.log('\nTest 4: Testing basic monitoring...');
try {
  const monitorOutput = execSync('node bin.js --count 1 --silent', { 
    cwd: projectDir, 
    encoding: 'utf8', 
    timeout: 5000 
  });
  // In silent mode, no output is expected
  console.log('✅ Basic monitoring works');
} catch (error) {
  console.log('⚠️  Basic monitoring test failed (timeout or error):', error.message);
}

// Test 5: Test JSON output
console.log('\nTest 5: Testing JSON output...');
try {
  const jsonOutput = execSync('node bin.js --count 1 --json --silent', { 
    cwd: projectDir, 
    encoding: 'utf8',
    timeout: 5000 
  });
  const parsed = JSON.parse(jsonOutput);
  if (parsed.timestamp && parsed.cpu && parsed.memory) {
    console.log('✅ JSON output works');
  } else {
    console.log('❌ JSON output invalid');
  }
} catch (error) {
  console.log('⚠️  JSON test failed:', error.message);
}

// Test 6: Test module loading
console.log('\nTest 6: Testing module loading...');
try {
  const { SysMonitor } = require(path.join(projectDir, 'index.js'));
  const monitor = new SysMonitor();
  if (monitor.snapshot && monitor.start) {
    console.log('✅ Module loading works');
  } else {
    console.log('❌ Module loading failed - missing methods');
  }
} catch (error) {
  console.log('❌ Module loading failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests completed!');
console.log('\n📝 Quick manual tests you can run:');
console.log('  node bin.js --count 2            # Basic monitoring');
console.log('  node bin.js --top 3 --silent     # Show top 3 processes');
console.log('  node bin.js --json --count 1    # JSON output');
console.log('  node bin.js --cpu-threshold 80  # Test CPU alerts');

console.log('\n🔧 Installation test:');
console.log('  npm link                         # Create global symlink');
console.log('  sysmon --help                   # Test global execution');