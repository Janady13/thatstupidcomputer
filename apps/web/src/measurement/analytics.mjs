/** Basic, opt-in-only GA4. The closed event schema is also the privacy boundary. */
export const CONSENT_KEY = 'tsc.analytics-consent.v1';
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export const DATA_LAYER = 'tscAnalyticsDataLayer';

const ROUTES = Object.freeze({
  '/': 'Home',
  '/services/': 'Services',
  '/services/website-design/': 'Website design',
  '/services/website-rescue/': 'Website rescue',
  '/services/search-visibility/': 'Search visibility',
  '/services/website-care/': 'Website care',
  '/work/': 'Work',
  '/process/': 'Process',
  '/about/': 'About',
  '/contact/': 'Contact',
  '/privacy/': 'Privacy',
  '/404/': 'Page not found',
});
const SCENES = ['desktop-office', 'mobile-workshop'];
const ACTIONS = ['services', 'work', 'process', 'about', 'demo', 'character', 'motion_pause', 'motion_play'];
const SOURCES = ['hero', 'navigation', 'footer', 'contact', 'computer'];
const COMPUTER_STAGES = ['open', 'intent_selected', 'attitude_requested', 'gesture_requested', 'mood_selected', 'back', 'demo_clicked', 'dismissed'];
const COMPUTER_INTENTS = ['design', 'rescue', 'search', 'care', 'unsure', 'not_selected'];
const ERRORS = ['validation', 'network', 'rate_limited', 'unavailable', 'server'];
const RATINGS = ['good', 'needs-improvement', 'poor'];
const REFERRALS = ['chatgpt', 'perplexity', 'claude', 'copilot', 'gemini', 'google', 'bing', 'other_referral', 'unattributed'];
const EVIDENCE = ['allowed_utm', 'referrer_host', 'unavailable'];
const oneOf = (values) => (value) => values.includes(value);
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const finite = (min, max) => (value) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

const schemas = Object.freeze({
  page_view: { page_path: oneOf(Object.keys(ROUTES)), referral_source: oneOf(REFERRALS), referral_evidence: oneOf(EVIDENCE) },
  scene_interaction: { scene_id: oneOf(SCENES), interaction: oneOf(ACTIONS) },
  computer_interaction: { interaction_stage: oneOf(COMPUTER_STAGES), project_intent: oneOf(COMPUTER_INTENTS) },
  demo_start: { entry_point: oneOf(SOURCES) },
  demo_submit_error: { error_type: oneOf(ERRORS) },
  generate_lead: { acceptance: oneOf(['smtp_accepted']) },
  web_vital: { metric_name: oneOf(['CLS', 'INP', 'LCP']), metric_value: finite(0, 3_600_000), metric_rating: oneOf(RATINGS), page_path: oneOf(Object.keys(ROUTES)) },
});

/** Reject extra fields, including common analytics escape hatches and prototype keys. */
export function validateEvent(name, payload) {
  if (!Object.hasOwn(schemas, name) || !record(payload)) return false;
  const schema = schemas[name];
  const keys = Reflect.ownKeys(payload);
  return keys.length === Object.keys(schema).length
    && keys.every((key) => typeof key === 'string' && Object.hasOwn(schema, key)
      && Object.getOwnPropertyDescriptor(payload, key)?.get === undefined
      && schema[key](payload[key]));
}

/** Unknown paths are a fixed bucket; never use document.title, full URLs, or arbitrary path segments. */
export function safeRoute(value) {
  return typeof value === 'string' && Object.hasOwn(ROUTES, value) ? value : '/404/';
}

export function validateConfig(value) {
  const id = record(value) ? value.ga4MeasurementId : undefined;
  const origin = record(value) ? value.canonicalOrigin : undefined;
  let canonicalOrigin = null;
  if (typeof origin === 'string') {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === 'https:' && !parsed.port
        && (origin === parsed.origin || origin === `${parsed.origin}/`)) canonicalOrigin = parsed.origin;
    } catch { /* Incomplete or unsafe configuration must not start collection. */ }
  }
  return Object.freeze({
    canonicalOrigin,
    ga4MeasurementId: canonicalOrigin && typeof id === 'string' && /^G-[A-Z0-9]{5,20}$/.test(id) ? id : null,
    analyticsDebug: record(value) && value.analyticsDebug === true,
  });
}

export function parseConsent(raw, now = Date.now()) {
  try {
    const saved = JSON.parse(raw);
    if (!record(saved) || saved.version !== 1 || !['granted', 'denied'].includes(saved.choice)
      || !Number.isFinite(saved.updatedAt) || saved.updatedAt > now || now - saved.updatedAt >= CONSENT_MAX_AGE) return 'unset';
    return saved.choice;
  } catch { return 'unset'; }
}

/** Raw attribution is inspected in memory and immediately reduced to a finite enum. */
export function safeAttribution(search = '', referrer = '') {
  const sources = new URLSearchParams(typeof search === 'string' ? search : '').getAll('utm_source');
  const utm = sources.length === 1 ? sources[0] : undefined;
  const allowed = { 'chatgpt.com': 'chatgpt', 'perplexity.ai': 'perplexity', 'claude.ai': 'claude', 'copilot.microsoft.com': 'copilot', 'gemini.google.com': 'gemini' };
  if (utm && Object.hasOwn(allowed, utm)) return Object.freeze({ source: allowed[utm], evidence: 'allowed_utm' });
  if (!referrer) return Object.freeze({ source: 'unattributed', evidence: 'unavailable' });
  try {
    const url = new URL(referrer);
    if (!['http:', 'https:'].includes(url.protocol)) return Object.freeze({ source: 'unattributed', evidence: 'unavailable' });
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const hosts = { ...allowed, 'chat.openai.com': 'chatgpt', 'google.com': 'google', 'bing.com': 'bing' };
    return Object.freeze({ source: Object.hasOwn(hosts, host) ? hosts[host] : 'other_referral', evidence: 'referrer_host' });
  } catch { return Object.freeze({ source: 'unattributed', evidence: 'unavailable' }); }
}

const DENIED = Object.freeze({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
const GRANTED = Object.freeze({ ...DENIED, analytics_storage: 'granted' });

/** Delete site-accessible Google Analytics cookies; essential preferences are retained. */
export function clearAnalyticsCookies(doc, location) {
  if (!doc || !location) return;
  const names = doc.cookie.split(';').map((part) => part.trim().split('=')[0])
    .filter((name) => /^_ga(?:_[A-Za-z0-9_]+)?$/.test(name) || name === '_gid' || /^_gat(?:_[A-Za-z0-9_]+)?$/.test(name));
  const host = location.hostname || '';
  const labels = host.split('.');
  const domains = new Set(['', host, `.${host}`]);
  for (let i = 1; i < labels.length - 1; i++) {
    domains.add(labels.slice(i).join('.'));
    domains.add(`.${labels.slice(i).join('.')}`);
  }
  const paths = new Set(['/']);
  const parts = (location.pathname || '/').split('/').filter(Boolean);
  for (let i = 1; i <= parts.length; i++) {
    const path = `/${parts.slice(0, i).join('/')}`;
    paths.add(path); paths.add(`${path}/`);
  }
  for (const name of names) for (const domain of domains) for (const path of paths) {
    doc.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
  }
}

/** Dependency injection is used only by deterministic local tests. */
export function createAnalytics(options = {}) {
  const getWindow = options.getWindow || (() => typeof window === 'undefined' ? undefined : window);
  const getDocument = options.getDocument || (() => typeof document === 'undefined' ? undefined : document);
  const loadVitals = options.loadVitals || (() => import('web-vitals'));
  const now = options.now || Date.now;
  let config = validateConfig({});
  let consent = 'unset';
  let initialized = false;
  let configured = false;
  let tag;
  let script;
  let loaded = false;
  let loadFailed = false;
  let generation = 0;
  let vitalsStarted = false;
  let currentRoute = '/';
  let documentRoute = '/';
  let lastPage = null;
  let attribution = { source: 'unattributed', evidence: 'unavailable' };
  let consentUpdatedAt = 0;
  const listeners = new Set();
  // Operational receipt keys never enter an analytics payload or browser storage.
  // The bound exceeds the default server's 15-minute duplicate window.
  const acceptedReceipts = new Map();
  const receiptLifetime = 30 * 60 * 1000;
  const receiptLimit = 100;

  function notify() { for (const listener of listeners) listener(); }
  function restore() {
    const win = getWindow();
    if (!win) return 'unset';
    try {
      const raw = win.localStorage.getItem(CONSENT_KEY);
      const choice = parseConsent(raw, now());
      consentUpdatedAt = choice === 'unset' ? 0 : JSON.parse(raw).updatedAt;
      return choice;
    } catch { return 'unset'; }
  }
  function initialize() {
    const win = getWindow();
    if (initialized || !win) return;
    initialized = true;
    currentRoute = safeRoute(win.location.pathname);
    documentRoute = currentRoute;
    consent = restore();
    win.addEventListener('storage', (event) => {
      if (event.key !== CONSENT_KEY && event.key !== null) return;
      // A grant in another tab never starts tracking here without a local action.
      const restored = restore();
      if (restored !== 'granted') applyConsent(restored, false);
    });
    getDocument()?.addEventListener('visibilitychange', checkExpiry);
  }
  function checkExpiry() {
    if (consent !== 'unset' && now() - consentUpdatedAt >= CONSENT_MAX_AGE) applyConsent('unset', false);
  }
  function active() {
    checkExpiry();
    return consent === 'granted' && Boolean(config.ga4MeasurementId) && Boolean(tag) && !loadFailed;
  }
  function context(route = currentRoute) {
    // Approved site origin + finite route only; never the visitor's raw URL or referrer.
    return { page_location: `${config.canonicalOrigin}${route}`, page_title: ROUTES[route], page_referrer: '' };
  }
  function send(name, payload) {
    if (!validateEvent(name, payload) || !active()) return false;
    tag('event', name, { ...payload, ...context(name === 'web_vital' ? payload.page_path : currentRoute), send_to: config.ga4MeasurementId, ...(config.analyticsDebug ? { debug_mode: true } : {}) });
    return true;
  }
  function sendPage() {
    if (!active() || currentRoute === lastPage) return false;
    tag('set', context());
    const sent = send('page_view', { page_path: currentRoute, referral_source: attribution.source, referral_evidence: attribution.evidence });
    if (sent) lastPage = currentRoute;
    return sent;
  }
  function startVitals() {
    if (vitalsStarted || !active()) return;
    vitalsStarted = true;
    const epoch = generation;
    // Default Web Vitals cover the document navigation, even if consent follows
    // client-side navigation. Retain only its finite route, never a raw URL.
    const page = documentRoute;
    // Register once per document, never the attribution build. Old callbacks cannot revive after withdrawal.
    Promise.resolve().then(() => {
      if (generation === epoch && active()) return loadVitals();
    }).then((vitals) => {
      if (!vitals || generation !== epoch || !active()) return;
      const { onCLS, onINP, onLCP } = vitals;
      const report = (metric) => {
        if (generation !== epoch || !active()) return;
        const value = metric.name === 'CLS' ? Math.round(metric.value * 10000) / 10000 : Math.round(metric.value);
        send('web_vital', { metric_name: metric.name, metric_value: value, metric_rating: metric.rating, page_path: page });
      };
      onCLS(report); onINP(report); onLCP(report);
    }).catch(() => { /* Optional field metrics never interrupt a visitor's journey. */ });
  }
  function begin() {
    const win = getWindow(); const doc = getDocument();
    if (!win || !doc || consent !== 'granted' || !config.ga4MeasurementId || loadFailed) return;
    if (!tag) {
      win[DATA_LAYER] = win[DATA_LAYER] || [];
      tag = function () { win[DATA_LAYER].push(arguments); };
    }
    win[`ga-disable-${config.ga4MeasurementId}`] = false;
    attribution = safeAttribution(win.location.search, doc.referrer);
    tag('consent', loaded ? 'update' : 'default', DENIED);
    tag('consent', 'update', GRANTED);
    tag('set', { ads_data_redaction: true, url_passthrough: false });
    const medium = ['google', 'bing'].includes(attribution.source) ? 'organic'
      : ['chatgpt', 'perplexity', 'claude', 'copilot', 'gemini'].includes(attribution.source) ? 'ai-assistant'
      : attribution.source === 'unattributed' ? 'unknown' : 'referral';
    const gaSource = { chatgpt: 'chatgpt.com', perplexity: 'perplexity.ai', claude: 'claude.ai', copilot: 'copilot.microsoft.com', gemini: 'gemini.google.com' }[attribution.source] || attribution.source;
    if (!loaded && !script) tag('js', new Date(now()));
    tag('config', config.ga4MeasurementId, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_domain: 'none', cookie_path: '/', cookie_expires: CONSENT_MAX_AGE / 1000,
      cookie_update: false, cookie_flags: 'SameSite=Lax;Secure',
      ignore_referrer: true, ...context(),
      campaign_source: gaSource, campaign_medium: medium,
      campaign_name: 'not_collected', campaign_id: 'not_collected', campaign_content: 'not_collected', campaign_term: 'not_collected',
      ...(config.analyticsDebug ? { debug_mode: true } : {}),
    });
    if (!loaded && !script) {
      const candidate = doc.createElement('script');
      candidate.id = 'tsc-ga4'; candidate.async = true;
      candidate.referrerPolicy = 'no-referrer';
      candidate.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}&l=${DATA_LAYER}`;
      candidate.onload = () => {
        if (script !== candidate) return;
        loaded = true;
        if (consent !== 'granted') { win[`ga-disable-${config.ga4MeasurementId}`] = true; clearAnalyticsCookies(doc, win.location); }
      };
      candidate.onerror = () => {
        if (script !== candidate) return;
        loadFailed = true; win[`ga-disable-${config.ga4MeasurementId}`] = true;
        win[DATA_LAYER].length = 0;
        notify();
      };
      script = candidate;
      doc.head.appendChild(candidate);
    }
    sendPage();
    startVitals();
  }
  function stop({ preserveVitals = false } = {}) {
    const win = getWindow(); const doc = getDocument();
    if (!preserveVitals) generation++;
    lastPage = null;
    if (!win || !doc) return;
    // This flag is checked by gtag before both cookies and hits. Set before consent update.
    if (config.ga4MeasurementId) win[`ga-disable-${config.ga4MeasurementId}`] = true;
    if (tag && loaded) tag('consent', 'update', DENIED);
    if (win[DATA_LAYER]) win[DATA_LAYER].length = 0;
    if (script && !loaded) { script.onload = null; script.onerror = null; script.remove(); script = undefined; }
    clearAnalyticsCookies(doc, win.location);
    attribution = { source: 'unattributed', evidence: 'unavailable' };
  }
  function applyConsent(choice, persist) {
    if (!['granted', 'denied', 'unset'].includes(choice)) return false;
    const previous = consent;
    consent = choice;
    if (persist) {
      consentUpdatedAt = now();
      try { getWindow()?.localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, choice, updatedAt: consentUpdatedAt })); } catch { /* In-memory choice still works. */ }
    }
    if (choice === 'granted') { if (previous !== 'granted') begin(); }
    else stop();
    notify();
    return true;
  }

  return Object.freeze({
    configure(value = {}) {
      initialize();
      const next = validateConfig(value);
      if (configured && next.ga4MeasurementId === config.ga4MeasurementId
        && next.canonicalOrigin === config.canonicalOrigin && next.analyticsDebug === config.analyticsDebug) return Boolean(next.ga4MeasurementId);
      // An uninterrupted, valid configuration refresh keeps the document's one
      // observer set. Withdrawal, expiry and configuration gaps invalidate it.
      if (configured) stop({ preserveVitals: Boolean(next.ga4MeasurementId) && active() });
      config = next; configured = true; loadFailed = false;
      if (consent === 'granted') begin();
      else if (config.ga4MeasurementId && getWindow()) getWindow()[`ga-disable-${config.ga4MeasurementId}`] = true;
      notify();
      return Boolean(config.ga4MeasurementId);
    },
    setConsent(choice) { initialize(); return ['granted', 'denied'].includes(choice) ? applyConsent(choice, true) : false; },
    getConsent() { return consent; },
    getStatus() { return !config.ga4MeasurementId ? 'unconfigured' : loadFailed ? 'blocked' : consent === 'granted' ? 'enabled' : 'disabled'; },
    subscribe(listener) { initialize(); listeners.add(listener); return () => listeners.delete(listener); },
    pageView(path) { currentRoute = safeRoute(path); return sendPage(); },
    sceneInteraction(scene, action) { return send('scene_interaction', { scene_id: scene, interaction: action }); },
    computerInteraction(stage, intent = 'not_selected') {
      return send('computer_interaction', { interaction_stage: stage, project_intent: intent });
    },
    demoStart(source) { return send('demo_start', { entry_point: source }); },
    demoSubmitError(error) { return send('demo_submit_error', { error_type: error }); },
    generateLead(acceptance, requestId) {
      if (!active() || !validateEvent('generate_lead', { acceptance })
        || typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId)) return false;
      const timestamp = now();
      for (const [key, recordedAt] of acceptedReceipts) if (timestamp - recordedAt >= receiptLifetime) acceptedReceipts.delete(key);
      if (acceptedReceipts.has(requestId)) return false;
      const sent = send('generate_lead', { acceptance });
      if (sent) {
        if (acceptedReceipts.size >= receiptLimit) acceptedReceipts.delete(acceptedReceipts.keys().next().value);
        acceptedReceipts.set(requestId, timestamp);
      }
      return sent;
    },
  });
}

export const analytics = createAnalytics();
