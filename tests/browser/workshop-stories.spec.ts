import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type StoryVisibilityProbe = {
  hold: boolean;
  entries: IntersectionObserverEntry[];
  latest: boolean | null;
  flush: () => void;
};
type StoryProbeWindow = Window & { __tscStoryVisibility: StoryVisibilityProbe };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/demo', route => route.fulfill({ status: 503, body: 'Synthetic test. No email sent.' }));
  await page.route(/^https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//, route => route.abort());
});

test('the guided room story is usable as still poses, keeps real destinations and ends cleanly', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const voice = page.getByTestId('computer-conversation');
  await expect(voice.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await expect(voice.locator('.computer-story-heading')).toContainText('Welcome to the workshop');
  await expect(voice.getByRole('button', { name: 'Hold that thought' })).toHaveCount(0);
  await voice.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-focus', 'bulletin-board');
  await expect(voice.getByRole('link', { name: 'Take a look' })).toHaveAttribute('href', '/services/');
  for (let index = 0; index < 4; index++) await voice.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(voice.getByRole('link', { name: 'Get my demo' })).toHaveAttribute('href', '/contact/');
  await expect(voice.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
  await voice.getByRole('button', { name: 'Your turn', exact: true }).click();
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-story', 'none');
  await expect(voice.getByRole('link', { name: 'I need a new website', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('a story respects pause, resumes its clock and allows immediate cancellation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Watch a website rescue' }).click();
  const voice = page.getByTestId('computer-conversation');
  await voice.getByRole('button', { name: 'Hold that thought' }).click();
  await page.waitForTimeout(150);
  const heldArt = await page.locator('.room-art').innerHTML();
  await page.waitForTimeout(4800);
  expect(await page.locator('.room-art').innerHTML()).toBe(heldArt);
  await expect(voice.locator('.computer-story-heading')).toContainText('A familiar feeling');
  await voice.getByRole('button', { name: 'Continue story' }).click();
  await expect(voice.locator('.computer-story-heading')).toContainText('First, find the problem', { timeout: 6000 });
  await voice.getByRole('button', { name: 'End story' }).click();
  await expect(page.getByTestId('workshop')).toHaveAttribute('data-story', 'none');
  await expect(voice).toHaveAttribute('data-attitude', 'off');
});

test('privacy choices are compact, accessible and never scroll the first visit to the footer', async ({ page }) => {
  await page.route('**/api/config', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ analytics: { measurementId: 'G-TSCFIXTURE' } }) }));
  await page.goto('/');
  const panel = page.locator('.consent-panel');
  await expect(panel).toBeVisible();
  const height = (await panel.boundingBox())!.height;
  expect(height).toBeLessThan(370);
  await expect(panel.getByRole('button', { name: 'Decline analytics', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Allow analytics', exact: true })).toBeVisible();
  const audit = await new AxeBuilder({ page }).include('.consent-panel').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(audit.violations).toEqual([]);
  await panel.getByRole('button', { name: 'Decline analytics', exact: true }).click();
  await expect(panel).toBeHidden();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.getByRole('button', { name: 'Privacy preferences', exact: true }).click();
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Close preferences', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Privacy preferences', exact: true })).toBeFocused();
});

test('all five characters can choose all three scripts without replacing their rigs', async ({ page }) => {
  await page.goto('/work/');
  const stage = page.getByTestId('character-playground');
  for (const slug of ['smartphone', 'flip-phone', 'app-bot', 'pager', 'handheld']) {
    await stage.locator(`[data-character-choice="${slug}"]`).click();
    await expect(stage).toHaveAttribute('data-character', slug);
    const select = stage.getByLabel('Choose their story');
    await expect(select.locator('option')).toHaveCount(3);
    await select.selectOption('rescue');
    await expect(select).toHaveValue('rescue');
    await select.selectOption('deadline');
    await expect(select).toHaveValue('deadline');
    await expect(stage.getByLabel('All expressions and moves').locator('option')).toHaveCount(32);
  }
});

test('new stage stories perform their opening and closing expressions before finishing', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/');
  const stage = page.getByTestId('character-playground');
  const actor = page.getByTestId('stage-actor');
  for (const [script, opening, closing] of [['rescue', 'Sad', 'Proud'], ['deadline', 'Sleepy', 'Bow']]) {
    await stage.getByLabel('Choose their story').selectOption(script);
    await stage.getByRole('button', { name: 'A little performance', exact: true }).click();
    await page.getByTestId('character-stage').scrollIntoViewIfNeeded();
    await expect(actor).toHaveAttribute('data-action', opening!);
    // A home-positioning command must not swallow the actual acting clip.
    await page.waitForTimeout(700);
    await expect(actor).toHaveAttribute('data-action', opening!);
    await expect(actor).toHaveAttribute('data-action', closing!, { timeout: 40000 });
    await page.waitForTimeout(700);
    await expect(actor).toHaveAttribute('data-action', closing!);
    await expect(stage).toHaveAttribute('data-show', 'idle', { timeout: 10000 });
    await expect(stage.locator('.playground-status')).toHaveText('That’s the show. Your turn.');
  }
});

test('keyboard focus stays on an available control when a room story reaches its final beat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const voice = page.getByTestId('computer-conversation');
  for (let index = 0; index < 5; index++) await voice.getByRole('button', { name: 'Next', exact: true }).press('Enter');
  await expect(voice.getByRole('button', { name: 'Your turn', exact: true })).toBeFocused();
  await voice.getByRole('button', { name: 'Your turn', exact: true }).press('Enter');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Watch a website rescue', exact: true }).click();
  for (let index = 0; index < 3; index++) await voice.getByRole('button', { name: 'Next', exact: true }).click();
  await voice.getByRole('button', { name: 'End story', exact: true }).focus();
  await expect(voice.locator('.computer-story-heading')).toContainText('5 / 5');
  await expect(voice.getByRole('button', { name: 'End story', exact: true })).toBeFocused();
});

test('a held final story pose still has a resume control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Watch a website rescue', exact: true }).click();
  const voice = page.getByTestId('computer-conversation');
  await voice.getByRole('button', { name: 'Hold that thought', exact: true }).click();
  for (let index = 0; index < 4; index++) await voice.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(voice.getByRole('button', { name: 'Continue story', exact: true })).toBeVisible();
  await voice.getByRole('button', { name: 'Continue story', exact: true }).click();
  await expect(voice.getByRole('button', { name: 'Hold that thought', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('a room story uses the newest visibility change when a quick scroll queues exit and entry together', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const NativeObserver = window.IntersectionObserver;
    const state: StoryVisibilityProbe = { hold: false, entries: [], latest: null, flush: () => {} };
    (window as unknown as StoryProbeWindow).__tscStoryVisibility = state;
    // Keep the browser's actual geometry and records. Deliver a short exit/entry
    // sequence in one callback, as the IntersectionObserver queue is allowed to do.
    window.IntersectionObserver = class extends NativeObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super((entries, observer) => {
          if (options?.threshold !== 0.15) { callback(entries, observer); return; }
          state.latest = entries.at(-1)?.isIntersecting ?? false;
          if (!state.hold) { callback(entries, observer); return; }
          state.entries.push(...entries);
          state.flush = () => { state.hold = false; callback([...state.entries], observer); };
        }, options);
      }
    };
  });
  await page.goto('/');
  const voice = page.getByTestId('computer-conversation');
  await page.getByRole('button', { name: 'Watch a website rescue', exact: true }).click();
  for (let index = 0; index < 3; index++) await voice.getByRole('button', { name: 'Next', exact: true }).click();
  await voice.getByRole('button', { name: 'Hold that thought', exact: true }).click();
  await voice.getByRole('button', { name: 'End story', exact: true }).focus();
  await expect(voice.locator('.computer-story-heading')).toContainText('4 / 5');
  await expect.poll(() => page.evaluate(() => (window as unknown as StoryProbeWindow).__tscStoryVisibility.latest)).toBe(true);
  const scrollPosition = await page.evaluate(() => {
    (window as unknown as StoryProbeWindow).__tscStoryVisibility.hold = true;
    return window.scrollY;
  });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => (window as unknown as StoryProbeWindow).__tscStoryVisibility.entries.some(entry => !entry.isIntersecting))).toBe(true);
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), scrollPosition);
  await expect.poll(() => page.evaluate(() => (window as unknown as StoryProbeWindow).__tscStoryVisibility.entries.at(-1)?.isIntersecting)).toBe(true);
  expect(await page.evaluate(() => (window as unknown as StoryProbeWindow).__tscStoryVisibility.entries[0]?.isIntersecting)).toBe(false);
  await expect(voice.locator('.computer-story-heading')).toContainText('4 / 5');
  await page.evaluate(() => (window as unknown as StoryProbeWindow).__tscStoryVisibility.flush());
  // Resume without focus/scroll changes that could emit a fresh observer entry
  // and conceal the queued-record bug. Keyboard interaction is tested above.
  await voice.getByRole('button', { name: 'Continue story', exact: true }).evaluate(button => (button as HTMLButtonElement).click());
  await expect(voice.locator('.computer-story-heading')).toContainText('5 / 5');
  await expect(voice.getByRole('button', { name: 'End story', exact: true })).toBeFocused();
});

test('a room story pauses offscreen and resumes when its stage returns', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Watch a website rescue', exact: true }).click();
  const voice = page.getByTestId('computer-conversation');
  const scrollPosition = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('.workshop-stage')).not.toBeInViewport();
  await page.waitForTimeout(5000);
  await expect(voice.locator('.computer-story-heading')).toContainText('1 / 5');
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), scrollPosition);
  await expect(voice.locator('.computer-story-heading')).toContainText('2 / 5', { timeout: 6000 });
});
