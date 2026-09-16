import { realpath, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import { INQUIRY_PATH, parseDemoIntent } from '../../../packages/site/inquiry.mjs';

export const htmlRoutes = [
  '/', '/services/', '/services/website-design/', '/services/website-rescue/',
  '/services/search-visibility/', '/services/website-care/', '/work/', '/process/', '/about/', INQUIRY_PATH, '/privacy/',
] as const;
const allowedExt = new Set(['.css', '.js', '.mjs', '.wasm', '.riv', '.glb', '.gltf', '.bin', '.woff', '.woff2', '.ttf', '.otf', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico', '.mp4', '.webm']);
const rootFiles = new Set(['/favicon.ico', '/favicon.svg', '/robots.txt', '/sitemap.xml', '/llms.txt', '/site.webmanifest', '/manifest.webmanifest', '/og-image.png', '/og-image.jpg', '/og-image.webp', '/apple-touch-icon.png']);
const assetPrefixes = ['/assets/', '/animation/', '/models/', '/images/', '/fonts/', '/rive/'];
// Finite source observations agreed with the measurement contract. Unrecognized
// campaign values and visitor identifiers are never reflected into Location.
const allowedAttributionSources = new Set(['chatgpt.com', 'perplexity.ai', 'claude.ai', 'copilot.microsoft.com', 'gemini.google.com']);
function canonicalLocation(route: string, rawUrl: string): string {
  const queryStart = rawUrl.indexOf('?');
  const search = queryStart < 0 ? '' : rawUrl.slice(queryStart);
  const sources = new URLSearchParams(search).getAll('utm_source');
  const retained = new URLSearchParams();
  if (sources.length === 1 && allowedAttributionSources.has(sources[0])) retained.set('utm_source', sources[0]);
  const intent = route === INQUIRY_PATH ? parseDemoIntent(search) : null;
  if (intent) {
    retained.set('project', intent.projectType);
    retained.set('from', intent.source);
  }
  return retained.size ? `${route}?${retained}` : route;
}
export const animationJsonPaths = new Set([
  '/animation/manifest.json', '/animation/runtime/version.json',
  '/animation/office/room-manifest.json', '/animation/office/room-motion-map.json', '/animation/office/object-bounds.json',
  ...['app-bot', 'flip-phone', 'handheld', 'pager', 'smartphone'].flatMap(slug =>
    ['motion', 'scene', 'pivots'].map(name => `/animation/mobile/${slug}/${name}.json`)),
]);
function pathIsSafe(path: string): boolean {
  return path.startsWith('/') && !path.includes('//') && !/[\u0000-\u001f\u007f\\%]/.test(path) &&
    !path.split('/').some(part => part.startsWith('.') || ['private', 'node_modules', 'src', 'source', 'native', 'standards'].includes(part.toLowerCase()));
}
export function safeDecodedPath(url: string): string | null {
  const raw = url.split('?')[0] || '/';
  // Public routes and asset names are ASCII. Reject encoded aliases before
  // Fastify's decoded route matching can disagree with the browser router.
  if (raw.includes('%')) return null;
  try {
    const path = decodeURIComponent(raw);
    return pathIsSafe(path) ? path : null;
  } catch { return null; }
}
export async function registerStatic(app: FastifyInstance, root: string) {
  const absoluteRoot = resolve(root);
  await app.register(fastifyStatic, {
    root: absoluteRoot, serve: false, dotfiles: 'deny', index: false,
    cacheControl: false, etag: true, lastModified: true,
  });
  async function existsInside(relativeFile: string): Promise<boolean> {
    try {
      const [actualRoot, actualFile] = await Promise.all([realpath(absoluteRoot), realpath(resolve(absoluteRoot, relativeFile))]);
      return actualFile.startsWith(actualRoot + sep) && (await stat(actualFile)).isFile();
    } catch { return false; }
  }
  const notFound = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.headers.accept?.includes('text/html')) {
      if (await existsInside('404.html')) return reply.code(404).type('text/html; charset=utf-8').header('cache-control', 'no-store').sendFile('404.html');
      return reply.code(404).type('text/html; charset=utf-8').header('cache-control', 'no-store').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — That Stupid Computer</title><main><h1>Page not found</h1><p>That address does not have a page.</p><p><a href="/">Return home</a> or <a href="/contact/">get in touch</a>.</p></main></html>');
    }
    return reply.code(404).header('cache-control', 'no-store').send({ ok: false, code: 'not_found', message: 'This resource was not found.', requestId: request.id });
  };
  app.setNotFoundHandler(notFound);
  async function sendHtml(request: FastifyRequest, reply: FastifyReply, file: string) {
    if (!(await existsInside(file))) return notFound(request, reply);
    return reply.header('cache-control', 'public, max-age=0, must-revalidate').type('text/html; charset=utf-8').sendFile(file);
  }
  for (const route of htmlRoutes) {
    const file = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
    app.get(route, (request, reply) => sendHtml(request, reply, file));
    if (route !== '/') {
      app.get(route.slice(0, -1), async (request, reply) => {
        if (!(await existsInside(file))) return notFound(request, reply);
        return reply.header('cache-control', 'public, max-age=3600').redirect(canonicalLocation(route, request.raw.url || ''), 308);
      });
    }
  }
  app.get('/*', async (request, reply) => {
    const path = safeDecodedPath(request.raw.url || '');
    if (!path) return notFound(request, reply);
    if (!rootFiles.has(path) && !animationJsonPaths.has(path) && !(assetPrefixes.some(prefix => path.startsWith(prefix)) && allowedExt.has(extname(path).toLowerCase()))) return notFound(request, reply);
    const file = path.slice(1);
    if (!(await existsInside(file))) return notFound(request, reply);
    const hashed = path.startsWith('/assets/') && /[-.][a-zA-Z0-9_-]{8,}\.(?:js|mjs|css|woff2?|wasm|png|jpe?g|webp|avif|svg)$/.test(path);
    reply.header('cache-control', hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, must-revalidate');
    if (path.endsWith('.wasm')) reply.type('application/wasm');
    if (path.endsWith('.riv')) reply.type('application/octet-stream');
    if (path.endsWith('.webmanifest')) reply.type('application/manifest+json');
    return reply.sendFile(file);
  });
  return {
    async isReady() { return (await Promise.all(htmlRoutes.map(route => existsInside(route === '/' ? 'index.html' : `${route.slice(1)}index.html`)))).every(Boolean); },
  };
}
