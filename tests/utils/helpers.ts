import { Page, expect } from '@playwright/test';

/**
 * Common test helpers and utilities
 */

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  
  // Wait for redirect or dashboard
  await expect(page).toHaveURL(/dashboard|home/);
}

export async function openDemoModal(page: Page) {
  // Try multiple selectors for demo button
  const demoButton = page.getByRole('button', { name: /book demo|get demo|schedule demo/i }).first();
  await demoButton.click();
  
  // Wait for modal
  await expect(page.getByRole('dialog')).toBeVisible();
}

export async function fillDemoForm(page: Page, data: {
  email: string;
  name: string;
  company: string;
  companySize?: string;
}) {
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="company"]', data.company);
  
  if (data.companySize) {
    const select = page.locator('select[name="companySize"]');
    if (await select.isVisible()) {
      await select.selectOption(data.companySize);
    }
  }
}

export async function acceptCookies(page: Page) {
  // Handle cookie banner if present
  const cookieBanner = page.getByRole('button', { name: /accept|agree|ok/i });
  if (await cookieBanner.isVisible()) {
    await cookieBanner.click();
  }
}

export async function waitForPageLoad(page: Page) {
  // Wait for common loading indicators to disappear
  await page.waitForLoadState('networkidle');
  
  // Wait for spinners to disappear
  const spinner = page.locator('.spinner, .loading, [data-loading="true"]');
  if (await spinner.count() > 0) {
    await spinner.waitFor({ state: 'hidden' });
  }
}

export async function takeAccessibilitySnapshot(page: Page, name: string) {
  // Take screenshot for visual regression
  await page.screenshot({ 
    path: `tests/screenshots/${name}.png`,
    fullPage: true 
  });
  
  // Run accessibility audit if needed
  // const accessibilitySnapshot = await page.accessibility.snapshot();
  // return accessibilitySnapshot;
}

export async function checkMobileMenu(page: Page) {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Check if menu button is visible
  const menuButton = page.getByRole('button', { name: /menu/i });
  await expect(menuButton).toBeVisible();
  
  // Open menu
  await menuButton.click();
  
  // Check menu is open
  const mobileMenu = page.locator('.mobile-menu, [data-mobile-menu]');
  await expect(mobileMenu).toBeVisible();
  
  return mobileMenu;
}

export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  // Small delay to ensure scroll animation completes
  await page.waitForTimeout(300);
}

export async function checkPagePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  });
  
  // Assert reasonable performance thresholds
  expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
  expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
  
  return metrics;
}

export const testData = {
  validUser: {
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    companySize: '50-100'
  },
  invalidEmails: [
    'invalid',
    'invalid@',
    '@invalid.com',
    'invalid@.com',
    'invalid..@example.com'
  ],
  sampleMessage: 'This is a test message for automated testing purposes.'
};