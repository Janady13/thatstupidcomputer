import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
if (!existsSync('apps/api/dist/server.mjs') || !existsSync('apps/web/dist/index.html')) throw new Error('Run npm run build before preview.');
if (existsSync('.env')) process.loadEnvFile('.env');
const port = process.env.PREVIEW_PORT || '4173';
const child = spawn(process.execPath, ['apps/api/dist/server.mjs'], {
  cwd: root, stdio: 'inherit', env: {
    ...process.env, NODE_ENV: 'development', HOST: '127.0.0.1', PORT: port,
    PUBLIC_ORIGIN: `http://localhost:${port}`, ALLOWED_ORIGINS: `http://localhost:${port},http://127.0.0.1:${port}`,
  },
});
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code || 0; });
