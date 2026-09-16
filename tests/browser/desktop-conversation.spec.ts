import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The computer speaks through one caption under the desk: no disclosure card, no
// floating labels. Run with the portable fixture server; no email or GA is allowed.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'test_intercept', message: 'Synthetic request blocked. No email was sent.' }) }));
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: null } }) }));
  await page.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//, route => route.abort('blockedbyclient'));
});

test('each useful intent reaches the real form with its finite project choice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const [project, label] of [['design', 'I need a new website'], ['rescue', 'My website needs rescuing'], ['search', 'Help customers find me']]) {
    await page.goto('/');
    const voice = page.getByTestId('computer-conversation');
    await expect(voice).toHaveAttribute('data-conversation', 'closed');
    await voice.getByRole('link', { name: label, exact: true }).click();
    await expect(voice).toHaveAttribute('data-conversation', 'recommendation');
    await expect(voice.locator('.computer-announcement')).not.toHaveText('');
    const cta = voice.getByRole('link', { name: 'Show me what you would build', exact: true });
    await expect(cta).toBeFocused();
    await expect(cta).toHaveAttribute('href', `/contact/?project=${project}&from=computer#demo-request`);
    await cta.click();
    await expect(page).toHaveURL(new RegExp(`/contact/\\?project=${project}&from=computer#demo-request$`));
    await expect(page.locator('#demo-projectType')).toHaveValue(project);
    await expect(page.locator('#demo-name')).toHaveValue('');
    await expect(page.locator('.form-accepted')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('attitude remains explicitly gated, censored, reversible and linked to a real brief', async ({ page }) => {
  await page.goto('/');
  const voice = page.getByTestId('computer-conversation');
  await voice.getByRole('button', { name: 'Roast my website', exact: true }).click();
  await expect(voice).toHaveAttribute('data-conversation', 'roast');
  await expect(voice).toHaveAttribute('data-attitude', 'off');
  await expect(voice.getByRole('button', { name: 'Double the attitude', exact: true })).toHaveCount(0);
  await voice.getByRole('button', { name: 'Show the censored gesture', exact: true }).click();
  await expect(voice).toHaveAttribute('data-attitude', 'allowed');
  await expect(voice).toHaveAttribute('data-computer-mood', 'rude-flip-off');
  await voice.getByRole('button', { name: 'Double the attitude', exact: true }).click();
  await expect(voice).toHaveAttribute('data-computer-mood', 'double-flip-off');
  await voice.getByRole('button', { name: 'Put the hands down', exact: true }).click();
  await expect(voice).toHaveAttribute('data-attitude', 'off');
  await expect(voice).toHaveAttribute('data-computer-mood', 'eye-roll');
  await expect(voice.getByRole('link', { name: 'Get my demo', exact: true })).toHaveAttribute('href', '/contact/?project=rescue&from=computer#demo-request');
  await voice.getByRole('button', { name: 'Show the censored gesture', exact: true }).click();
  await voice.getByRole('button', { name: 'Start again', exact: false }).click();
  await expect(voice).toHaveAttribute('data-attitude', 'off');
  await expect(voice).toHaveAttribute('data-conversation', 'choose');
  await expect(voice.getByRole('link', { name: 'I need a new website', exact: true })).toBeFocused();
});

test('the room itself is the navigation: objects are real links that the computer points at', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Narrow screens use the link grid under the character instead of hit shapes.');
  await page.goto('/');
  const hotspots = page.getByRole('navigation', { name: 'Explore the workshop' });
  for (const [label, href] of [['What we do', '/services/'], ['The process', '/process/'], ['The work', '/work/'], ['Meet the human', '/about/']]) {
    await expect(hotspots.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  // No label boxes float over the drawing; the caption names what is under the pointer.
  await expect(page.locator('.room-link-label')).toHaveCount(0);
  await page.locator('.room-hotspot-clock').hover();
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-focus', 'clock');
  await expect(page.locator('.computer-pointing')).toHaveText(/The process/);
  // The computer turns toward the clock (the controller stamps its live state on the rig).
  await expect(page.locator('.office-room [data-state]').first()).toHaveAttribute('data-state', 'point-right');
  await page.mouse.move(5, 5);
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-focus', '');
  await page.locator('.room-hotspot-clock').click();
  await expect(page).toHaveURL(/\/process\/$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  // Keyboard: the hotspots are in the tab order and Enter follows them.
  await page.locator('.room-hotspot-board').focus();
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-focus', 'bulletin-board');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/services\/$/);
});

test('choices change only the pose and never override global pause or reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const voice = page.getByTestId('computer-conversation');
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await voice.getByRole('link', { name: 'My website needs rescuing', exact: true }).click();
  await expect(voice).toHaveAttribute('data-computer-mood', 'facepalm');
  await expect(page.getByRole('button', { name: 'Play motion', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await voice.getByRole('button', { name: 'Start again', exact: false }).click();
  await voice.getByRole('link', { name: 'Help customers find me', exact: true }).click();
  await expect(voice).toHaveAttribute('data-computer-mood', 'thinking');
  await expect(page.getByRole('button', { name: 'Reduced motion', exact: true })).toBeDisabled();
  await expect(voice.locator('.computer-demo')).toHaveAttribute('href', '/contact/?project=search&from=computer#demo-request');
});

test('the caption is readable, has no detectable axe failures and reflows', async ({ page }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const voice = page.getByTestId('computer-conversation');
    const results = await new AxeBuilder({ page }).include('[data-testid="computer-conversation"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    await expect(voice.getByRole('link', { name: 'I need a new website', exact: true })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    const targets = await voice.locator('.computer-choices > a, .computer-choices > button').evaluateAll(elements => elements.filter(element => element.getBoundingClientRect().height > 0).map(element => ({ text: element.textContent, height: element.getBoundingClientRect().height, font: parseFloat(getComputedStyle(element).fontSize) })));
    for (const target of targets) { expect(target.height, target.text || '').toBeGreaterThanOrEqual(44); expect(target.font, target.text || '').toBeGreaterThanOrEqual(14); }
  }
});

test('intent links and object links keep the inquiry reachable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.route('**/api/demo', route => route.fulfill({ status: 503, body: 'Synthetic request blocked.' }));
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Explore the workshop' }).getByRole('link', { name: 'The work', exact: true })).toHaveAttribute('href', '/work/');
    const rescue = page.getByRole('link', { name: 'My website needs rescuing', exact: true });
    await expect(rescue).toHaveAttribute('href', '/contact/?project=rescue&from=computer#demo-request');
    await rescue.click();
    await expect(page.locator('#demo-name')).toBeVisible();
    await expect(page.locator('form[action="/api/demo"]')).toHaveAttribute('method', 'post');
  } finally { await context.close(); }
});
