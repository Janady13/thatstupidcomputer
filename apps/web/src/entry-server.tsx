import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import type { PublicSiteConfig } from '../../../packages/site/truth';

export function render(path: string, config: PublicSiteConfig) {
  return renderToString(<StaticRouter location={path}><App path={path} config={config} /></StaticRouter>);
}
