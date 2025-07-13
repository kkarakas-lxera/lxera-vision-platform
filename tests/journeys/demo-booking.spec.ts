import { test, expect } from '@playwright/test';

test.describe('Demo Booking Journey', () => {
  test('complete demo booking from homepage', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Click Book Demo button
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill out the form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="company"]', 'Test Company');
    
    // Select company size if dropdown exists
    const companySizeSelect = page.locator('select[name="companySize"]');
    if (await companySizeSelect.isVisible()) {
      await companySizeSelect.selectOption('50-100');
    }
    
    // Submit form
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Verify success message
    await expect(page.getByText(/Thank you|Success|We'll be in touch/i)).toBeVisible();
  });

  test('demo booking from features page', async ({ page }) => {
    // Navigate to features page
    await page.goto('/features');
    
    // Scroll to find a Book Demo button
    await page.getByRole('button', { name: /Book Demo|Get Started/i }).first().click();
    
    // Complete the form
    await page.fill('input[name="email"]', 'features@example.com');
    await page.fill('input[name="name"]', 'Features User');
    await page.fill('input[name="company"]', 'Features Corp');
    
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Verify submission
    await expect(page.getByText(/Thank you|Success/i)).toBeVisible();
  });

  test('demo booking with validation errors', async ({ page }) => {
    await page.goto('/');
    
    // Open demo modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/required|please enter/i)).toBeVisible();
    
    // Fill only email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Check for email validation error
    await expect(page.getByText(/valid email|invalid/i)).toBeVisible();
    
    // Fill with valid data
    await page.fill('input[name="email"]', 'valid@example.com');
    await page.fill('input[name="name"]', 'Valid User');
    await page.fill('input[name="company"]', 'Valid Company');
    
    await page.getByRole('button', { name: /Submit/i }).click();
    
    // Should succeed now
    await expect(page.getByText(/Thank you|Success/i)).toBeVisible();
  });

  test('demo booking preserves form data on navigation', async ({ page }) => {
    await page.goto('/');
    
    // Open demo modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    // Fill partial form
    await page.fill('input[name="email"]', 'preserve@example.com');
    await page.fill('input[name="name"]', 'Preserve Test');
    
    // Close modal (if there's a close button)
    const closeButton = page.getByRole('button', { name: /Close|Cancel|×/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click outside modal
      await page.keyboard.press('Escape');
    }
    
    // Re-open modal
    await page.getByRole('button', { name: /Book Demo/i }).first().click();
    
    // Check if form data is preserved (this depends on your implementation)
    const emailValue = await page.inputValue('input[name="email"]');
    const nameValue = await page.inputValue('input[name="name"]');
    
    // Note: This test assumes form data is cleared on close
    // Adjust based on your actual behavior
    expect(emailValue).toBe(''); // or 'preserve@example.com' if preserved
    expect(nameValue).toBe(''); // or 'Preserve Test' if preserved
  });
});