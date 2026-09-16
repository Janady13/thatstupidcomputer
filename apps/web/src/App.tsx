import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { getPage, NAVIGATION } from '../../../packages/site/content';
import { breadcrumbsForPage } from '../../../packages/site/search';
import type { PublicSiteConfig } from '../../../packages/site/truth';
import { AnimationProvider, useAnimation } from './animation/orchestration/AnimationProvider';
import { Workshop } from './components/Workshop';
import { ServiceBoardScenery } from './components/ServiceBoardScenery';
import { DemoForm } from './components/DemoForm';
import { ContentSections, LiveWorkSample, RelatedPages } from './components/PageContent';
import { Icon } from './components/Icons';
import { analytics, ConsentControls, type SceneAction } from './measurement';
import './animation/animation.css';
import './styles/site.css';

export interface AppProps { path?: string; config: PublicSiteConfig; submissionId?: string }

export function App(props: AppProps) {
  return <AnimationProvider><Website {...props} /></AnimationProvider>;
}

function Website({ config, submissionId }: AppProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const page = getPage(location.pathname);
  const path = page?.path ?? location.pathname;
  const home = path === '/';
  const contact = path === '/contact/';
  const serviceBoard = path.startsWith('/services/') && !!page;
  const { state, send, cue } = useAnimation();
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const previousPath = useRef(path);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const triggerIdentity = useRef<{ href: string; className: string } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const paused = state.paused || reduced;

  useEffect(() => {
    analytics.configure({ ga4MeasurementId: config.ga4MeasurementId, canonicalOrigin: config.canonicalOrigin });
  }, [config.ga4MeasurementId, config.canonicalOrigin]);

  useEffect(() => {
    setReady(true);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    cue('visitor.arrived');
    return () => media.removeEventListener('change', update);
  // The animation cue is an event dispatcher; this entrance fires once per mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    analytics.pageView(path);
    if (mobileMenu.current) mobileMenu.current.open = false;
    if (previousPath.current !== path) {
      // Reset the reading page first, then let focus reveal the original workshop link.
      if (serviceBoard || previousPath.current.startsWith('/services/')) window.scrollTo({ top: 0, behavior: 'instant' });
      // Room hotspots are SVG anchors, so compare the class attribute rather than className (an SVGAnimatedString there).
      const restoredTrigger = home && triggerIdentity.current ? Array.from(document.querySelectorAll<HTMLAnchorElement | SVGAElement>('a[href]')).find(anchor => anchor.getAttribute('href') === triggerIdentity.current?.href && (anchor.getAttribute('class') ?? '') === triggerIdentity.current?.className) : undefined;
      if (home && trigger.current?.isConnected) trigger.current.focus();
      else if (restoredTrigger) restoredTrigger.focus();
      else heading.current?.focus({ preventScroll: true });
      panel.current?.scrollTo({ top: 0 });
      previousPath.current = path;
    }
  }, [path, home, serviceBoard]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (mobileMenu.current?.open) { mobileMenu.current.open = false; mobileMenu.current.querySelector('summary')?.focus(); return; }
      if (!home) { event.preventDefault(); navigate('/'); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [home, navigate]);

  const rememberTrigger = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    if (home && anchor && anchor.getAttribute('href') !== '/') { trigger.current = anchor; triggerIdentity.current = { href: anchor.getAttribute('href') ?? '/', className: anchor.getAttribute('class') ?? '' }; }
  };
  const interaction = (action: SceneAction) => analytics.sceneInteraction(window.matchMedia('(max-width: 767px)').matches ? 'mobile-workshop' : 'desktop-office', action);
  const startDemo = (source: 'hero' | 'navigation' | 'footer' | 'contact') => { analytics.demoStart(source); cue('project.started'); };
  const navigation = <>{NAVIGATION.filter(item => item.path !== '/' && item.path !== '/contact/').map(item => <Link key={item.path} to={item.path} aria-current={path === item.path ? 'page' : undefined}>{item.navLabel}</Link>)}</>;

  return <div className={`site-shell ${home ? 'is-home' : 'has-page'} ${serviceBoard ? 'has-board' : ''} ${paused ? 'motion-paused' : ''}`} onClickCapture={rememberTrigger}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {!home && <Workshop path={path} paused={paused} onInteraction={interaction} readingBoard={serviceBoard} />}
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="That Stupid Computer — home"><span>that stupid</span><span>computer<span className="wordmark-period">.</span></span></Link>
      <nav className="desktop-navigation" aria-label="Main navigation">{navigation}</nav>
      <div className="header-actions"><Link className="button button-dark header-demo" to="/contact/" onClick={() => startDemo('navigation')}>Get my demo<Icon name="arrow" /></Link><details className="mobile-navigation" ref={mobileMenu}><summary aria-label="Open navigation"><Icon name="menu" /><span>Menu</span></summary><nav aria-label="Mobile navigation">{navigation}<Link to="/contact/" onClick={() => startDemo('navigation')}>Get my demo <Icon name="arrow" /></Link></nav></details></div>
    </header>

    {home ? <main id="main-content" className="home-content" tabIndex={-1}>
      <div className="hero-copy"><p className="eyebrow"><span className="status-dot" />Websites with a little more human</p><h1 ref={heading} tabIndex={-1}>{page?.heading ?? 'Less stupid. More business.'}</h1><p className="hero-intro">{page?.intro}</p><Link className="button button-rust hero-demo" to="/contact/" onClick={() => startDemo('hero')}>Get my demo<Icon name="arrow" /></Link><p className="hero-footnote">Good websites start with a conversation.</p></div>
      <Workshop path={path} paused={paused} onInteraction={interaction} />
      <section className="home-overview" aria-label="Website services and next steps"><ContentSections sections={page?.sections ?? []} type="guide" /></section>
    </main> : <>
      {!serviceBoard && <div className="panel-scene-note" aria-hidden="true"><span>Less frustration.</span><strong>More possibility.</strong><span className="scene-note-rule" /><p>The computer has opinions.<br />Your website should have a purpose.</p></div>}
      <main id="main-content" ref={panel} className={serviceBoard ? 'service-board' : `page-panel ${contact ? 'page-panel-contact' : ''}`} data-testid={serviceBoard ? 'service-board' : undefined} tabIndex={-1}>
        {serviceBoard && <ServiceBoardScenery paused={paused} />}
        <div className="panel-topline"><Link to={page?.parent && page.parent !== '/' ? page.parent : '/'} className="back-link"><span aria-hidden="true">←</span>{page?.parent === '/services/' ? 'All services' : 'Back to the workshop'}</Link>{!serviceBoard && <Link to="/" className="close-panel" aria-label="Close page and return to the workshop"><Icon name="close" /></Link>}</div>
        {page ? <article>
          <nav className="breadcrumb" aria-label="Breadcrumb"><ol>{breadcrumbsForPage(page).map((crumb, index, items) => <li key={crumb.path}>{index > 0 && <span aria-hidden="true">/</span>}{index === items.length - 1 ? <span aria-current="page">{crumb.label}</span> : <Link to={crumb.path}>{crumb.label}</Link>}</li>)}</ol></nav>
          <header className="page-heading"><p className="eyebrow">{page.eyebrow}</p><h1 ref={heading} tabIndex={-1}>{page.heading}</h1><p className="page-intro">{page.intro}</p></header>
          {path === '/work/' && <LiveWorkSample />}
          {path === '/about/' && (config.publisher || config.provider || config.brand) && <section className="approved-identity content-section"><h2>The people behind the work</h2>{config.brand && <p>Explore the <a href={config.brand.url}>{config.brand.name}</a> brand.</p>}{config.provider && <p>Website services are provided by <a href={config.provider.url}>{config.provider.name}</a>.</p>}{config.publisher && <p>This website is published by <a href={config.publisher.url}>{config.publisher.name}</a>.</p>}</section>}
          {page.service && config.provider && <p className="provider-credit">A service from <a href={config.provider.url}>{config.provider.name}</a>.</p>}
          {contact && <DemoForm key={path} submissionId={submissionId} email={config.contact?.email} intentSearch={location.search} />}
          <ContentSections sections={page.sections} type={path === '/services/' ? 'services' : path === '/process/' ? 'process' : contact ? 'contact' : undefined} />
          {!contact && <aside className="page-callout"><Icon name="spark" width="32" height="32" /><h2>{path === '/privacy/' ? 'Have a question?' : 'Your business deserves a good website.'}</h2><p>{path === '/privacy/' ? 'Let’s talk about how your information is handled.' : 'Tell us what you have in mind. We’ll start with the useful questions.'}</p><Link className="button button-rust" to={page.cta.href} onClick={() => startDemo('contact')}>{path === '/privacy/' ? page.cta.label : 'Get my demo'}<Icon name="arrow" /></Link></aside>}
          <RelatedPages page={page} />
        </article> : <article><header className="page-heading"><p className="eyebrow">Well, this is awkward</p><h1 ref={heading} tabIndex={-1}>The computer misplaced that page.</h1><p className="page-intro">That address doesn’t lead to a page here. The workshop is still open.</p></header><Link className="button button-rust" to="/">Back to the workshop<Icon name="arrow" /></Link><Link className="text-link" to="/services/">See what we do<Icon name="arrow" /></Link></article>}
        <footer className="panel-footer"><span>That Stupid Computer</span><Link to="/privacy/">Privacy</Link></footer>
      </main>
    </>}
    <footer className="site-footer"><div className="footer-left"><span className="footer-credit">Serious about websites.<br /><strong>Less serious about ourselves.</strong></span><Link to="/privacy/">Privacy</Link></div><div className="footer-right"><ConsentControls /><button className="motion-control" type="button" disabled={!ready || reduced} aria-pressed={paused} onClick={() => { send({ type: state.paused ? 'PLAY' : 'PAUSE' }); interaction(state.paused ? 'motion_play' : 'motion_pause'); }}><Icon name={paused ? 'play' : 'pause'} /><span>{reduced ? 'Reduced motion' : state.paused ? 'Play motion' : 'Pause motion'}</span></button></div></footer>
  </div>;
}

export default App;
