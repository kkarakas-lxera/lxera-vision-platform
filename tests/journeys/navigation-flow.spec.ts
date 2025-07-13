import { test, expect } from '@playwright/test';

test.describe('User Navigation Journey', () => {
  test('explore features and pricing flow', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to Features
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL('/features');
    
    // Explore a specific feature
    const featureCard = page.locator('.feature-card').first();
    await featureCard.click();
    
    // Check if modal or detail view opens
    const modal = page.getByRole('dialog');
    const detailSection = page.locator('.feature-detail');
    
    if (await modal.isVisible()) {
      await expect(modal).toContainText(/Learn more|Details/i);
      await page.keyboard.press('Escape');
    } else if (await detailSection.isVisible()) {
      await expect(detailSection).toBeVisible();
    }
    
    // Navigate to Pricing
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
    
    // Select a pricing plan
    const planCard = page.locator('.pricing-card').nth(1); // Select middle plan
    await planCard.getByRole('button', { name: /Choose|Select|Get Started/i }).click();
    
    // Should either open demo modal or navigate to signup
    await expect(
      page.getByRole('dialog').or(page.locator('form[action*="signup"]'))
    ).toBeVisible();
  });

  test('mobile navigation journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/');
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Navigate through mobile menu
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL('/features');
    
    // Menu should close after navigation
    await expect(page.locator('.mobile-menu')).not.toBeVisible();
    
    // Open menu again
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Navigate to Contact
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('/contact');
  });

  test('breadcrumb navigation', async ({ page }) => {
    // Navigate to a deeper page
    await page.goto('/solutions/AIPersonalizedLearning');
    
    // Check if breadcrumbs exist
    const breadcrumbs = page.locator('nav[aria-label="breadcrumb"]');
    
    if (await breadcrumbs.isVisible()) {
      // Click Home in breadcrumbs
      await breadcrumbs.getByRole('link', { name: 'Home' }).click();
      await expect(page).toHaveURL('/');
      
      // Navigate back
      await page.goto('/solutions/AIPersonalizedLearning');
      
      // Click Solutions in breadcrumbs
      await breadcrumbs.getByRole('link', { name: 'Solutions' }).click();
      await expect(page).toHaveURL('/solutions');
    }
  });

  test('footer navigation journey', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Navigate using footer links
    const footer = page.locator('footer');
    
    // Click About link
    await footer.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/about/);
    
    // Go back and click Privacy Policy
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await footer.getByRole('link', { name: 'Privacy Policy' }).click();
    await expect(page).toHaveURL(/privacy/);
  });
});