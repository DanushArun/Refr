const { spawn } = require('node:child_process');
const os = require('node:os');

function isPrivateLan(address) {
  return (
    address.startsWith('192.168.') ||
    address.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function findLanAddress() {
  const interfaces = os.networkInterfaces();
  const preferredNames = ['en0', 'en1'];
  const names = [...preferredNames, ...Object.keys(interfaces).sort()];

  for (const name of names) {
    if (name.startsWith('utun')) continue;
    const addresses = interfaces[name] ?? [];
    const match = addresses.find((address) => (
      address.family === 'IPv4' &&
      !address.internal &&
      isPrivateLan(address.address)
    ));
    if (match) return match.address;
  }

  throw new Error('No Wi-Fi/LAN IPv4 address found. Check network connection.');
}

function startExpo(address) {
  console.log(`Starting Expo LAN server at exp://${address}:8081`);
  const child = spawn('npx', ['expo', 'start', '--lan', '--clear'], {
    env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: address },
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}

startExpo(findLanAddress());
