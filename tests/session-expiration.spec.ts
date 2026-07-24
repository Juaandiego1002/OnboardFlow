import { test, expect } from '@playwright/test';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test.describe('Session expiration on tab close', () => {
  async function loginAndGetAdminId(page: import('@playwright/test').Page) {
    const loginRes = await page.request.post('/api/auth/login', {
      data: { email: 'admin@startup.com' },
    });
    const loginData = await loginRes.json();
    expect(loginData.adminId).toBeTruthy();
    return loginData.adminId;
  }

  async function verifySession(
    page: import('@playwright/test').Page,
    adminId: string,
    expectSuccess: boolean,
  ) {
    const res = await page.request.post('/api/auth/verify', {
      data: { adminId },
    });
    const data = await res.json();
    if (expectSuccess) {
      expect(res.status()).toBe(200);
      expect(data.success).toBe(true);
      expect(data.admin.email).toBe('admin@startup.com');
    } else {
      expect(res.status()).toBe(401);
      expect(data.error).toContain('Sesión');
    }
  }

  test('Cierre real de pestaña → sesión debe expirar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/');

    const adminId = await loginAndGetAdminId(page);

    await verifySession(page, adminId, true);

    const closeRes = await page.request.post('/api/auth/tab-closed', {
      data: { adminId },
    });
    expect((await closeRes.json()).ok).toBe(true);

    await page.close();
    await ctx.close();

    await sleep(6000);

    const page2 = await browser.newPage();
    await page2.goto('/');

    await verifySession(page2, adminId, false);
    await page2.close();
  });

  test('Recarga de página (F5) → sesión NO debe expirar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/');

    const adminId = await loginAndGetAdminId(page);

    await verifySession(page, adminId, true);

    const closeRes = await page.request.post('/api/auth/tab-closed', {
      data: { adminId },
    });
    expect((await closeRes.json()).ok).toBe(true);

    const cancelRes = await page.request.post('/api/auth/cancel-close', {
      data: { adminId },
    });
    expect((await cancelRes.json()).ok).toBe(true);

    await verifySession(page, adminId, true);

    await page.close();
    await ctx.close();
  });

  test('Cambio de pestaña (sin cerrar) → sesión NO debe expirar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/');

    const adminId = await loginAndGetAdminId(page);

    await verifySession(page, adminId, true);

    const page2 = await ctx.newPage();
    await page2.goto('about:blank');
    await sleep(500);
    await page.bringToFront();
    await sleep(500);

    await verifySession(page, adminId, true);

    await page2.close();
    await page.close();
    await ctx.close();
  });

  test('Navegación interna en la app → sesión NO debe expirar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/');

    const adminId = await loginAndGetAdminId(page);

    await verifySession(page, adminId, true);
    await verifySession(page, adminId, true);

    await page.close();
    await ctx.close();
  });
});