// Simple command line argument parser (no external dependencies)
const parseArgs = (args) => {
  const options = {
    interval: '2',
    count: '5',
    top: '5',
    json: false,
    csv: false,
    continuous: false,
    silent: false,
    raw: false,
    outputFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--json') options.json = true;
    else if (arg === '--csv') options.csv = true;
    else if (arg === '--continuous') options.continuous = true;
    else if (arg === '--silent') options.silent = true;
    else if (arg === '--raw') options.raw = true;
    else if (arg.startsWith('--interval')) {
      const parts = arg.split('=');
      options.interval = parts[1] || args[++i];
    }
    else if (arg.startsWith('--count')) {
      const parts = arg.split('=');
      options.count = parts[1] || args[++i];
    }
    else if (arg.startsWith('--top')) {
      const parts = arg.split('=');
      options.top = parts[1] || args[++i];
    }
    else if (arg.startsWith('--cpu-threshold')) {
      const parts = arg.split('=');
      options.cpuThreshold = parts[1] || args[++i];
    }
    else if (arg.startsWith('--mem-threshold')) {
      const parts = arg.split('=');
      options.memThreshold = parts[1] || args[++i];
    }
    else if (arg.startsWith('--disk-threshold')) {
      const parts = arg.split('=');
      options.diskThreshold = parts[1] || args[++i];
    }
    else if (arg.startsWith('--output-file')) {
      const parts = arg.split('=');
      options.outputFile = parts[1] || args[++i];
    }
    else if (arg === '-h' || arg === '--help') {
      console.log(`
sysmon - Zero-dependency system resource monitoring tool

Usage: sysmon [options]

Options:
  -i, --interval <seconds>   Monitoring interval in seconds (default: 2)
  -c, --count <number>      Number of monitoring cycles (default: 5)
  -t, --top <number>        Show top N processes (default: 5)
  --json                    Output in JSON format
  --csv                     Output in CSV format
  --cpu-threshold <percentage> Alert when CPU exceeds percentage
  --mem-threshold <percentage> Alert when memory exceeds percentage
  --disk-threshold <percentage> Alert when disk usage exceeds percentage
  --continuous              Run continuously until interrupted
  --silent                  Silent mode, only show alerts
  --raw                     Raw output without formatting
  --output-file <path>      Save snapshots to file (JSON format)
  -h, --help                Show this help message

Examples:
  sysmon --interval 3 --count 10
  sysmon --top 5 --json
  sysmon --cpu-threshold 80 --continuous
`);
      process.exit(0);
    }
  }

  return options;
};

module.exports = { parseArgs };