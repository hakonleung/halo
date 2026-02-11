import { test, expect } from '@playwright/test';

test.describe('NEO-LOG Style Check', () => {
  test('Login page styles', async ({ page }) => {
    await page.goto('/');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/login-page.png', fullPage: true });

    // Check background color (deep space black)
    const bodyBg = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('Body background:', bodyBg);

    // Check NEO-LOG heading
    const heading = page.locator('h1:has-text("NEO-LOG")');
    await expect(heading).toBeVisible();

    const headingColor = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Heading color:', headingColor);

    const headingFont = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    console.log('Heading font:', headingFont);

    // Check form container
    const formContainer = page.locator('form').locator('..');
    const containerBg = await formContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const containerBorder = await formContainer.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    console.log('Form container background:', containerBg);
    console.log('Form container border:', containerBorder);

    // Check buttons
    const signInButton = page.locator('button:has-text("Sign In")').first();
    await expect(signInButton).toBeVisible();

    const buttonBg = await signInButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const buttonColor = await signInButton.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Button background:', buttonBg);
    console.log('Button color:', buttonColor);

    // Check inputs
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    const inputBg = await emailInput.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const inputBorder = await emailInput.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    const inputColor = await emailInput.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log('Input background:', inputBg);
    console.log('Input border:', inputBorder);
    console.log('Input color:', inputColor);

    // Generate style report
    const styleReport = {
      page: 'Login',
      elements: {
        body: { background: bodyBg },
        heading: { color: headingColor, font: headingFont },
        formContainer: { background: containerBg, border: containerBorder },
        button: { background: buttonBg, color: buttonColor },
        input: { background: inputBg, border: inputBorder, color: inputColor },
      },
    };

    console.log('\n=== Style Report ===');
    console.log(JSON.stringify(styleReport, null, 2));
  });
});
