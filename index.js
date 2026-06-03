#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

class SysMonitor {
  constructor() {
    this.osType = os.platform();
    this.hostname = os.hostname();
    this.startTime = performance.now();
    this.snapshots = [];
  }

  async snapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      hostname: this.hostname,
      platform: this.osType,
      load: await this.getLoadAverage(),
      cpu: await this.getCPUInfo(),
      memory: this.getMemoryInfo(),
      disk: await this.getDiskInfo(),
      network: await this.getNetworkInfo(),
      processes: await this.getTopProcesses()
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  async getLoadAverage() {
    return os.loadavg();
  }

  async getCPUInfo() {
    const cpus = os.cpus();
    const totalTick = cpus.reduce((sum, cpu) => sum + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
    const totalIdle = cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0);
    
    const prevTick = this.prevTick || totalTick;
    const prevIdle = this.prevIdle || totalIdle;
    
    this.prevTick = totalTick;
    this.prevIdle = totalIdle;
    
    const diffTick = totalTick - prevTick;
    const diffIdle = totalIdle - prevIdle;
    
    const usage = diffTick === 0 ? 0 : 100 - (diffIdle / diffTick * 100);

    return {
      usage: Math.max(0, Math.min(100, usage)),
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0
    };
  }

  getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    const memInfo = {
      usage: Math.round(usage * 10) / 10,
      total: total,
      used: used,
      available: free,
      percentage: `${Math.round(usage)}%`
    };

    // Swap info (Node.js doesn't have built-in swapmem, so we'll use platform-specific approach)
    if (this.osType === 'darwin' || this.osType === 'linux') {
      try {
        const swap = os.swapmem();
        memInfo.swap = {
          total: swap.total,
          used: swap.used,
          free: swap.total - swap.used
        };
      } catch (error) {
        memInfo.swap = {
          total: 0,
          used: 0,
          free: 0,
          error: 'Swap not available on this platform'
        };
      }
    } else {
      memInfo.swap = {
        total: 0,
        used: 0,
        free: 0,
        error: 'Swap monitoring not supported on ' + this.osType
      };
    }

    return memInfo;
  }

  async getDiskInfo() {
    try {
      const stats = await fs.promises.stat('/');
      return {
        usage: 0, // Placeholder - would need more complex implementation
        total: 0,
        used: 0,
        free: 0,
        readSpeed: 0,
        writeSpeed: 0
      };
    } catch (error) {
      return {
        usage: 0,
        total: 0,
        used: 0,
        free: 0,
        readSpeed: 0,
        writeSpeed: 0,
        error: error.message
      };
    }
  }

  async getNetworkInfo() {
    // Placeholder - would need more complex implementation on each platform
    return {
      downloadSpeed: 0,
      uploadSpeed: 0,
      interfaces: Object.keys(os.networkInterfaces())
    };
  }

  async getTopProcesses(count = 5) {
    try {
      const ps = spawn('ps', ['ax', '-o', 'pid,%cpu,%mem,command', '--no-headers', '--sort=-%cpu']);
      const psOutput = await this.streamToString(ps.stdout);
      
      const lines = psOutput.trim().split('\n').slice(0, count);
      return lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          return {
            pid: parts[0],
            cpu: parseFloat(parts[1]) || 0,
            memory: parseFloat(parts[2]) || 0,
            command: parts.slice(3).join(' ')
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      // Fallback for systems without ps
      return [];
    }
  }

  streamToString(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  async start(options = {}, callback) {
    const { interval = 2000, count = Infinity } = options;
    let index = 0;

    const run = async () => {
      if (index >= count) return;

      const snapshot = await this.snapshot();
      if (callback) {
        callback(snapshot, index);
      }

      index++;
      if (index < count) {
        setTimeout(run, interval);
      }
    };

    await run();
    return this.snapshots;
  }
}

module.exports = { SysMonitor };