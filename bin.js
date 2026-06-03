#!/usr/bin/env node

const { SysMonitor } = require('./index');
const { parseArgs } = require('./cli-args');

const args = process.argv.slice(2);
const options = parseArgs(args);

async function main() {
  const monitor = new SysMonitor();
  const interval = parseInt(options.interval) * 1000;
  const count = options.continuous ? Infinity : parseInt(options.count);
  const topCount = parseInt(options.top);

  let snapshotCount = 0;
  const alerts = [];

  const formatOutput = (snapshot, index) => {
    if (options.json) {
      console.log(JSON.stringify(snapshot, null, 2));
    } else if (options.csv) {
      if (index === 0) {
        console.log('timestamp,cpu_usage,memory_usage,disk_usage,load_1,load_5,load_15,top_cpu_process,top_mem_process');
      }
      const topCpuProcess = snapshot.processes[0] || { cpu: 0 };
      const topMemProcess = snapshot.processes.sort((a, b) => (b.memory || 0) - (a.memory || 0))[0] || { memory: 0 };
      console.log(`${snapshot.timestamp},${snapshot.cpu.usage},${snapshot.memory.usage},0,${snapshot.load[0]},${snapshot.load[1]},${snapshot.load[2]},${topCpuProcess.command},${topMemProcess.command}`);
    } else if (!options.silent) {
      console.clear();
      console.log(`System Resource Monitor - ${snapshot.timestamp}`);
      console.log('─'.repeat(60));
      
      console.log(`CPU: ${snapshot.cpu.usage.toFixed(1)}% | Cores: ${snapshot.cpu.cores} | Model: ${snapshot.cpu.model}`);
      console.log(`Memory: ${snapshot.memory.usage.toFixed(1)}% (${Math.round(snapshot.memory.used / 1024 / 1024 / 1024)}GB/${Math.round(snapshot.memory.total / 1024 / 1024 / 1024)}GB)`);
      console.log(`Load Average: ${snapshot.load[0].toFixed(2)}, ${snapshot.load[1].toFixed(2)}, ${snapshot.load[2].toFixed(2)}`);
      
      if (snapshot.processes.length > 0) {
        console.log('\nTop Processes by CPU:');
        snapshot.processes.slice(0, topCount).forEach(process => {
          const name = process.command.split(' ')[0] || 'Unknown';
          console.log(`  ${name}: ${process.cpu}% CPU | PID: ${process.pid}`);
        });
      }
      
      console.log('\n' + '─'.repeat(60));
    }

    // Check thresholds
    checkThresholds(snapshot, index);
  };

  const checkThresholds = (snapshot, index) => {
    const currentAlerts = [];
    
    if (options.cpuThreshold && snapshot.cpu.usage > parseFloat(options.cpuThreshold)) {
      currentAlerts.push(`⚠️  CPU usage ${snapshot.cpu.usage.toFixed(1)}% exceeds threshold ${options.cpuThreshold}%`);
    }
    
    if (options.memThreshold && snapshot.memory.usage > parseFloat(options.memThreshold)) {
      currentAlerts.push(`⚠️  Memory usage ${snapshot.memory.usage.toFixed(1)}% exceeds threshold ${options.memThreshold}%`);
    }
    
    if (options.diskThreshold && snapshot.disk.usage > parseFloat(options.diskThreshold)) {
      currentAlerts.push(`⚠️  Disk usage ${snapshot.disk.usage.toFixed(1)}% exceeds threshold ${options.diskThreshold}%`);
    }
    
    if (currentAlerts.length > 0) {
      if (!options.silent) {
        console.log('\n🚨 ALERTS:');
        currentAlerts.forEach(alert => console.log(`  ${alert}`));
      }
      alerts.push(...currentAlerts);
    }
  };

  try {
    await monitor.start(
      { interval, count },
      (snapshot, index) => {
        snapshotCount++;
        formatOutput(snapshot, index);
      }
    );

    if (!options.continuous && !options.silent) {
      console.log(`\nMonitoring complete. ${snapshotCount} snapshots captured.`);
      if (alerts.length > 0) {
        console.log(`\n📋 Summary alerts (${alerts.length}):`);
        alerts.slice(0, 5).forEach(alert => console.log(`  ${alert}`));
        if (alerts.length > 5) {
          console.log(`  ... and ${alerts.length - 5} more`);
        }
      }
    }
  } catch (error) {
    console.error('Error monitoring system:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}