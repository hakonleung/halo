import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'earthism@qq.com',
  password: 'lh950712',
};

test.describe('Authenticated Pages Style Check', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);

    // Click Sign In button
    await page.locator('button:has-text("Sign In")').last().click();

    // Wait for redirect (app redirects to /log instead of /dashboard)
    await page.waitForURL('**/log', { timeout: 10000 });
  });

  test('Dashboard page styles', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for spinner to disappear (page loaded)
    await page
      .waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 15000 })
      .catch(() => {
        console.log('No spinner found or already hidden');
      });

    // Additional wait for any animations or async content
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/dashboard.png',
      fullPage: true,
    });

    // Check page background
    const bodyBg = await page
      .locator('body')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log('Dashboard body background:', bodyBg);

    // Check navigation
    const nav = page.locator('nav').first();
    if (await nav.isVisible()) {
      const navBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      console.log('Navigation background:', navBg);
    }

    // Check cards
    const cards = page.locator('[role="group"]').first();
    if (await cards.isVisible()) {
      const cardBg = await cards.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const cardBorder = await cards.evaluate((el) => window.getComputedStyle(el).borderColor);
      console.log('Card background:', cardBg);
      console.log('Card border:', cardBorder);
    }

    console.log('✅ Dashboard screenshot captured');
  });

  test('Timeline page styles', async ({ page }) => {
    await page.goto('/log');
    await page.waitForLoadState('networkidle');

    // Wait for spinner to disappear (page loaded)
    await page
      .waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 15000 })
      .catch(() => {
        console.log('No spinner found or already hidden');
      });

    // Wait for timeline to load and render
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/timeline.png',
      fullPage: true,
    });

    console.log('✅ Timeline screenshot captured');
  });

  test('Settings page styles', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Wait for spinner to disappear (page loaded)
    await page
      .waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 15000 })
      .catch(() => {
        console.log('No spinner found or already hidden');
      });

    // Additional wait for form to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/settings.png',
      fullPage: true,
    });

    console.log('✅ Settings screenshot captured');
  });
});
