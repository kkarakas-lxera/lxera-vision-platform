import { test, expect, devices } from '@playwright/test';

// Base URL for site under test; override in CI or locally via env variable
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';

// All Solutions page paths to verify
const solutionPages = [
  '/solutions/AIGamificationMotivation',
  '/solutions/AILearningSupport',
  '/solutions/AIPersonalizedLearning',
  '/solutions/EnterpriseInnovation',
  '/solutions/LearningAnalytics',
];

// Mobile device emulations to run against
const mobileDevices: Record<string, devices.DeviceDescriptor> = {
  iphone12: devices['iPhone 12'],
  galaxyS9: devices['Galaxy S9+'],
  ipadMini: devices['iPad Mini'],
};

// Helper util to decide if a colour is allowed (white / smart beige)
function isAllowedBackground(rgbString: string): boolean {
  // Normalise string e.g. "rgb(255, 255, 255)" => [255,255,255]
  const match = rgbString.match(/rgb\((\d+),\s?(\d+),\s?(\d+)\)/);
  if (!match) return false;
  const [, rStr, gStr, bStr] = match;
  const [r, g, b] = [Number(rStr), Number(gStr), Number(bStr)];
  const hex = `#${[r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
  // Acceptable backgrounds
  const ALLOWED_HEX = new Set(['#FFFFFF', '#EFEFE3']); // white & smart beige
  return ALLOWED_HEX.has(hex);
}

const safeDeviceOptions = (device: devices.DeviceDescriptor) => {
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, locale, colorScheme } = device;
  return { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch, locale, colorScheme } as const;
};

for (const [deviceName, deviceProfile] of Object.entries(mobileDevices)) {
  test.describe(`${deviceName} – Solutions visual sanity`, () => {
    test.use(safeDeviceOptions(deviceProfile));

    for (const pagePath of solutionPages) {
      test(`No neon-yellow cards on ${pagePath}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');

        // Take snapshot for manual comparison
        await page.screenshot({
          path: `tests/mobile-screenshots/${deviceName}${pagePath}.png`,
          fullPage: true,
        });

        // Query cards (using common CSS in codebase)
        const invalidCards = await page.$$eval(
          '.rounded-3xl.border',
          (elements, _isAllowedBackground) => {
            // @ts-ignore - runtime injection
            const checker = new Function('rgb', `return (${_isAllowedBackground})(rgb);`);
            return elements.filter(el => {
              const style = window.getComputedStyle(el as HTMLElement);
              return !checker(style.backgroundColor);
            }).length;
          },
          // Serialize helper into the browser context as string
          isAllowedBackground.toString()
        );

        expect(invalidCards, 'No card should have disallowed background colour').toBe(0);
      });
    }
  });
}