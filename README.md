# sysmon - Zero-Dependency System Monitoring Tool

A minimal, zero-dependency system resource monitoring and analysis tool for developers and system administrators.

## Why sysmon?

When you need to check system performance without installing bloated monitoring tools or complex dependencies, sysmon gives you clean, real-time insights with zero external dependencies. Built for situations where you need quick answers, not complex setup.

## Features

- **Resource Tracking**: CPU, Memory, Disk Usage, Network I/O
- **Process Analysis**: Top processes by resource usage
- **Historical Data**: Track trends over time with configurable intervals
- **Multiple Output Formats**: Terminal tables, JSON, CSV for easy parsing
- **Threshold Alerts**: Get notified when resources exceed limits
- **Cross-Platform**: Works on Linux, macOS, and Windows (Node.js >= 18.0.0)
- **Zero Dependencies**: No npm packages required

## Quick Start

```bash
npx sysmon --interval 5 --count 10  # Monitor for 10 intervals of 5 seconds
sysmon --top 5                      # Show top 5 processes by CPU usage
sysmon --json                      # Output in JSON format
```

## Installation

```bash
npm install -g sysmon
```

## Usage

### Basic Monitoring

```bash
# Monitor system every 2 seconds, 3 times
sysmon --interval 2 --count 3

# Continuous monitoring (Ctrl+C to stop)
sysmon
```

### Process Analysis

```bash
# Top 10 CPU-consuming processes
sysmon --top 10 --cpu

# Top 5 memory-consuming processes
sysmon --top 5 --mem

# Show processes using most disk I/O
sysmon --top 8 --disk
```

### Output Formats

```bash
# JSON output for scripting
sysmon --json --count 5

# CSV format for spreadsheet analysis
sysmon --csv --interval 10 --count 3

# Pretty terminal tables (default)
sysmon
```

### Threshold Alerts

```bash
# Alert when CPU exceeds 80%
sysmon --cpu-threshold 80 --count 5

# Alert when memory exceeds 90%
sysmon --mem-threshold 90 --interval 30
```

## API Usage

```javascript
const { SysMonitor } = require('./index');

const monitor = new SysMonitor();

// Get current snapshot
const snapshot = await monitor.snapshot();
console.log(`CPU: ${snapshot.cpu.usage.toFixed(1)}%`);

// Start monitoring with callback
monitor.start({
  interval: 2000,
  count: 10
}, (snapshot, index) => {
  console.log(`Snapshot ${index}: ${snapshot.cpu.usage}% CPU`);
});
```

## Examples

### Development Server Monitoring

```bash
# Monitor while running dev server
node server.js & sysmon --interval 3 --top 5
```

### Production Analysis

```bash
# Check server performance over 5 minutes
sysmon --interval 60 --count 5 --json > server-stats.json
```

### Quick Health Check

```bash
# Simple one-liner health check
sysmon --count 1 | grep -E "(CPU|Memory|Disk)"
```

## Output Format

### Terminal Table (Default)

```
System Resource Monitor - 2024-06-03 11:56:00
┌─────────────────────────────────────────────────────┐
│              Resource Usage                          │
├─────────────────┬───────────┬───────────┬───────────┤
│     CPU         │ 23.4%     │ 1 core    │ 2.4°C     │
│     Memory      │ 62.1%     │ 8.3/12GB  │ 823MB/s   │
│     Disk        │ 45.8%     │ 256/500GB │ 1.2MB/s   │
│     Network     │ 125KB/s  │ ↓/↑       │           │
├─────────────────┼───────────┼───────────┼───────────┤
│    Processes (Top 3)                                  │
│     node       │ 45.2%     │ 1.2GB     │ 512MB/s   │
│     chrome     │ 12.8%     │ 3.4GB     │ 128MB/s   │
│     vscode     │ 8.3%      │ 1.8GB     │ 64MB/s    │
└─────────────────┴───────────┴───────────┴───────────┘
```

### JSON Output

```json
{
  "timestamp": "2024-06-03T11:56:00.000Z",
  "cpu": {
    "usage": 23.4,
    "cores": 4,
    "temperature": 2.4
  },
  "memory": {
    "usage": 62.1,
    "total": 12884901888,
    "used": 8000000000,
    "available": 4884901888,
    "swap": {
      "total": 8589934592,
      "used": 0
    }
  },
  "disk": {
    "usage": 45.8,
    "total": 500000000000,
    "used": 229000000000,
    "free": 271000000000,
    "readSpeed": 1200000,
    "writeSpeed": 800000
  },
  "network": {
    "downloadSpeed": 125000,
    "uploadSpeed": 45000
  },
  "processes": [
    {
      "pid": 1234,
      "name": "node",
      "cpu": 45.2,
      "memory": 1200000000,
      "diskRead": 512000000,
      "diskWrite": 256000000
    }
  ]
}
```

## Development

```bash
git clone https://github.com/sulthonzh/sysmon
cd sysmon
npm install
npm test
```

## License

MIT - see LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Run tests: `npm test`
5. Submit a pull request

## Related Tools

- [jflat](https://github.com/sulthonzh/jflat) - JSON flattening/unflattening
- [sqlfmt](https://github.com/sulthonzh/sqlfmt) - SQL formatter
- [dbmigrate](https://github.com/sulthonzh/dbmigrate) - Database migration tool

Built with ❤️ for developers who value simplicity and performance.