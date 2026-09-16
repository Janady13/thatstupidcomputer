import { useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router';
import App from './App';
import { getPage } from '../../../packages/site/content';
import { renderHead } from '../../../packages/site/search';
import type { PublicSiteConfig } from '../../../packages/site/truth';

const initialConfig: PublicSiteConfig = (() => {
  const text = document.getElementById('tsc-config')?.textContent || '';
  if (text.trim() && !text.includes('<!--tsc-config-->')) return JSON.parse(text) as PublicSiteConfig;
  return {
    deployment: 'preview', canonicalOrigin: 'https://thatstupidcomputer.com',
    siteName: 'That Stupid Computer', websiteId: 'https://thatstupidcomputer.com/#website',
    contact: {}, truthStatus: 'unavailable-preview',
    crawlerPolicy: { training: 'deny', googleExtended: 'deny', source: 'preview-default' },
  };
})();

function RoutedApplication() {
  const location = useLocation();
  const [config, setConfig] = useState(initialConfig);
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/config', { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' })
      .then(response => response.ok ? response.json() as Promise<unknown> : null)
      .then(data => {
        if (!data || typeof data !== 'object' || !('analytics' in data)) return;
        const analytics = data.analytics;
        if (!analytics || typeof analytics !== 'object' || !('measurementId' in analytics)) return;
        const id = analytics.measurementId;
        setConfig(previous => ({ ...previous, ga4MeasurementId: typeof id === 'string' && /^G-[A-Z0-9]{5,20}$/.test(id) ? id : undefined }));
      }).catch(() => { /* Optional measurement configuration must not interrupt the website. */ });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const parsed = new DOMParser().parseFromString(renderHead(getPage(location.pathname), config), 'text/html');
    document.head.querySelectorAll('[data-tsc-head]').forEach(node => node.remove());
    for (const element of Array.from(parsed.head.children)) {
      if (!['TITLE', 'META', 'LINK', 'SCRIPT'].includes(element.tagName)) continue;
      if (element.tagName === 'SCRIPT' && element.getAttribute('type') !== 'application/ld+json') continue;
      const node = document.importNode(element, true);
      node.setAttribute('data-tsc-head', '');
      document.head.append(node);
    }
  }, [location.pathname, config]);
  return <App path={location.pathname} config={config} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('The website root element is missing.');
const application = <BrowserRouter><RoutedApplication /></BrowserRouter>;
if (root.querySelector('[data-testid="workshop"]') || root.children.length > 0) hydrateRoot(root, application);
else createRoot(root).render(application);
