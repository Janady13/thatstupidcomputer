import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.abort());
  await page.route('**/api/config', route => route.fulfill({ json: { analytics: { measurementId: null } } }));
  await page.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//, route => route.abort());
});

test('published answer links survive direct entry, hydration and browser history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/services/website-rescue/#repair-or-rebuild');
  const section = page.getByRole('region', { name: 'Can you repair my website without rebuilding it?' });
  await expect(section).toBeInViewport();
  await expect(section.locator('h2')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://thatstupidcomputer.com/services/website-rescue/');
  await page.getByRole('link', { name: 'Link to this answer: The form says sent. Did the message arrive?' }).click();
  await expect(page).toHaveURL(/#form-delivery$/);
  await expect(page.locator('#form-delivery')).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(/#repair-or-rebuild$/);
  await expect(section).toBeInViewport();
  expect(errors).toEqual([]);
});

test('publisher source answers and agent controls stay accessible on the reading board', async ({ page }) => {
  await page.goto('/services/search-visibility/');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'What makes a page useful in an AI answer?' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Link to this answer: What makes a page useful in an AI answer?' })).toHaveAttribute('href', '#useful-ai-answers');
  await expect(page.getByRole('button', { name: 'Privacy preferences' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Privacy preferences' }).click();
  await expect(page.getByRole('button', { name: 'Privacy preferences' })).toHaveAttribute('aria-expanded', 'true');
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
});
