import { defineConfig, devices } from '@playwright/test';

/**
 * PulseBoard Playwright Test Configuration
 * Tests run against the local dev server at http://localhost:3000
 * Make sure `npm run dev` is running before executing tests.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run sequentially to avoid auth state conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Don't auto-start dev server — we run it manually so we can see logs
  // webServer: { command: 'npm run dev', url: 'http://localhost:3000' },
});
