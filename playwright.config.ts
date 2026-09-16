import { defineConfig } from '@playwright/test';

const port = Number(process.env.TSC_BROWSER_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('TSC_BROWSER_PORT must be an unprivileged TCP port.');

/** Portable acceptance suite. Not executed in the authoring host: its browser policy
 * explicitly rejected localhost. Run on the authorized BUBBLES checkout after build.
 * Engine/mobile emulation results do not establish actual Safari or device coverage.
 */
export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'test-results/browser-report', open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-mobile-emulation', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: 'firefox-desktop', use: { browserName: 'firefox', viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-desktop-engine', use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'node --import tsx scripts/browser-server.ts',
    url: `http://127.0.0.1:${port}/api/health`,
    timeout: 30_000,
    reuseExistingServer: false,
  },
});
