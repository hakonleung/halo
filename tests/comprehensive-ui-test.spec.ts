import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'earthism@qq.com',
  password: 'lh950712',
};

test.describe('Comprehensive UI & Style Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button:has-text("Sign In")').last().click();
    await page.waitForURL('**/log', { timeout: 10000 });
  });

  test('Navigation and page switching', async ({ page }) => {
    console.log('Testing navigation between pages...');

    // 1. Check current page (Timeline)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/nav-01-timeline.png', fullPage: true });
    console.log('✅ Timeline page captured');

    // 2. Navigate to Dashboard
    await page.click('text=DASHBOARD');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/nav-02-dashboard.png', fullPage: true });
    console.log('✅ Dashboard page captured');

    // 3. Navigate to Settings
    await page.click('text=SETTINGS');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/nav-03-settings.png', fullPage: true });
    console.log('✅ Settings page captured');

    // 4. Navigate back to Timeline
    await page.click('text=LOG');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Navigation test completed');
  });

  test('Timeline interactions', async ({ page }) => {
    console.log('Testing Timeline interactions...');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 1. Initial state
    await page.screenshot({ path: 'tests/screenshots/timeline-01-initial.png', fullPage: true });

    // 2. Test date range picker
    const startDateInput = page.locator('input[type="date"]').first();
    if (await startDateInput.isVisible()) {
      await startDateInput.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/timeline-02-datepicker.png' });
      console.log('✅ Date picker interaction captured');
    }

    // 3. Test filter button
    const filterButton = page
      .locator('button:has([aria-label="filter"])')
      .or(page.locator('button:has-text("Filter")'))
      .first();
    if (await filterButton.isVisible().catch(() => false)) {
      await filterButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/timeline-03-filter-open.png' });
      console.log('✅ Filter interaction captured');
    }

    // 4. Test zoom controls
    const zoomIn = page
      .locator('button:has-text("+")')
      .or(page.locator('[aria-label*="zoom in"]'))
      .first();
    if (await zoomIn.isVisible().catch(() => false)) {
      await zoomIn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/timeline-04-zoom-in.png', fullPage: true });
      console.log('✅ Zoom interaction captured');
    }

    // 5. Click on timeline item if exists
    const timelineItem = page
      .locator('[role="button"]')
      .filter({ hasText: /habit|other/ })
      .first();
    if (await timelineItem.isVisible().catch(() => false)) {
      await timelineItem.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'tests/screenshots/timeline-05-item-detail.png',
        fullPage: true,
      });
      console.log('✅ Timeline item detail captured');

      // Close drawer if opened
      const closeButton = page
        .locator('button[aria-label*="close"]')
        .or(page.locator('[role="dialog"] button:has-text("×")'))
        .first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }

    console.log('✅ Timeline interactions test completed');
  });

  test('Settings tabs and forms', async ({ page }) => {
    console.log('Testing Settings page interactions...');

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 1. Profile tab (default)
    await page.screenshot({ path: 'tests/screenshots/settings-01-profile.png', fullPage: true });
    console.log('✅ Profile tab captured');

    // 2. Appearance tab
    const appearanceTab = page.locator('button:has-text("Appearance")');
    if (await appearanceTab.isVisible()) {
      await appearanceTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'tests/screenshots/settings-02-appearance.png',
        fullPage: true,
      });
      console.log('✅ Appearance tab captured');
    }

    // 3. Locale tab
    const localeTab = page.locator('button:has-text("Locale")');
    if (await localeTab.isVisible()) {
      await localeTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/settings-03-locale.png', fullPage: true });
      console.log('✅ Locale tab captured');
    }

    // 4. AI tab
    const aiTab = page.locator('button:has-text("AI")');
    if (await aiTab.isVisible()) {
      await aiTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/settings-04-ai.png', fullPage: true });
      console.log('✅ AI tab captured');
    }

    console.log('✅ Settings tabs test completed');
  });

  test('Action button and modals', async ({ page }) => {
    console.log('Testing action button and modals...');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click the + button in top right
    const actionButton = page.locator('button:has-text("+")').last();
    if (await actionButton.isVisible()) {
      await actionButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/action-01-menu-open.png', fullPage: true });
      console.log('✅ Action menu captured');

      // Try clicking outside to close
      await page.mouse.click(100, 100);
      await page.waitForTimeout(500);
    }

    console.log('✅ Action button test completed');
  });

  test('Responsive design check', async ({ page }) => {
    console.log('Testing responsive design...');

    // Desktop (default)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/responsive-01-desktop.png', fullPage: true });
    console.log('✅ Desktop view captured');

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/responsive-02-tablet.png', fullPage: true });
    console.log('✅ Tablet view captured');

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/responsive-03-mobile.png', fullPage: true });
    console.log('✅ Mobile view captured');

    console.log('✅ Responsive design test completed');
  });
});
