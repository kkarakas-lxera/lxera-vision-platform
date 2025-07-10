// @ts-nocheck
import { test, expect, devices } from '@playwright/test';

// Use built-in iPhone 14 device profile
const iPhone = devices['iPhone 14'];

test.use({ ...iPhone });

test('Progressive demo modal renders & is interactive', async ({ page }) => {
  // Adjust URL if running against deployed preview; default to local dev
  const url = process.env.TEST_BASE_URL || 'http://localhost:5173';
  await page.goto(url, { waitUntil: 'networkidle' });

  // Scroll a bit to ensure hero section loaded
  await page.mouse.wheel(0, 300);

  // Tap Request Demo button (minimal variant on mobile hero)
  const demoButton = page.getByRole('button', { name: /request demo/i }).first();
  await expect(demoButton).toBeVisible();
  await demoButton.click();

  // Modal should appear
  const modal = page.locator('.progressive-demo-capture .fixed');
  await expect(modal).toBeVisible();

  // Check form fields are visible and enabled
  const emailInput = page.getByPlaceholder('Work email');
  const nameInput = page.getByPlaceholder('Your full name');
  await expect(emailInput).toBeVisible();
  await expect(nameInput).toBeVisible();
  await expect(emailInput).toBeEditable();

  // Ensure nothing overlaps the modal center point
  const overlap = await modal.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(x, y);
    return !el.contains(topEl) && topEl !== el;
  });
  expect(overlap).toBeFalsy();

  // Take screenshot for manual verification (will be saved to playwright-report)
  await page.screenshot({ path: 'playwright-report/mobile-demo-modal.png', fullPage: true });
});