import { test, expect } from '@playwright/test';

const SIZES = ['sm', 'md', 'lg'] as const;

test.describe('Playground Component Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/playground');
    await page.waitForLoadState('networkidle');
  });

  test('take full page screenshots for each size', async ({ page }) => {
    for (const size of SIZES) {
      // Click the size button
      const sizeBtn = page.locator(`button:has-text("${size}")`).first();
      await sizeBtn.click();
      await page.waitForTimeout(300);

      await page.screenshot({
        path: `tests/screenshots/playground-${size}.png`,
        fullPage: true,
      });
    }
  });

  test('audit input/select height consistency per size', async ({ page }) => {
    for (const size of SIZES) {
      const sizeBtn = page.locator(`button:has-text("${size}")`).first();
      await sizeBtn.click();
      await page.waitForTimeout(300);

      // Measure Input heights
      const inputs = page.locator('input[placeholder]');
      const inputCount = await inputs.count();
      const inputHeights: number[] = [];
      for (let i = 0; i < inputCount; i++) {
        const box = await inputs.nth(i).boundingBox();
        if (box) inputHeights.push(Math.round(box.height));
      }

      // Measure Select trigger height
      const selectTrigger = page
        .locator('.neo-select button, [data-scope="select"] button')
        .first();
      if (await selectTrigger.isVisible()) {
        const selectBox = await selectTrigger.boundingBox();
        if (selectBox) inputHeights.push(Math.round(selectBox.height));
      }

      // All heights should be the same
      const uniqueHeights = [...new Set(inputHeights)];
      console.log(
        `[size=${size}] Input/Select heights:`,
        inputHeights,
        '=> unique:',
        uniqueHeights,
      );

      if (uniqueHeights.length > 1) {
        console.warn(
          `[size=${size}] HEIGHT MISMATCH: inputs have different heights: ${JSON.stringify(inputHeights)}`,
        );
      }
      expect(uniqueHeights.length, `[size=${size}] all input/select should have same height`).toBe(
        1,
      );
    }
  });

  test('audit switch styling - no white/light backgrounds', async ({ page }) => {
    // Check Switch controls for incorrect backgrounds
    const switchControls = page.locator(
      '[data-scope="switch"] [data-part="control"], .neo-switch [data-part="control"]',
    );
    const switchCount = await switchControls.count();
    console.log(`Found ${switchCount} switch controls`);

    for (let i = 0; i < switchCount; i++) {
      const control = switchControls.nth(i);
      const bg = await control.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const checked = await control.getAttribute('data-state');
      console.log(`Switch[${i}] state=${checked} bg=${bg}`);

      // No white or very light backgrounds allowed
      const rgb = bg.match(/\d+/g)?.map(Number) ?? [];
      if (rgb.length >= 3) {
        const brightness = (rgb[0] + rgb[1] + rgb[2]) / 3;
        if (brightness > 200) {
          console.error(`Switch[${i}] has too-bright background: ${bg} (brightness=${brightness})`);
        }
        expect(
          brightness,
          `Switch[${i}] state=${checked} background too bright: ${bg}`,
        ).toBeLessThan(200);
      }
    }

    // Also check switch thumbs
    const thumbs = page.locator(
      '[data-scope="switch"] [data-part="thumb"], .neo-switch [data-part="thumb"]',
    );
    const thumbCount = await thumbs.count();
    for (let i = 0; i < thumbCount; i++) {
      const thumb = thumbs.nth(i);
      const bg = await thumb.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const checked = await thumb.getAttribute('data-state');
      console.log(`Thumb[${i}] state=${checked} bg=${bg}`);

      const rgb = bg.match(/\d+/g)?.map(Number) ?? [];
      if (rgb.length >= 3) {
        const brightness = (rgb[0] + rgb[1] + rgb[2]) / 3;
        if (brightness > 200) {
          console.error(`Thumb[${i}] has too-bright background: ${bg}`);
        }
        expect(
          brightness,
          `Thumb[${i}] state=${checked} background too bright: ${bg}`,
        ).toBeLessThan(200);
      }
    }
  });

  test('audit component backgrounds - dark theme consistency', async ({ page }) => {
    // Check all Card roots
    const cards = page.locator('[data-scope="card"], .neo-card');
    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const bg = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      console.log(`Card[${i}] bg=${bg}`);
    }

    // Check all Button backgrounds for dark theme
    const buttons = page.locator('button');
    const btnCount = await buttons.count();
    for (let i = 0; i < btnCount; i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      const bg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const color = await btn.evaluate((el) => window.getComputedStyle(el).color);
      console.log(`Button[${i}] "${text?.trim()}" bg=${bg} color=${color}`);
    }
  });

  test('audit spacing and compactness', async ({ page }) => {
    // Check section gaps
    const sections = page.locator('[data-scope]').or(page.locator('section'));

    // Measure vertical gaps between major sections
    const headings = page.locator('h2');
    const headingCount = await headings.count();
    const headingPositions: { text: string; y: number }[] = [];

    for (let i = 0; i < headingCount; i++) {
      const box = await headings.nth(i).boundingBox();
      const text = (await headings.nth(i).textContent()) ?? '';
      if (box) {
        headingPositions.push({ text: text.trim(), y: box.y });
      }
    }

    // Log gaps between sections
    for (let i = 1; i < headingPositions.length; i++) {
      const gap = headingPositions[i].y - headingPositions[i - 1].y;
      console.log(
        `Gap between "${headingPositions[i - 1].text}" and "${headingPositions[i].text}": ${gap}px`,
      );
    }

    // Check overall page height
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Total page height: ${pageHeight}px`);
  });

  test('audit all component text colors match theme', async ({ page }) => {
    // Verify no pure black text (should be neon/mist/dim)
    const allText = page.locator('p, span, h1, h2, h3, h4, label');
    const textCount = await allText.count();
    let issues = 0;

    for (let i = 0; i < Math.min(textCount, 50); i++) {
      const el = allText.nth(i);
      const color = await el.evaluate((e) => window.getComputedStyle(e).color);
      const text = (await el.textContent()) ?? '';
      const rgb = color.match(/\d+/g)?.map(Number) ?? [];

      // Check for pure black text (which would be wrong on dark theme)
      if (rgb.length >= 3 && rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) {
        console.warn(`Pure black text found: "${text.trim().slice(0, 30)}" color=${color}`);
        issues++;
      }
    }
    console.log(`Text color issues: ${issues}`);
  });
});
