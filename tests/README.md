# Playwright Test Suite

This directory contains end-to-end tests for the LXERA Vision Platform using Playwright.

## Test Organization

### 📁 Structure

```
tests/
├── pages/          # Page-specific tests
├── journeys/       # User journey/flow tests
├── components/     # Component-level tests
└── utils/          # Helper functions and utilities
```

### Test Categories

#### 1. **Page Tests** (`/pages`)
- Test individual pages in isolation
- Verify page-specific functionality
- Check page load, content, and basic interactions

#### 2. **Journey Tests** (`/journeys`)
- Test complete user workflows
- Cross-page interactions
- Critical business paths (e.g., demo booking, onboarding)

#### 3. **Component Tests** (`/components`)
- Test reusable components across pages
- Verify consistent behavior
- Focus on component-specific logic

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/pages/home.spec.ts

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/relevant-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.getByRole('button', { name: 'Click Me' });
    
    // Act
    await element.click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Locators**
   ```typescript
   // ✅ Good
   page.getByRole('button', { name: 'Submit' })
   page.getByLabel('Email')
   
   // ❌ Avoid
   page.locator('.btn-submit')
   page.locator('#email-input')
   ```

2. **Wait for Elements Automatically**
   ```typescript
   // Playwright auto-waits, no need for explicit waits
   await expect(element).toBeVisible();
   ```

3. **Group Related Tests**
   ```typescript
   test.describe('Navigation', () => {
     test.describe('Desktop', () => {
       // Desktop navigation tests
     });
     
     test.describe('Mobile', () => {
       // Mobile navigation tests
     });
   });
   ```

4. **Use Helper Functions**
   ```typescript
   import { openDemoModal, fillDemoForm } from '../utils/helpers';
   
   test('demo booking', async ({ page }) => {
     await openDemoModal(page);
     await fillDemoForm(page, testData.validUser);
   });
   ```

## Common Patterns

### Testing Forms
```typescript
// Check validation
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByText('Required field')).toBeVisible();

// Fill and submit
await page.fill('input[name="email"]', 'test@example.com');
await page.getByRole('button', { name: 'Submit' }).click();
```

### Testing Navigation
```typescript
await page.getByRole('link', { name: 'Features' }).click();
await expect(page).toHaveURL('/features');
```

### Testing Modals
```typescript
await page.getByRole('button', { name: 'Open Modal' }).click();
await expect(page.getByRole('dialog')).toBeVisible();
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### Mobile Testing
```typescript
await page.setViewportSize({ width: 375, height: 667 });
await page.getByRole('button', { name: 'Menu' }).click();
```

## Debugging

1. **Use UI Mode**
   ```bash
   npm run test:ui
   ```

2. **Use Debug Mode**
   ```bash
   npm run test:debug
   ```

3. **Take Screenshots**
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

4. **Pause Execution**
   ```typescript
   await page.pause();
   ```

## CI/CD Integration

Tests are configured to run in CI with:
- Parallel execution disabled for stability
- Retry on failure (2 attempts)
- HTML reports generated

## Tips

- Keep tests independent - each test should run in isolation
- Use `test.beforeEach` for common setup
- Make tests readable - they serve as documentation
- Focus on user behavior, not implementation details
- Run tests locally before pushing