import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.abort());
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: null } }) }));
  await page.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//, route => route.abort());
});

test('services are real notices on the bulletin board, not an inset popup', async ({ page }) => {
  await page.goto('/services/');
  const board = page.getByTestId('service-board');
  await expect(board).toBeVisible();
  await expect(page.locator('.page-panel, .panel-scene-note, .close-panel')).toHaveCount(0);
  await expect(board.locator('[data-art="bulletin-board"]')).toHaveCount(1);
  await expect(board.getByRole('heading', { level: 1 })).toHaveText('A website problem deserves a useful answer.');
  for (const name of ['Explore website design', 'Explore website rescue', 'Explore search visibility', 'Explore website care']) await expect(board.getByRole('link', { name, exact: true })).toBeVisible();
  expect(await board.evaluate(node => ({ position: getComputedStyle(node).position, overflow: getComputedStyle(node).overflowY }))).toEqual({ position: 'relative', overflow: 'visible' });
  await expect(board.getByRole('heading', { name: 'What does it cost?', exact: true })).toHaveCount(1);
  expect(await board.locator('.content-section').evaluateAll(notes => notes.every(note => parseFloat(getComputedStyle(note).paddingLeft) >= 16 && parseFloat(getComputedStyle(note).paddingRight) >= 16))).toBe(true);
  const audit = await new AxeBuilder({ page }).include('#main-content').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(audit.violations).toEqual([]);
});

test('the board and service detail pages reflow without clipping their reading surface', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/services/');
    await expect(page.getByTestId('service-board')).toBeVisible();
    expect(await page.locator('.content-section').evaluateAll(notes => notes.every(note => parseFloat(getComputedStyle(note).paddingLeft) >= 16 && parseFloat(getComputedStyle(note).paddingRight) >= 16))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await page.getByRole('link', { name: 'Explore website design', exact: true }).click();
    await expect(page).toHaveURL(/\/services\/website-design\/$/);
    await expect(page.locator('h1')).toBeFocused();
    await expect(page.getByTestId('service-board')).toBeVisible();
    await expect(page.locator('.page-panel')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }
  await page.goto('/services/');
  await page.getByRole('heading', { name: 'What does it cost?', exact: true }).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const source = page.locator('.home-overview').getByRole('link', { name: 'I need a new website', exact: true });
  await source.click();
  await expect(page.locator('h1')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(source).toBeFocused();
  await expect(source).toBeInViewport();
});

test('the board remains a complete readable document with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL + '/services/');
  await expect(page.getByTestId('service-board')).toBeVisible();
  await page.getByRole('link', { name: 'Explore website rescue', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your website is acting up. Start here.');
  await expect(page.getByTestId('service-board')).toBeVisible();
  await context.close();
});
