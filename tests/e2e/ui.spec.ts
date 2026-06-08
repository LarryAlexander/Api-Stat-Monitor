import { test, expect } from '@playwright/test';

/**
 * UI Component & Layout Tests
 * Tests the visible UI elements on public pages without authentication.
 */

test.describe('Login Page — UI & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
  });

  test('page is not blank', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });

  test('has no visible JavaScript error overlay', async ({ page }) => {
    await expect(page.locator('[data-nextjs-dialog]')).not.toBeVisible();
    await expect(page.locator('text=Runtime Error')).not.toBeVisible();
    await expect(page.locator('text=Unhandled Runtime Error')).not.toBeVisible();
  });

  test('has no broken images (img elements with empty src)', async ({ page }) => {
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.images)
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });
    expect(brokenImages).toHaveLength(0);
  });

  test('page has a visible heading or logo', async ({ page }) => {
    // At least one of: h1, h2, or an element with "pulseboard" text
    const heading = page.locator('h1, h2, [class*="logo"], [class*="brand"]');
    await expect(heading.first()).toBeVisible({ timeout: 5000 });
  });

  test('page is responsive — no horizontal scroll at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('page is responsive — renders correctly at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);
  });
});

test.describe('404 Page', () => {
  test('unknown routes return a 404 page, not a crash', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz-123');
    // Either 404 status or redirected to login (both are valid)
    expect([404, 200, 307]).toContain(response?.status() ?? 0);
    // Should NOT show a raw error
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible();
    await expect(page.locator('text=Runtime Error')).not.toBeVisible();
  });
});
