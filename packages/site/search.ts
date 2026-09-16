import { getPage, ROUTES, type SitePage, type RoutePath } from './content.ts';
import type { PublicSiteConfig } from './truth.ts';
import { ROBOTS_POLICIES, PUBLISHER_META } from '../discovery/registry.ts';

export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  robots: string;
  openGraph: { type: 'website'; siteName: string; title: string; description: string; url?: string };
}
export const NOT_FOUND = {
  title: 'Page not found',
  description: 'This page could not be found. Explore the services or return to the workshop.',
};
export const absoluteUrl = (path: string, config: PublicSiteConfig): string => `${config.canonicalOrigin}${path}`;
export function metadataForPage(page: SitePage | undefined, config: PublicSiteConfig): PageMetadata {
  const title = `${page?.title ?? NOT_FOUND.title} | ${config.siteName}`;
  const description = page?.description ?? NOT_FOUND.description;
  const canonical = page ? absoluteUrl(page.path, config) : undefined;
  const robots = config.deployment === 'production' && page
    ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
  return { title, description, ...(canonical ? { canonical } : {}), robots,
    openGraph: { type: 'website', siteName: config.siteName, title, description, ...(canonical ? { url: canonical } : {}) } };
}
export function breadcrumbsForPage(page: SitePage): Array<{ label: string; path: RoutePath }> {
  const output: Array<{ label: string; path: RoutePath }> = [];
  const visited = new Set<RoutePath>();
  let current: SitePage | undefined = page;
  while (current) {
    if (visited.has(current.path)) throw new Error('Cycle in page hierarchy');
    visited.add(current.path);
    output.unshift({ label: current.navLabel, path: current.path });
    current = current.parent ? getPage(current.parent) : undefined;
  }
  return output;
}
type GraphNode = Record<string, unknown> & { '@id': string; '@type': string };
export function buildGraph(page: SitePage | undefined, config: PublicSiteConfig): { '@context': string; '@graph': GraphNode[] } | undefined {
  if (!page) return undefined;
  const url = absoluteUrl(page.path, config);
  const ref = (id: string) => ({ '@id': id });
  const website: GraphNode = {
    '@type': 'WebSite', '@id': config.websiteId, url: `${config.canonicalOrigin}/`, name: config.siteName, inLanguage: 'en',
    ...(config.publisher ? { publisher: ref(config.publisher.id) } : {}),
    ...(config.brand ? { about: ref(config.brand.id) } : {}),
  };
  const webpage: GraphNode = {
    '@type': page.path === '/about/' ? 'AboutPage' : page.path === '/contact/' ? 'ContactPage' : page.path === '/services/' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'en', isPartOf: ref(config.websiteId),
    ...(page.path !== '/' ? { breadcrumb: ref(`${url}#breadcrumbs`) } : {}),
  };
  const graph: GraphNode[] = [website, webpage];
  const sections = page.sections.filter(section => section.id);
  const ids = new Set<string>();
  for (const section of sections) {
    const id = section.id!;
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) || ids.has(id) || ['website', 'webpage', 'breadcrumbs', 'service', 'main-content'].includes(id)) throw new Error('Invalid or duplicate public answer anchor');
    ids.add(id);
    graph.push({ '@type': 'WebPageElement', '@id': `${url}#${id}`, url: `${url}#${id}`,
      name: section.heading, text: [...(section.paragraphs ?? []), ...(section.items ?? [])].join('\n\n'),
      inLanguage: 'en', cssSelector: `#${id}`, isPartOf: ref(webpage['@id']),
      ...(section.sources?.length ? { citation: section.sources.map(source => source.href) } : {}),
    });
  }
  if (sections.length) webpage.hasPart = sections.map(section => ref(`${url}#${section.id}`));
  if (page.path !== '/') graph.push({
    '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`,
    itemListElement: breadcrumbsForPage(page).map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.label, item: absoluteUrl(crumb.path, config) })),
  });
  if (page.service) {
    const serviceId = `${url}#service`;
    webpage.mainEntity = ref(serviceId);
    graph.push({ '@type': 'Service', '@id': serviceId, url, name: page.service.name,
      serviceType: page.service.serviceType, description: page.intro, mainEntityOfPage: ref(webpage['@id']),
      ...(config.provider ? { provider: ref(config.provider.id) } : {}),
      ...(config.brand ? { brand: ref(config.brand.id) } : {}),
    });
  }
  const externalIds = [config.publisher?.id, config.provider?.id, config.brand?.id].filter(Boolean);
  if (graph.some((node) => externalIds.includes(node['@id']))) throw new Error('Canonical identity collides with a site-owned document or service');
  return { '@context': 'https://schema.org', '@graph': graph };
}
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
/** Safe inside a script element; JSON remains parseable after HTML-dangerous characters are escaped. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function renderHead(page: SitePage | undefined, config: PublicSiteConfig): string {
  const metadata = metadataForPage(page, config);
  const attr = (kind: 'name' | 'property', key: string, value: string) => `<meta ${kind}="${key}" content="${escapeHtml(value)}">`;
  const head = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    attr('name', 'description', metadata.description), attr('name', 'robots', metadata.robots),
    ...PUBLISHER_META.map(({ name, content }) => attr('name', name, config.deployment === 'production' && page ? content : 'noindex, nofollow')),
    ...(metadata.canonical ? [`<link rel="canonical" href="${escapeHtml(metadata.canonical)}">`] : []),
    attr('property', 'og:type', metadata.openGraph.type), attr('property', 'og:site_name', config.siteName),
    attr('property', 'og:title', metadata.title), attr('property', 'og:description', metadata.description),
    ...(metadata.canonical ? [attr('property', 'og:url', metadata.canonical)] : []),
    attr('name', 'twitter:card', config.socialImage ? 'summary_large_image' : 'summary'),
    attr('name', 'twitter:title', metadata.title), attr('name', 'twitter:description', metadata.description),
  ];
  if (config.socialImage) head.push(
    attr('property', 'og:image', config.socialImage.url), attr('property', 'og:image:alt', config.socialImage.alt),
    attr('property', 'og:image:width', String(config.socialImage.width)), attr('property', 'og:image:height', String(config.socialImage.height)),
    attr('name', 'twitter:image', config.socialImage.url), attr('name', 'twitter:image:alt', config.socialImage.alt),
  );
  if (config.verification?.google) head.push(attr('name', 'google-site-verification', config.verification.google));
  if (config.verification?.bing) head.push(attr('name', 'msvalidate.01', config.verification.bing));
  const graph = buildGraph(page, config);
  if (graph) head.push(`<script id="site-structured-data" type="application/ld+json">${safeJson(graph)}</script>`);
  return head.join('\n');
}
export function sitemapXml(config: PublicSiteConfig): string {
  const urls = config.deployment === 'production' ? ROUTES.map((page) => `  <url><loc>${escapeHtml(absoluteUrl(page.path, config))}</loc></url>`).join('\n') : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
/** Public search access with explicit, independent deployment choices for broader model-use permissions. */
export function robotsTxt(config: PublicSiteConfig): string {
  if (config.deployment === 'production' && config.crawlerPolicy.source !== 'deployment-config') throw new Error('Production robots requires an explicitly configured crawler policy');
  const utility = ['Disallow: /api/', 'Disallow: /private/', 'Disallow: /native/', 'Disallow: /__'];
  const policyGroup = (agent: string, policy: 'allow' | 'deny') => [`User-agent: ${agent}`, ...(policy === 'allow' ? ['Allow: /', ...utility] : ['Disallow: /']), ''];
  const groups = [
    '# Public search discovery; private resources also require server-side access controls.',
    ...(config.deployment === 'preview' ? ['# Preview HTML and response headers carry noindex. Crawling stays open so the directive can be read.'] : []),
    'User-agent: *', 'Allow: /', ...utility, '',
    '# Provider modules own discovery, training and user-retrieval controls.',
    '# Google-Extended governs specified Gemini training and grounding, not Google Search.',
    '# User-triggered robots behavior varies; private resources require authorization.',
    ...ROBOTS_POLICIES.flatMap(({agent,policy})=>policyGroup(agent,
      policy==='openaiTraining' ? config.crawlerPolicy.openaiTraining ?? config.crawlerPolicy.training :
      policy==='anthropicTraining' ? config.crawlerPolicy.anthropicTraining ?? config.crawlerPolicy.training :
      policy==='mistralTraining' ? config.crawlerPolicy.mistralTraining ?? config.crawlerPolicy.training :
      policy==='googleExtended' ? config.crawlerPolicy.googleExtended : policy)),
  ];
  if (config.deployment === 'production') groups.push(`Sitemap: ${config.canonicalOrigin}/sitemap.xml`, '');
  return groups.join('\n');
}
