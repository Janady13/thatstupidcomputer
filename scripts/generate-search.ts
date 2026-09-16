import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { robotsTxt, sitemapXml } from '../packages/site/search.ts';
import { loadSiteConfig, type PublicSiteConfig } from '../packages/site/truth.ts';

export async function generateSearch({ outDir, config }: { outDir: string; config: PublicSiteConfig }): Promise<void> {
  if (config.deployment === 'production' && config.truthStatus !== 'approved-projection') throw new Error('Production search assets require the approved public truth projection');
  await mkdir(outDir, { recursive: true });
  await writeFile(resolve(outDir, 'robots.txt'), robotsTxt(config));
  await writeFile(resolve(outDir, 'sitemap.xml'), sitemapXml(config));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const deployment = process.argv.includes('--production') ? 'production' : 'preview';
  const outArg = process.argv.find((arg) => arg.startsWith('--out='));
  await generateSearch({ outDir: outArg?.slice(6) ?? 'apps/web/dist', config: loadSiteConfig({ deployment }) });
}
