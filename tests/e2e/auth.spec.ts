import { test, expect } from '@playwright/test';

/**
 * Auth Flow Tests
 * Tests the login page UI, redirect behavior, and session guarding.
 * NOTE: These are UI/flow tests. They do NOT sign in with real Firebase credentials
 * since we don't store real creds in CI. Sign-in tests are skipped with a note.
 */

test.describe('Auth — Login Page', () => {
  test('redirects unauthenticated users from / to /auth/login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/auth/login**', { timeout: 8000 });
    expect(page.url()).toContain('/auth/login');
  });

  test('redirects unauthenticated users from /dashboard to /auth/login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/auth/login**', { timeout: 8000 });
    expect(page.url()).toContain('/auth/login');
  });

  test('login page renders without crashing', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).not.toHaveTitle(/Error/i);
    // Should not show the runtime error overlay
    await expect(page.locator('text=Runtime Error')).not.toBeVisible();
  });

  test('login page has a sign-in button or Google button', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Look for any button that mentions sign in / Google / Continue
    const signInBtn = page.locator('button').filter({
      hasText: /sign in|log in|google|continue/i,
    });
    await expect(signInBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test('login page has correct page title', async ({ page }) => {
    await page.goto('/auth/login');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toContain('404');
  });

  test('visiting /auth/login with a redirectTo param preserves it', async ({ page }) => {
    await page.goto('/auth/login?redirectTo=/dashboard');
    expect(page.url()).toContain('redirectTo');
  });
});
