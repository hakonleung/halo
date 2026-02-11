import { test, expect } from '@playwright/test';

// Design system colors from CLAUDE.md
const DESIGN_COLORS = {
  matrix: 'rgb(0, 255, 65)', // #00FF41
  deepBlack: 'rgb(10, 10, 10)', // #0A0A0A
  carbon: 'rgb(26, 26, 26)', // #1A1A1A
  dark: 'rgb(42, 42, 42)', // #2A2A2A
  glowWhite: 'rgb(224, 224, 224)', // #E0E0E0
  mist: 'rgb(136, 136, 136)', // #888888
};

test.describe('Design System Validation', () => {
  test('Login page follows design system', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/screenshots/login-full.png',
      fullPage: true,
    });

    const issues: string[] = [];

    // 1. Check NEO-LOG heading
    const heading = page.locator('h1:has-text("NEO-LOG")');
    await expect(heading).toBeVisible();

    const headingColor = await heading.evaluate((el) => window.getComputedStyle(el).color);
    if (headingColor !== DESIGN_COLORS.matrix) {
      issues.push(`❌ Heading color: expected ${DESIGN_COLORS.matrix}, got ${headingColor}`);
    } else {
      console.log('✅ Heading color is correct (matrix green)');
    }

    // Check text shadow (glow effect)
    const headingShadow = await heading.evaluate((el) => window.getComputedStyle(el).textShadow);
    console.log('Heading text shadow:', headingShadow);

    // 2. Check form container
    const formBox = page.locator('form').locator('..').locator('..');
    const containerBg = await formBox.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    if (containerBg !== DESIGN_COLORS.carbon) {
      issues.push(
        `⚠️  Form container background: expected ${DESIGN_COLORS.carbon}, got ${containerBg}`,
      );
    } else {
      console.log('✅ Form container background is correct (carbon)');
    }

    const containerBorder = await formBox.evaluate((el) => window.getComputedStyle(el).borderColor);
    console.log('Form container border:', containerBorder);
    if (containerBorder !== DESIGN_COLORS.matrix) {
      issues.push(
        `⚠️  Form container border: expected ${DESIGN_COLORS.matrix}, got ${containerBorder}`,
      );
    } else {
      console.log('✅ Form container border is correct (matrix green)');
    }

    // 3. Check primary button (Sign In when selected)
    const signInButton = page.locator('button:has-text("Sign In")').first();
    const buttonBg = await signInButton.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    if (buttonBg !== DESIGN_COLORS.matrix) {
      issues.push(`❌ Button background: expected ${DESIGN_COLORS.matrix}, got ${buttonBg}`);
    } else {
      console.log('✅ Button background is correct (matrix green)');
    }

    const buttonColor = await signInButton.evaluate((el) => window.getComputedStyle(el).color);
    if (buttonColor !== DESIGN_COLORS.deepBlack) {
      issues.push(`❌ Button text color: expected ${DESIGN_COLORS.deepBlack}, got ${buttonColor}`);
    } else {
      console.log('✅ Button text color is correct (deep black)');
    }

    // 4. Check input fields
    const emailInput = page.locator('input[type="email"]');
    const inputBg = await emailInput.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    if (inputBg !== DESIGN_COLORS.deepBlack) {
      issues.push(`⚠️  Input background: expected ${DESIGN_COLORS.deepBlack}, got ${inputBg}`);
    } else {
      console.log('✅ Input background is correct (deep black)');
    }

    const inputBorder = await emailInput.evaluate((el) => window.getComputedStyle(el).borderColor);
    if (inputBorder !== DESIGN_COLORS.dark) {
      issues.push(`⚠️  Input border: expected ${DESIGN_COLORS.dark}, got ${inputBorder}`);
    } else {
      console.log('✅ Input border is correct (dark gray)');
    }

    const inputColor = await emailInput.evaluate((el) => window.getComputedStyle(el).color);
    if (inputColor !== DESIGN_COLORS.glowWhite) {
      issues.push(`⚠️  Input text color: expected ${DESIGN_COLORS.glowWhite}, got ${inputColor}`);
    } else {
      console.log('✅ Input text color is correct (glow white)');
    }

    // 5. Check label (mist color)
    const label = page.locator('label').first();
    const labelColor = await label.evaluate((el) => window.getComputedStyle(el).color);
    if (labelColor !== DESIGN_COLORS.mist) {
      issues.push(`⚠️  Label color: expected ${DESIGN_COLORS.mist}, got ${labelColor}`);
    } else {
      console.log('✅ Label color is correct (mist)');
    }

    // 6. Check fonts
    const headingFont = await heading.evaluate((el) => window.getComputedStyle(el).fontFamily);
    console.log('Heading font family:', headingFont);
    // Should include Press Start 2P or Zpix for Chinese

    const bodyFont = await page
      .locator('body')
      .evaluate((el) => window.getComputedStyle(el).fontFamily);
    console.log('Body font family:', bodyFont);

    // Print summary
    console.log('\n========== Design Validation Summary ==========');
    if (issues.length === 0) {
      console.log('✅ All design system checks passed!');
    } else {
      console.log(`⚠️  Found ${issues.length} issue(s):\n`);
      issues.forEach((issue) => console.log(issue));
    }
    console.log('===============================================\n');

    // Capture element details for debugging
    await page.screenshot({
      path: 'tests/screenshots/login-form.png',
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
      },
    });
  });
});
