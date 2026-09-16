import { createApp } from './app.js';
import { loadConfig } from './config.js';

async function start() {
  const config = loadConfig();
  const app = await createApp();
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => {
      process.stderr.write('Shutdown deadline exceeded.\n');
      process.exit(1);
    }, 30_000);
    deadline.unref();
    try { await app.close(); clearTimeout(deadline); process.exitCode = 0; }
    catch { clearTimeout(deadline); process.stderr.write('Shutdown failed.\n'); process.exitCode = 1; }
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  await app.listen({ host: config.host, port: config.port });
}
start().catch(() => { process.stderr.write('Server startup failed. Check protected runtime configuration.\n'); process.exitCode = 1; });
