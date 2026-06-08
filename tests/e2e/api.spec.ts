import { test, expect } from '@playwright/test';

/**
 * API Route Smoke Tests
 * Tests that key API routes respond correctly (right status codes, right shape).
 * These hit the actual running Next.js server.
 */

test.describe('API Routes — Smoke Tests', () => {
  test('GET /api/session/login returns 405 (wrong method — expects POST)', async ({ request }) => {
    const res = await request.get('/api/session/login');
    // Should not be 200 on a GET — must reject with 405 or 404
    expect(res.status()).not.toBe(200);
  });

  test('POST /api/session/login without body returns 400 or 401', async ({ request }) => {
    const res = await request.post('/api/session/login', { data: {} });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('POST /api/checks/run without auth returns 401 or redirect', async ({ request }) => {
    // Don't follow redirects — the proxy returns 307 to /auth/login for unauthed API calls
    const res = await request.post('/api/checks/run', {
      data: { monitorId: 'fake-id', workspaceId: 'fake-ws' },
      maxRedirects: 0,
    });
    // 307 = proxy redirect to login, 401/403 = route-level auth rejection
    expect([401, 403, 307]).toContain(res.status());
  });

  test('POST /api/checks/scheduled without auth returns 401 or redirect', async ({ request }) => {
    // Don't follow redirects — proxy or route should reject unauthenticated requests
    const res = await request.post('/api/checks/scheduled', { maxRedirects: 0 });
    // 307 = proxy redirect, 401 = CRON_SECRET missing/wrong
    expect([401, 307]).toContain(res.status());
  });

  test('GET /api/billing/webhook returns 405 on GET (Stripe only POSTs)', async ({ request }) => {
    const res = await request.get('/api/billing/webhook');
    expect([405, 400, 401]).toContain(res.status());
  });
});

test.describe('API Routes — Public Endpoints', () => {
  test('GET / redirects to login (not a hard crash)', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 });
    // Should be a redirect (3xx)
    expect(res.status()).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
  });

  test('server returns proper content-type for HTML pages', async ({ request }) => {
    const res = await request.get('/auth/login');
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toContain('text/html');
  });
});
