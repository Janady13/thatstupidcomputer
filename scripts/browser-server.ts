import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from '../apps/api/src/app.js';

/** Browser-fixture server only. Never imports .env or forwards process.env.
 * SMTP remains unconfigured even when the operator's real environment contains keys.
 * Authored for the portable acceptance suite; not launched in the authoring host.
 */
const staticRoot = resolve('apps/web/dist');
const port = Number(process.env.TSC_BROWSER_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('TSC_BROWSER_PORT must be an unprivileged TCP port.');
if (!existsSync(resolve(staticRoot, 'index.html'))) throw new Error('Run npm run build before the browser acceptance suite.');
const app = await createApp({
  env: {
    NODE_ENV: 'test', HOST: '127.0.0.1', PORT: String(port),
    PUBLIC_ORIGIN: `http://127.0.0.1:${port}`,
    ALLOWED_ORIGINS: `http://127.0.0.1:${port},http://localhost:${port}`,
  },
  staticRoot,
  logger: false,
  limits: { globalMax: 10_000, demoMax: 200 },
});
let closing = false;
const close = async () => {
  if (closing) return;
  closing = true;
  await app.close();
};
process.once('SIGINT', () => { void close(); });
process.once('SIGTERM', () => { void close(); });
await app.listen({ host: '127.0.0.1', port });
