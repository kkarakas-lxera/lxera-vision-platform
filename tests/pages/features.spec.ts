import { test, expect } from '@playwright/test';

test.describe('Features Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/features');
  });

  test('displays all feature categories', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /Features/i, level: 1 })).toBeVisible();
    
    // Check feature categories are visible
    const categories = [
      'AI-Powered Learning',
      'Skills Gap Analysis',
      'Personalized Learning',
      'Enterprise Solutions'
    ];
    
    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible();
    }
  });

  test('feature cards are interactive', async ({ page }) => {
    // Find first feature card
    const firstCard = page.locator('.feature-card').first();
    
    // Check hover state changes
    await firstCard.hover();
    
    // Check if "Learn More" appears or card expands
    await expect(firstCard.getByText(/Learn More/i)).toBeVisible();
  });

  test('feature navigation tabs work', async ({ page }) => {
    // If there are tabs for different feature categories
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click through each tab
      for (let i = 0; i < tabCount; i++) {
        await tabs.nth(i).click();
        // Check that content changes
        await expect(page.getByRole('tabpanel')).toBeVisible();
      }
    }
  });

  test('CTA section appears and works', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for CTA section
    await expect(page.getByText(/Ready to transform/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
  });

  test('feature comparison table displays correctly', async ({ page }) => {
    // If there's a comparison table
    const table = page.locator('table').first();
    
    if (await table.isVisible()) {
      // Check headers
      await expect(table.locator('th')).toHaveCount({ minimum: 2 });
      
      // Check rows
      await expect(table.locator('tbody tr')).toHaveCount({ minimum: 1 });
    }
  });
});