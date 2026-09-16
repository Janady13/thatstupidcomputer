import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Authored portable acceptance checks. NOT executed on the authoring host:
// browser policy explicitly blocked that environment. No real email or analytics.
// Run against the dedicated fixture server in playwright.config.ts after build.
const google = /^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//;
const cast = [
  ['smartphone', 'Smartphone', 'Deadpan and sarcastic'],
  ['flip-phone', 'Flip-phone', 'Theatrical and expressive'],
  ['app-bot', 'App-bot', 'Eager and bouncy'],
  ['pager', 'Pager', 'Anxious and alert'],
  ['handheld', 'Handheld', 'Competitive and crisp'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'test_intercept', message: 'Synthetic request intercepted. No email was sent.' }) }));
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: null } }) }));
  await page.route(google, route => route.abort('blockedbyclient'));
});

async function openPlayground(page: Page, motion = false) {
  await page.emulateMedia({ reducedMotion: motion ? 'no-preference' : 'reduce' });
  await page.goto('/work/');
  const playground = page.getByTestId('character-playground');
  await expect(playground.getByLabel('All expressions and moves')).toBeVisible();
  await expect(playground.getByRole('button', { name: 'See this expression' })).toBeEnabled();
  await page.getByTestId('character-stage').scrollIntoViewIfNeeded();
  if (motion) await expect(page.getByTestId('stage-actor-handle')).toHaveAttribute('aria-disabled', 'false');
  return playground;
}

async function actorX(page: Page) {
  return Number(await page.getByTestId('stage-actor').getAttribute('data-x'));
}

async function expectActorInside(page: Page) {
  const stage = await page.getByTestId('character-stage').boundingBox();
  const actor = await page.getByTestId('stage-actor').boundingBox();
  expect(stage).not.toBeNull(); expect(actor).not.toBeNull();
  if (!stage || !actor) return;
  expect(actor.x).toBeGreaterThanOrEqual(stage.x - 1);
  expect(actor.y).toBeGreaterThanOrEqual(stage.y - 1);
  expect(actor.x + actor.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
  expect(actor.y + actor.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
}

async function expectNoOverflow(page: Page, playground: Locator) {
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
  const local = await playground.evaluate(element => ({ width: element.clientWidth, content: element.scrollWidth }));
  expect(local.content).toBeLessThanOrEqual(local.width + 1);
}

test('the work page offers all five personalities and 32 expressions without hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const playground = await openPlayground(page);
  await expect(page.getByRole('heading', { level: 1, name: 'You are already looking at a piece of the work.' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Meet the characters.', exact: true })).toHaveCount(1);
  const expressions = playground.getByLabel('All expressions and moves');
  await expect(expressions.locator('option')).toHaveCount(32);
  expect(await expressions.locator('optgroup').evaluateAll(groups => groups.map(group => group.getAttribute('label')))).toEqual(['Moods', 'Reactions', 'Gestures', 'Movement']);
  for (const [slug, name, personality] of cast) {
    await playground.locator(`[data-character-choice="${slug}"]`).click();
    await expect(playground).toHaveAttribute('data-character', slug);
    await expect(playground.locator('.playground-personality')).toContainText(personality);
    await expect(playground.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(playground.getByRole('button', { name: 'See this expression' })).toBeEnabled();
    for (const mood of ['Laugh', 'Suspicious', 'Facepalm', 'Shy', 'Proud']) {
      await playground.getByRole('button', { name: mood, exact: true }).click();
      await expect(playground).toHaveAttribute('data-selected-action', mood);
      await expect(page.getByTestId('stage-actor')).toHaveAttribute('data-action', mood);
    }
  }
  await expect(playground).toHaveAttribute('data-show', 'idle');
  expect(errors).toEqual([]);
});

test('reduced motion keeps expressive still poses, disables movement, and gates the censored gesture', async ({ page }) => {
  const playground = await openPlayground(page);
  const select = playground.getByLabel('All expressions and moves');
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(playground.getByRole('button', { name: 'Walk right', exact: true })).toBeDisabled();
  await expect(playground.getByRole('button', { name: 'A little performance', exact: true })).toBeDisabled();
  // Playwright 1.63 does not report <option disabled> through toBeDisabled; read the property.
  await expect(select.locator('option[value="RudeFlipOff"]')).toHaveJSProperty('disabled', true);
  await playground.getByLabel('Allow the rude gesture. It stays censored.').check();
  const actions = await select.locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value));
  for (const action of actions) {
    await select.selectOption(action);
    await expect(playground).toHaveAttribute('data-selected-action', action);
    await expect(page.getByTestId('stage-actor')).toHaveAttribute('data-action', action);
  }
  await select.selectOption('RudeFlipOff');
  await playground.getByRole('button', { name: 'See this expression' }).click();
  for (const side of ['left', 'right']) await expect(playground.locator(`[data-rig-id="hand-${side}-censor"]`)).toHaveAttribute('opacity', '1');
  await playground.getByLabel('Allow the rude gesture. It stays censored.').uncheck();
  await expect(playground).toHaveAttribute('data-selected-action', 'EyeRoll');
  // Playwright 1.63 does not report <option disabled> through toBeDisabled; read the property.
  await expect(select.locator('option[value="RudeFlipOff"]')).toHaveJSProperty('disabled', true);
  await playground.getByRole('button', { name: 'Pager', exact: true }).click();
  await expect(playground.getByLabel('Allow the rude gesture. It stays censored.')).not.toBeChecked();
});

test('cold character assets block playback until the actual renderer is ready', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let waitingRequests = 0;
  await page.route(/\/animation\/(?:mobile\/smartphone\/(?:scene|motion)\.json|[^?]*\.riv)(?:\?|$)/, async route => { waitingRequests++; await gate; await route.continue(); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  try {
    await page.goto('/work/', { waitUntil: 'domcontentloaded' });
    const playground = page.getByTestId('character-playground');
    await expect(playground).toBeVisible();
    await expect.poll(() => waitingRequests).toBeGreaterThan(0);
    await expect(playground.getByRole('button', { name: 'See this expression' })).toBeDisabled();
    await expect(playground.getByRole('button', { name: 'A little performance', exact: true })).toBeDisabled();
    await expect(playground).toHaveAttribute('data-show', 'idle');
    release();
    await expect(playground.getByRole('button', { name: 'See this expression' })).toBeEnabled();
    await expect(playground.getByRole('button', { name: 'A little performance', exact: true })).toBeEnabled();
  } finally { release(); }
});

test('walk, run, wander, exit and reset remain finite and bounded', async ({ page }) => {
  const playground = await openPlayground(page, true);
  await playground.getByRole('button', { name: 'Walk left', exact: true }).click();
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-phase', 'idle');
  const left = await actorX(page);
  await playground.getByRole('button', { name: 'Run across', exact: true }).click();
  await expect.poll(() => actorX(page)).toBeGreaterThan(left + 5);
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-phase', 'idle');
  await expectActorInside(page);
  await playground.getByRole('button', { name: 'Wander', exact: true }).click();
  await expect(playground.locator('.playground-status')).toHaveText('A little wander, then back to their mark.', { timeout: 25_000 });
  await expectActorInside(page);
  await playground.getByRole('button', { name: 'Make an exit', exact: true }).click();
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-phase', 'hidden');
  await expect(page.getByTestId('stage-actor-handle')).toHaveAttribute('tabindex', '-1');
  await playground.getByRole('button', { name: 'Reset stage', exact: true }).click();
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-phase', 'idle');
  await expect(page.getByTestId('stage-actor-handle')).toHaveAttribute('tabindex', '0');
  await expectActorInside(page);
});

test('tap direction and keyboard pick-up hand control back cleanly', async ({ page }) => {
  const playground = await openPlayground(page, true);
  const stage = page.getByTestId('character-stage');
  const handle = page.getByTestId('stage-actor-handle');
  const before = await actorX(page);
  // Empty upper-left stage is outside the actor handle on every configured size.
  await stage.click({ position: { x: 8, y: 8 } });
  await expect.poll(() => actorX(page)).toBeLessThan(before);
  await expect(stage).toHaveAttribute('data-phase', 'idle');
  await handle.focus(); await handle.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await handle.press('ArrowRight'); await handle.press('ArrowUp');
  await handle.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'false');
  await expect(stage).toHaveAttribute('data-phase', 'idle');
  await expectActorInside(page);
  await expect(playground).toHaveAttribute('data-show', 'idle');
  await handle.press('Home');
  await expect(stage).toHaveAttribute('data-phase', 'idle');
});

test('pointer drag interrupts a performance and settles inside the stage', async ({ page }) => {
  const playground = await openPlayground(page, true);
  await playground.getByRole('button', { name: 'A little performance', exact: true }).click();
  await expect(playground).toHaveAttribute('data-selected-action', 'Suspicious');
  const handle = page.getByTestId('stage-actor-handle');
  const box = await handle.boundingBox();
  expect(box).not.toBeNull(); if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(playground).toHaveAttribute('data-show', 'idle');
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 - 45, { steps: 8 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('character-stage')).toHaveAttribute('data-phase', 'idle');
  await expectActorInside(page);
});

test('a finite performance pauses offscreen and globally, then ends once', async ({ page }) => {
  test.setTimeout(75_000);
  const playground = await openPlayground(page, true);
  await playground.getByRole('button', { name: 'A little performance', exact: true }).click();
  await expect(playground).toHaveAttribute('data-selected-action', 'Suspicious');
  await playground.getByRole('button', { name: 'Pause animations', exact: true }).click();
  const pausedAction = await playground.getAttribute('data-selected-action');
  const pausedX = await actorX(page);
  // Deliberately exceed the suspicious clip's duration to catch a leaking dwell timer.
  await page.waitForTimeout(4_500);
  await expect(playground).toHaveAttribute('data-selected-action', pausedAction!);
  expect(await actorX(page)).toBe(pausedX);
  await playground.getByRole('button', { name: 'Resume animations', exact: true }).click();
  await page.locator('h1').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('stage-actor-handle')).toHaveAttribute('aria-disabled', 'true');
  const offscreenAction = await playground.getAttribute('data-selected-action');
  await page.waitForTimeout(4_500);
  await expect(playground).toHaveAttribute('data-selected-action', offscreenAction!);
  await page.getByTestId('character-stage').scrollIntoViewIfNeeded();
  await expect(playground).toHaveAttribute('data-show', 'idle', { timeout: 40_000 });
  await expect(playground.locator('.playground-status')).toHaveText('That’s the show. Your turn.');
  await expect(playground).toHaveAttribute('data-selected-action', 'Idle');
  await page.waitForTimeout(500);
  await expect(playground).toHaveAttribute('data-show', 'idle');
  await expectActorInside(page);
});

test('character asset failure preserves the page and recovers when another character is chosen', async ({ page }) => {
  // Intentional network errors are confined to this test, not filtered globally.
  await page.route('**/animation/mobile/smartphone/scene.json', route => route.fulfill({ status: 503, body: 'Intentional asset failure' }));
  await page.goto('/work/');
  const playground = page.getByTestId('character-playground');
  await expect(playground.getByRole('link', { name: 'Reload the example', exact: true })).toBeVisible();
  await expect(playground.getByLabel('All expressions and moves')).toBeEnabled();
  await playground.getByRole('button', { name: 'Laugh', exact: true }).click();
  await expect(playground).toHaveAttribute('data-selected-action', 'Laugh');
  await playground.getByRole('button', { name: 'App-bot', exact: true }).click();
  await expect(playground.getByRole('button', { name: 'See this expression' })).toBeEnabled();
  await expect(playground.getByRole('link', { name: 'Reload the example', exact: true })).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText('You are already looking at a piece of the work.');
  await page.getByRole('link', { name: 'Get my demo', exact: true }).first().click();
  await expect(page.locator('#demo-name')).toBeVisible();
});

test('the playground has readable controls, no detectable axe failures, and reflows at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const playground = await openPlayground(page);
  const axe = await new AxeBuilder({ page }).include('[data-testid="character-playground"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  const controls = await playground.locator('button:not(.tsc-character-stage__handle), select, .playground-attitude').evaluateAll(elements => elements.map(element => ({ label: element.textContent?.trim(), height: element.getBoundingClientRect().height, font: parseFloat(getComputedStyle(element).fontSize) })));
  for (const control of controls) { expect(control.height, control.label).toBeGreaterThanOrEqual(44); expect(control.font, control.label).toBeGreaterThanOrEqual(14); }
  await expectNoOverflow(page, playground);
  // Simulated enlarged text supplements viewport reflow; this is not a claim of
  // actual browser zoom, screen-reader, or physical-device coverage.
  await playground.evaluate(root => {
    const elements = Array.from(root.querySelectorAll<HTMLElement>('h2, h3, p, span, strong, button, select, label, legend'));
    const sizes = elements.map(element => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; });
  });
  await expectNoOverflow(page, playground);
  await expect(playground.getByLabel('All expressions and moves')).toBeEnabled();
});
