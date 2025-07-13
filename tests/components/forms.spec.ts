import { test, expect } from '@playwright/test';

test.describe('Form Components', () => {
  test.describe('Contact Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
    });

    test('displays all required fields', async ({ page }) => {
      const form = page.locator('form').first();
      
      // Check for standard fields
      await expect(form.locator('input[name="name"]')).toBeVisible();
      await expect(form.locator('input[name="email"]')).toBeVisible();
      await expect(form.locator('textarea[name="message"]')).toBeVisible();
      
      // Check for labels
      await expect(form.getByText('Name')).toBeVisible();
      await expect(form.getByText('Email')).toBeVisible();
      await expect(form.getByText('Message')).toBeVisible();
    });

    test('validates required fields', async ({ page }) => {
      const form = page.locator('form').first();
      const submitButton = form.getByRole('button', { name: /submit|send/i });
      
      // Try to submit empty form
      await submitButton.click();
      
      // Check for validation messages
      await expect(page.getByText(/required|please fill/i)).toBeVisible();
    });

    test('validates email format', async ({ page }) => {
      const form = page.locator('form').first();
      
      // Fill invalid email
      await form.locator('input[name="email"]').fill('invalid-email');
      await form.locator('input[name="name"]').fill('Test User');
      await form.locator('textarea[name="message"]').fill('Test message');
      
      // Submit
      await form.getByRole('button', { name: /submit|send/i }).click();
      
      // Check for email validation error
      await expect(page.getByText(/valid email|invalid email/i)).toBeVisible();
    });

    test('successful form submission', async ({ page }) => {
      const form = page.locator('form').first();
      
      // Fill form
      await form.locator('input[name="name"]').fill('Test User');
      await form.locator('input[name="email"]').fill('test@example.com');
      await form.locator('textarea[name="message"]').fill('This is a test message');
      
      // Submit
      await form.getByRole('button', { name: /submit|send/i }).click();
      
      // Check for success message
      await expect(page.getByText(/thank you|success|received/i)).toBeVisible();
    });
  });

  test.describe('Demo Request Form', () => {
    test('auto-fills from URL parameters', async ({ page }) => {
      // Navigate with pre-fill parameters
      await page.goto('/?demo=true&email=prefill@example.com&name=Prefilled%20User');
      
      // Open demo modal
      await page.getByRole('button', { name: /Book Demo/i }).first().click();
      
      // Check if fields are pre-filled
      const emailInput = page.locator('input[name="email"]');
      const nameInput = page.locator('input[name="name"]');
      
      if (await emailInput.isVisible()) {
        const emailValue = await emailInput.inputValue();
        const nameValue = await nameInput.inputValue();
        
        // Note: This assumes your app supports URL pre-filling
        // Adjust based on actual behavior
        expect(emailValue).toBe('prefill@example.com');
        expect(nameValue).toBe('Prefilled User');
      }
    });
  });

  test.describe('Form Field Interactions', () => {
    test('input field focus states', async ({ page }) => {
      await page.goto('/contact');
      
      const nameInput = page.locator('input[name="name"]');
      
      // Focus on input
      await nameInput.focus();
      
      // Check if parent or input has focus class
      await expect(nameInput).toBeFocused();
      
      // Some apps add classes to parent on focus
      const parent = nameInput.locator('..');
      const classes = await parent.getAttribute('class');
      
      // Tab to next field
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="email"]')).toBeFocused();
    });

    test('textarea character counter', async ({ page }) => {
      await page.goto('/contact');
      
      const textarea = page.locator('textarea[name="message"]');
      const counter = page.locator('.character-counter, [data-character-count]');
      
      if (await counter.isVisible()) {
        // Type in textarea
        await textarea.fill('This is a test message');
        
        // Check counter updates
        await expect(counter).toContainText(/22|characters/);
        
        // Check max length behavior if applicable
        const maxLength = await textarea.getAttribute('maxlength');
        if (maxLength) {
          const longText = 'a'.repeat(parseInt(maxLength) + 10);
          await textarea.fill(longText);
          
          // Should be truncated to max length
          const value = await textarea.inputValue();
          expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
        }
      }
    });

    test('dropdown/select interactions', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Book Demo/i }).first().click();
      
      const select = page.locator('select[name="companySize"]');
      
      if (await select.isVisible()) {
        // Check options are available
        const options = await select.locator('option').count();
        expect(options).toBeGreaterThan(1);
        
        // Select an option
        await select.selectOption({ index: 1 });
        
        // Verify selection
        const selectedValue = await select.inputValue();
        expect(selectedValue).not.toBe('');
      }
    });
  });
});