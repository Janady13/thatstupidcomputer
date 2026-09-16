import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// These are authored acceptance checks, not a claim of an executed browser pass.
// Every inquiry request and Google endpoint is intercepted: this suite sends no email
// and transmits no analytics. All project details below are synthetic fixture data.
const brief = {
  name: 'Acceptance Example', email: 'acceptance@example.invalid', business: 'Synthetic workshop',
  message: 'Synthetic acceptance fixture for a clearer service website. Do not send email.',
};
const google = /^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'test_intercept', message: 'Synthetic request intercepted. No email was sent.' }) }));
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: null } }) }));
  await page.route(google, route => route.abort('blockedbyclient'));
});

async function fillBrief(page: Page) {
  await page.locator('#demo-name').fill(brief.name);
  await page.locator('#demo-email').fill(brief.email);
  await page.locator('#demo-business').fill(brief.business);
  await page.locator('#demo-projectType').selectOption('design');
  await page.locator('#demo-message').fill(brief.message);
  await page.locator('#demo-consent').check();
}

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(sizes.content, `Document overflow at a ${sizes.viewport}px CSS viewport`).toBeLessThanOrEqual(sizes.viewport + 1);
}

async function expectAxe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
}

test('the illustrated home and complete contact process have no detectable axe failures', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Less stupid. More business.' })).toBeVisible();
  await expectAxe(page);
  await page.locator('.hero-demo:visible, .guide-demo:visible').first().click();
  await expect(page.locator('#demo-name')).toBeVisible();
  await expectAxe(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.locator('#demo-name')).toBeFocused();
  await expect(page.locator('#demo-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#demo-name-error')).toBeVisible();
  await expectAxe(page);
});

test('room navigation, Back, Forward, Escape and focus return form a complete path', async ({ page }) => {
  await page.goto('/');
  const roomLink = page.locator('.room-hotspot-board, .room-link-board').first();
  // The board shape wraps around the monitor, so click its top-left corner rather than the bounding-box centre.
  await roomLink.click({ position: { x: 12, y: 12 } });
  await expect(page).toHaveURL(/\/services\/$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.getByRole('link', { name: 'Explore website design', exact: true }).click();
  await expect(page).toHaveURL(/\/services\/website-design\/$/);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb', exact: true })).toContainText('Home');
  await page.goBack();
  await expect(page).toHaveURL(/\/services\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/services\/website-design\/$/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.room-hotspot-board, .room-link-board').first()).toBeFocused();
});

test('all service pages and the direct inquiry route render substantive content', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const onPageError = (error: Error) => { runtimeErrors.push(`pageerror: ${error.message}`); };
  const onConsole = (message: ConsoleMessage) => { if (message.type() === 'error') runtimeErrors.push(`console.error: ${message.text()}`); };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  const routes = [
    ['/services/website-design/', 'A clear idea. A distinctive website.'],
    ['/services/website-rescue/', 'Your website is acting up. Start here.'],
    ['/services/search-visibility/', 'Help the right people understand what you do.'],
    ['/services/website-care/', 'A website needs attention after launch.'],
    ['/work/', 'You are already looking at a piece of the work.'],
    ['/process/', 'Good websites start with good questions.'],
    ['/about/', 'Technology should make your day easier.'],
    ['/privacy/', 'Share the project. Keep the secrets.'],
  ];
  for (const [path, heading] of routes) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
    await expect(page.locator('.content-section').first()).toBeVisible();
    // Wait for route hydration, lazy scene chunks and asset requests, not just SSR text.
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors, `Unexpected browser errors on ${path}`).toEqual([]);
  }
  // An intentional HTTP 404 can produce a browser resource console error. Keep
  // JavaScript exception collection active while excluding that expected network log.
  page.off('console', onConsole);
  const missing = await page.goto('/this-page-does-not-exist/');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'The computer misplaced that page.' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(runtimeErrors).toEqual([]);
});

test('provider-specific answers and sources remain readable on the board and on mobile', async ({ page }, testInfo) => {
  await page.goto('/services/search-visibility/');
  for (const name of ['Google Search and Gemini: check the right control', 'ChatGPT: discovery is different from training', 'Claude: search and direct retrieval both matter', 'Perplexity: verify the source, not just the name', 'Does Bing register every backlink?', 'Mistral: three separate crawler roles', 'Grok and DeepSeek: separate documented support from assumptions', 'Does every AI model need the same integration?']) {
    const heading = page.getByRole('heading', { name, exact: true });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
  const links = page.locator('a[rel="external"]');
  expect(await links.count()).toBeGreaterThanOrEqual(11);
  for (const link of await links.all()) {
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
    const bounds = await link.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  }
  await expectAxe(page);
  await page.getByRole('heading', { name: 'ChatGPT: discovery is different from training', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('provider-answers.png') });
});

test('the form sends one validated JSON request and accepts only a confirmed response', async ({ page }) => {
  let requests = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/demo', async route => {
    requests += 1; submitted = route.request().postDataJSON() as Record<string, unknown>;
    await gate;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'synthetic-browser-accepted-01' }) });
  });
  await page.goto('/contact/');
  await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  try {
    await expect(page.getByRole('button', { name: 'Sending your request…', exact: true })).toBeDisabled();
    await expect.poll(() => requests).toBe(1);
    expect(submitted).toMatchObject({ ...brief, consent: true, companyWebsite: '', projectType: 'design' });
    expect(typeof submitted?.submissionId).toBe('string');
  } finally { release(); }
  await expect(page.getByRole('heading', { name: /Message accepted/ })).toBeVisible();
  await expect(page.locator('.form-accepted')).toBeFocused();
  expect(requests).toBe(1);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(stored).not.toContain(brief.email);
  expect(stored).not.toContain(brief.message);
});

test('field errors keep the draft and return keyboard focus to the rejected field', async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'validation', message: 'Check your email address.', fieldErrors: { email: 'Use an email address where we can reply.' } }) }));
  await page.goto('/contact/'); await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.locator('#demo-email')).toBeFocused();
  await expect(page.locator('#demo-email-error')).toHaveText('Use an email address where we can reply.');
  await expect(page.locator('#demo-message')).toHaveValue(brief.message);
  await expect(page.locator('.form-accepted')).toHaveCount(0);
});

for (const scenario of [
  { name: 'unavailable', status: 503, code: 'mail_unavailable', message: 'The message service is temporarily unavailable.' },
  { name: 'rate limited', status: 429, code: 'rate_limited', message: 'Please wait a few minutes before trying again.' },
  { name: 'delivery uncertain', status: 502, code: 'delivery_unknown', message: 'Acceptance is uncertain. Please avoid submitting again immediately.' },
]) test(`a ${scenario.name} response is never presented as acceptance`, async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: scenario.status, contentType: 'application/json', body: JSON.stringify({ ok: false, code: scenario.code, message: scenario.message }) }));
  await page.goto('/contact/'); await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(scenario.message);
  await expect(page.locator('#demo-message')).toHaveValue(brief.message);
  await expect(page.locator('.form-accepted')).toHaveCount(0);
});

test('a broken connection preserves details without asserting non-delivery', async ({ page }) => {
  await page.route('**/api/demo', route => route.abort('connectionfailed'));
  await page.goto('/contact/'); await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('It may still have been sent');
  await expect(page.locator('#demo-message')).toHaveValue(brief.message);
  await expect(page.locator('.form-accepted')).toHaveCount(0);
});

test('HTTP 200 without an accepted receipt never creates a success screen', async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, status: 'queued' }) }));
  await page.goto('/contact/'); await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('could not be confirmed');
  await expect(page.locator('.form-accepted')).toHaveCount(0);
});

test('consent gates Google loading and never puts inquiry details in analytics', async ({ page }) => {
  let googleRequests = 0;
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: 'G-TEST12345' } }) }));
  await page.route(google, route => { googleRequests += 1; return route.fulfill({ contentType: 'text/javascript', body: '/* Offline analytics fixture; makes no external requests. */' }); });
  await page.route('**/api/demo', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'synthetic-receipt-deduplication-01' }) }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Allow analytics', exact: true })).toBeVisible();
  expect(googleRequests).toBe(0);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Decline analytics', exact: true }).click();
  await page.locator('.hero-demo:visible, .guide-demo:visible').first().click();
  expect(googleRequests).toBe(0);
  await page.getByRole('button', { name: 'Privacy preferences', exact: true }).click();
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => googleRequests).toBe(1);
  await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.locator('.form-accepted')).toBeVisible();
  // The synthetic API repeats one receipt across a remount: the same accepted request
  // must not become a second conversion, and the receipt must never leave the app.
  await page.locator('.form-accepted .button').click();
  await page.locator('.hero-demo:visible, .guide-demo:visible').first().click();
  await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.locator('.form-accepted')).toBeVisible();
  const layer = await page.evaluate(() => (window as unknown as { tscAnalyticsDataLayer?: unknown[][] }).tscAnalyticsDataLayer?.map(entry => Array.from(entry)) ?? []);
  const serialized = JSON.stringify(layer);
  for (const privateValue of [brief.name, brief.email, brief.business, brief.message, 'synthetic-receipt-deduplication-01']) expect(serialized).not.toContain(privateValue);
  const pageViews = layer.filter(entry => entry[0] === 'event' && entry[1] === 'page_view');
  expect(pageViews.map(entry => (entry[2] as { page_location: string }).page_location)).toEqual(expect.arrayContaining([
    'https://thatstupidcomputer.com/', 'https://thatstupidcomputer.com/contact/',
  ]));
  for (const event of layer.filter(entry => entry[0] === 'event')) {
    const location = new URL((event[2] as { page_location: string }).page_location);
    expect(location.origin).toBe('https://thatstupidcomputer.com');
    expect(location.search).toBe('');
    expect(location.hash).toBe('');
  }
  expect(layer.filter(entry => entry[0] === 'event' && entry[1] === 'generate_lead')).toHaveLength(1);
  await page.getByRole('button', { name: 'Privacy preferences', exact: true }).click();
  await page.getByRole('button', { name: 'Withdraw analytics consent', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-TEST12345'])).toBe(true);
});

test('motion can be paused and operating-system reduced motion is respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const pause = page.getByRole('button', { name: 'Pause motion', exact: true });
  await expect(pause).toBeEnabled(); await pause.click();
  await expect(page.getByRole('button', { name: 'Play motion', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Play motion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause motion', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Reduced motion', exact: true })).toBeDisabled();
  await expect(page.locator('.site-shell')).toHaveClass(/motion-paused/);
  await expect(page.locator('.hero-demo:visible, .guide-demo:visible').first()).toBeVisible();
});

test('320px reflow and deliberately enlarged text preserve the inquiry path', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/'); await expectNoHorizontalOverflow(page);
    await page.locator('.hero-demo:visible, .guide-demo:visible').first().click();
    await expect(page.locator('#demo-name')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/contact/');
  // A bounded text enlargement probe, distinct from actual browser UI zoom testing.
  await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,p,label,button,input,textarea,select,a,summary'));
    const values = targets.map(element => [element, parseFloat(getComputedStyle(element).fontSize)] as const);
    for (const [element, size] of values) element.style.fontSize = `${size * 2}px`;
  });
  await expectNoHorizontalOverflow(page);
  await fillBrief(page);
  await expect(page.getByRole('button', { name: 'Get my demo', exact: true })).toBeEnabled();
});

test('optional animation failures do not interrupt navigation or the inquiry form', async ({ page }) => {
  await page.route(/\/assets\/RoomScene-[^/]+\.js(?:\?.*)?$/, route => route.abort('failed'));
  await page.route('**/animation/mobile/**/scene.json', route => route.abort('failed'));
  await page.route('**/animation/mobile/**/motion.json', route => route.abort('failed'));
  await page.goto('/');
  await page.locator('.hero-demo:visible, .guide-demo:visible').first().click();
  await expect(page.locator('#demo-name')).toBeVisible();
  await fillBrief(page);
  await page.getByRole('button', { name: 'Get my demo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Synthetic request intercepted');
});

test('native HTML navigation and submission work with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  let nativeSubmission = false;
  await context.route('**/api/demo', async route => {
    const body = new URLSearchParams(route.request().postData() ?? '');
    nativeSubmission = body.get('consent') === 'true' && body.get('name') === brief.name && body.get('submissionId') === '';
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><head><title>Native form fixture</title></head><body><main><h1>Native submission intercepted</h1><p>No email was sent.</p></main></body></html>' });
  });
  const plain = await context.newPage();
  try {
    await plain.goto('/');
    await plain.locator('.home-overview').getByRole('link', { name: 'I need a new website', exact: true }).click();
    await expect(plain).toHaveURL(/\/services\/website-design\/$/);
    await plain.locator('.page-callout .button').click();
    await fillBrief(plain);
    await plain.getByRole('button', { name: 'Get my demo', exact: true }).click();
    await expect(plain.getByRole('heading', { name: 'Native submission intercepted', exact: true })).toBeVisible();
    expect(nativeSubmission).toBe(true);
  } finally { await context.close(); }
});
