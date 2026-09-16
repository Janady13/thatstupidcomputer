import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
if (existsSync('.env')) process.loadEnvFile('.env');
const children = [
  spawn(process.execPath, ['--import', 'tsx', 'apps/api/src/index.ts'], { cwd: root, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development', HOST: '127.0.0.1', PORT: '3001', PUBLIC_ORIGIN: 'http://localhost:5173', ALLOWED_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173' } }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--config', 'apps/web/vite.config.ts'], { cwd: root, stdio: 'inherit', env: process.env }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(child => { if (child.exitCode === null) child.kill('SIGTERM'); });
  const deadline = setTimeout(() => { children.forEach(child => { if (child.exitCode === null) child.kill('SIGKILL'); }); process.exit(code); }, 5000);
  deadline.unref();
  process.exitCode = code;
}
children.forEach(child => { child.on('error', () => stop(1)); child.on('exit', code => { if (!stopping) stop(code || 0); }); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
