const { execSync } = require('child_process');

const ports = [3000, 3001, 3002, 5000, 8000];

const run = (command) => {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
};

const stopWindowsPort = (port) => {
  const command = `powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`;
  const output = run(command);
  const pids = new Set(
    output
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter((value) => value && value !== '0')
  );

  for (const pid of pids) {
    run(`taskkill /PID ${pid} /F`);
  }

  return [...pids];
};

const stopUnixPort = (port) => {
  const output = run(`lsof -ti tcp:${port}`);
  const pids = output
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);

  for (const pid of pids) {
    run(`kill -9 ${pid}`);
  }

  return pids;
};

const stopped = [];

for (const port of ports) {
  const pids = process.platform === 'win32'
    ? stopWindowsPort(port)
    : stopUnixPort(port);

  if (pids.length > 0) {
    stopped.push(`${port}: ${pids.join(', ')}`);
  }
}

if (stopped.length > 0) {
  console.log(`Cleared dev ports -> ${stopped.join(' | ')}`);
} else {
  console.log('No existing dev port listeners found.');
}
