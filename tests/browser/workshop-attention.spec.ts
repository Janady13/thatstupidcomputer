import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 503, body: 'Synthetic test. No email sent.' }));
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: null } }) }));
  await page.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//, route => route.abort());
});

test('the physical keys preview the original rigs on keyboard focus and keep their real destinations', async ({ page }) => {
  await page.goto('/');
  const deck = page.locator('.computer-console');
  await expect(deck).toBeVisible();
  for (const [intent, label, desktop, mobile] of [
    ['design', 'I need a new website', 'happy', 'Happy'],
    ['rescue', 'My website needs rescuing', 'facepalm', 'Facepalm'],
    ['search', 'Help customers find me', 'searching', 'Searching'],
  ]) {
    const key = deck.getByRole('link', { name: label, exact: true });
    await expect(key).toHaveAttribute('href', `/contact/?project=${intent}&from=computer#demo-request`);
    await key.focus();
    const actor = page.viewportSize()!.width < 768 ? page.locator('.pocket-workshop [data-action]').first() : page.locator('.office-room [data-state]').first();
    await expect(actor).toHaveAttribute(page.viewportSize()!.width < 768 ? 'data-action' : 'data-state', page.viewportSize()!.width < 768 ? mobile! : desktop!);
    expect((await key.boundingBox())!.height).toBeGreaterThanOrEqual(64);
  }
});

test('scroll conducts visible character beats without taking over the page or an explicit story', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop pin geometry; mobile normal-flow behavior has a separate check.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const workshop = page.getByTestId('workshop');
  const actor = page.locator('.office-room [data-state]').first();
  await expect(workshop).toHaveAttribute('data-attention', 'hello');
  await expect(actor).toHaveAttribute('data-state', 'wave');
  const travel = await workshop.evaluate(el => el.getBoundingClientRect().height - innerHeight);
  expect(travel).toBeGreaterThan(250);
  for (const [fraction, beat, state] of [[.38, 'trouble', 'startled'], [.7, 'thinking', 'searching'], [.94, 'your-turn', 'demo-invite']] as const) {
    await page.evaluate(y => window.scrollTo(0, y), travel * fraction);
    await expect(workshop).toHaveAttribute('data-attention', beat);
    await expect(actor).toHaveAttribute('data-state', state);
    const bounds = await actor.boundingBox();
    expect(bounds!.y).toBeGreaterThan(0);
    expect(bounds!.y + bounds!.height).toBeLessThan(900);
  }
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  await page.getByRole('button', { name: 'Hold that thought', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(actor).toHaveAttribute('data-state', 'wave');
  await expect(workshop).toHaveAttribute('data-story', 'tour');
});

test('reduced motion and short or narrow screens keep a normal-flow scene and useful keys', async ({ page }) => {
  for (const [width, height] of [[320, 844], [1440, 680], [1440, 900]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    const deck = page.locator('.computer-console');
    await expect(deck).toBeVisible();
    expect(await page.locator('.workshop-stage').evaluate(el => getComputedStyle(el).position)).not.toBe('sticky');
    await deck.getByRole('link', { name: 'My website needs rescuing', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Show me what you would build', exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width! + 1);
  }
});

test('the pocket character sits above its navigation and keyboard, without a collapsed-margin gap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.pocket-workshop')).toBeVisible();
  const root = (await page.getByTestId('workshop').boundingBox())!;
  const art = (await page.locator('.pocket-workshop').boundingBox())!;
  const nav = (await page.locator('.room-navigation').boundingBox())!;
  const voice = (await page.getByTestId('computer-conversation').boundingBox())!;
  expect(art.y - root.y).toBeLessThan(10);
  expect(art.y + art.height).toBeLessThanOrEqual(nav.y + 4);
  expect(nav.y + nav.height).toBeLessThan(voice.y);
});

test('a short desktop still receives the arrival performance before scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 680 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.office-room [data-state]').first()).toHaveAttribute('data-state', 'wave');
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-attention', 'hello');
});

test('a focused key retains ownership of the character when the page scrolls', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop scroll-stage ownership; mobile focus preview is covered separately.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const key = page.locator('.computer-key-design');
  await key.focus();
  const actor = page.locator('.office-room [data-state]').first();
  await expect(actor).toHaveAttribute('data-state', 'happy');
  await page.evaluate(() => window.scrollTo(0, 240));
  await page.waitForTimeout(200);
  await expect(actor).toHaveAttribute('data-state', 'happy');
  await expect(key).toBeFocused();
});

test('leaving a preview returns the computer to rest, including after a finite gesture has finished', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Original desktop controller completion; pocket focus is covered separately.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const actor = page.locator('.office-room [data-state]').first();
  await page.locator('.computer-key-search').focus();
  await expect(actor).toHaveAttribute('data-state', 'searching');
  await page.getByRole('button', { name: 'Show me around', exact: true }).focus();
  await expect(actor).toHaveAttribute('data-state', 'idle');
  await page.locator('.computer-key-design').focus();
  await expect(actor).toHaveAttribute('data-state', 'happy');
  await page.waitForTimeout(4800);
  await page.getByRole('button', { name: 'Show me around', exact: true }).focus();
  await expect(actor).toHaveAttribute('data-state', 'idle');
});

test('the desktop controls remain below the actual character at wide and short viewport shapes', async ({ page }) => {
  for (const [width, height] of [[1440, 680], [1920, 900], [2560, 1080], [768, 1024]]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    const actor = page.locator('.office-room [data-slot="computer"]');
    await expect(actor).toBeVisible();
    await expect(actor.locator('[data-state]')).toHaveAttribute('data-state', 'wave');
    // Firefox includes the nested SVG viewport in the outer slot's bounds. Measure
    // the actual painted monitor, case and plug, not that invisible square.
    const parts = actor.locator('[data-rig-id="monitor"], [data-rig-id="case"], [data-rig-id="connector"]');
    await expect(parts).toHaveCount(3);
    const bottom = await parts.evaluateAll(elements => Math.max(...elements.map(el => el.getBoundingClientRect().bottom)));
    const voice = (await page.getByTestId('computer-conversation').boundingBox())!;
    expect(bottom, `${width}x${height}`).toBeLessThan(voice.y);
  }
});
