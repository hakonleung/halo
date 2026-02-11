import { test } from '@playwright/test';

const TEST_USER = {
  email: 'earthism@qq.com',
  password: 'lh950712',
};

test('Check console errors on Timeline page', async ({ page }) => {
  const errors: string[] = [];

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Login
  await page.goto('/');
  await page.locator('input[type="email"]').fill(TEST_USER.email);
  await page.locator('input[type="password"]').fill(TEST_USER.password);
  await page.locator('button:has-text("Sign In")').last().click();
  await page.waitForURL('**/log', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Wait a bit for any async operations
  await page.waitForTimeout(3000);

  // Check for the issue notification
  const issueButton = page.locator('text=issue');
  if (await issueButton.isVisible()) {
    console.log('⚠️  Issue notification found on page');
    await issueButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/issue-detail.png' });
  }

  // Print all console errors
  console.log('\n========== Console Errors ==========');
  if (errors.length > 0) {
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  } else {
    console.log('✅ No console errors found');
  }
  console.log('====================================\n');
});
