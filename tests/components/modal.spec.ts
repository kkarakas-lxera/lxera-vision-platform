import { test, expect } from '@playwright/test';

test.describe('Modal Component', () => {
  // Test modals across different pages
  const pagesWithModals = [
    { url: '/', triggerText: 'Book Demo' },
    { url: '/features', triggerText: 'Learn More' },
    { url: '/pricing', triggerText: 'Get Started' }
  ];

  for (const pageInfo of pagesWithModals) {
    test(`modal behavior on ${pageInfo.url}`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Find and click trigger
      const trigger = page.getByRole('button', { name: new RegExp(pageInfo.triggerText, 'i') }).first();
      
      if (await trigger.isVisible()) {
        await trigger.click();
        
        // Check modal opens
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        
        // Check modal has overlay
        const overlay = page.locator('.modal-overlay, [data-radix-portal]');
        await expect(overlay).toBeVisible();
        
        // Test close with Escape key
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
        
        // Re-open modal
        await trigger.click();
        await expect(modal).toBeVisible();
        
        // Test close with X button
        const closeButton = modal.getByRole('button', { name: /close|×/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await expect(modal).not.toBeVisible();
        }
      }
    });
  }

  test('modal focus management', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Check focus is trapped in modal
    const focusableElements = await modal.locator('button, input, select, textarea, a[href], [tabindex]').all();
    
    if (focusableElements.length > 0) {
      // Tab through elements
      for (let i = 0; i < focusableElements.length + 1; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Focus should cycle back to first element
      const firstElement = focusableElements[0];
      await expect(firstElement).toBeFocused();
    }
  });

  test('modal prevents body scroll', async ({ page }) => {
    await page.goto('/');
    
    // Add content to make page scrollable
    await page.evaluate(() => {
      document.body.style.height = '200vh';
    });
    
    // Scroll down a bit
    await page.evaluate(() => window.scrollTo(0, 100));
    const scrollBefore = await page.evaluate(() => window.pageYOffset);
    
    // Open modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    // Try to scroll
    await page.mouse.wheel(0, 100);
    
    // Check scroll position hasn't changed (body scroll locked)
    const scrollAfter = await page.evaluate(() => window.pageYOffset);
    expect(scrollAfter).toBe(scrollBefore);
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Now scrolling should work
    await page.mouse.wheel(0, 100);
    const scrollFinal = await page.evaluate(() => window.pageYOffset);
    expect(scrollFinal).toBeGreaterThan(scrollBefore);
  });

  test('modal accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Open modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    const modal = page.getByRole('dialog');
    
    // Check ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    
    // Check if modal has a label
    const hasLabel = await modal.getAttribute('aria-label') || await modal.getAttribute('aria-labelledby');
    expect(hasLabel).toBeTruthy();
    
    // Check if close button has accessible label
    const closeButton = modal.getByRole('button', { name: /close/i });
    if (await closeButton.count() > 0) {
      await expect(closeButton).toHaveAttribute('aria-label', /close/i);
    }
  });
});