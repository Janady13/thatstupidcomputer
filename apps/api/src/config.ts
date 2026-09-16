import { z } from 'zod';

export type Environment = Record<string, string | undefined>;
export interface SmtpConfig {
  host: string; port: number; secure: boolean; user: string; pass: string; from: string; to: string;
}
export interface AppConfig {
  production: boolean;
  host: string;
  port: number;
  origins: ReadonlySet<string>;
  publicOrigin: string | null;
  smtp: SmtpConfig | null;
  measurementId: string | null;
  trustProxy: false | string[];
}
const email = z.string().max(254).email().refine(value => !/[\r\n,;<>\s]/.test(value));
function validOrigin(value: string, production: boolean): string | null {
  try {
    const url = new URL(value);
    if (url.origin !== value || url.username || url.password) return null;
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && !production && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) return null;
    return url.origin;
  } catch { return null; }
}
export function loadConfig(env: Environment = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const candidatePort = Number(env.PORT ?? 3000);
  if (!Number.isInteger(candidatePort) || candidatePort < 1 || candidatePort > 65535) throw new Error('Invalid server port configuration.');
  const host = env.HOST || '127.0.0.1';
  if (!/^[a-zA-Z0-9.:[\]-]+$/.test(host)) throw new Error('Invalid server host configuration.');
  const publicOrigin = env.PUBLIC_ORIGIN ? validOrigin(env.PUBLIC_ORIGIN, production) : null;
  const listedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  const origins = new Set<string>();
  if (publicOrigin) origins.add(publicOrigin);
  for (const origin of listedOrigins) {
    const valid = validOrigin(origin, production);
    if (!valid) throw new Error('Invalid allowed-origin configuration.');
    origins.add(valid);
  }
  if (!production) {
    origins.add(`http://localhost:${candidatePort}`);
    origins.add(`http://127.0.0.1:${candidatePort}`);
  }
  const smtpPort = Number(env.SMTP_PORT || (env.SMTP_SECURE === 'true' ? 465 : 587));
  const smtpHost = env.SMTP_HOST || '';
  const smtpSecure = env.SMTP_SECURE === 'true';
  const complete = Boolean(
    smtpHost && /^[a-zA-Z0-9.-]+$/.test(smtpHost) && smtpHost.length <= 253 &&
    Number.isInteger(smtpPort) && smtpPort > 0 && smtpPort <= 65535 &&
    ['true', 'false'].includes(env.SMTP_SECURE || '') &&
    (smtpPort !== 465 || smtpSecure) &&
    env.SMTP_USER && env.SMTP_USER.length <= 320 && !/[\r\n]/.test(env.SMTP_USER) &&
    env.SMTP_PASS && env.SMTP_PASS.length <= 4096 &&
    email.safeParse(env.SMTP_FROM).success && email.safeParse(env.SMTP_TO).success &&
    (!production || publicOrigin)
  );
  const smtp: SmtpConfig | null = complete ? {
    host: smtpHost, port: smtpPort, secure: smtpSecure,
    user: env.SMTP_USER!, pass: env.SMTP_PASS!, from: env.SMTP_FROM!, to: env.SMTP_TO!,
  } : null;
  // Trust only an explicitly configured proxy address/range, never all clients.
  const proxyList = (env.TRUST_PROXY || '').split(',').map(value => value.trim()).filter(Boolean);
  if (proxyList.some(value => !/^[\da-fA-F.:]+(?:\/\d{1,3})?$/.test(value))) throw new Error('Invalid trusted-proxy configuration.');
  return {
    production, host, port: candidatePort, origins, publicOrigin, smtp,
    measurementId: /^G-[A-Z0-9]{5,20}$/.test(env.GA4_MEASUREMENT_ID || '') ? env.GA4_MEASUREMENT_ID! : null,
    trustProxy: proxyList.length ? proxyList : false,
  };
}
