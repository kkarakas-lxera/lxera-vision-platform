import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/LXERA/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /learning.*innovation/i);
  });

  test('hero section displays correctly', async ({ page }) => {
    // Check hero heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('button', { name: /Book Demo/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Platform/i })).toBeVisible();
    
    // Check hero image/animation
    await expect(page.locator('.hero-section')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Test each navigation link
    const navLinks = [
      { name: 'Features', url: '/features' },
      { name: 'Pricing', url: '/pricing' },
      { name: 'Contact', url: '/contact' }
    ];

    for (const link of navLinks) {
      await page.getByRole('link', { name: link.name }).click();
      await expect(page).toHaveURL(link.url);
      await page.goto('/'); // Go back to home
    }
  });

  test('mobile menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Check menu is visible
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Click a link
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL('/features');
  });

  test('footer contains all required links', async ({ page }) => {
    const footer = page.locator('footer');
    
    // Company links
    await expect(footer.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible();
    
    // Legal links
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    
    // Social links
    await expect(footer.getByRole('link', { name: /LinkedIn/i })).toBeVisible();
  });
});