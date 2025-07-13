 
// @ts-nocheck
/**
 * Automated test to verify mobile Request Demo modal renders correctly.
 * Usage: node scripts/mobileModalTest.js [url]
 * If no URL provided, defaults to http://localhost:5173
 */

const puppeteer = require('puppeteer');

(async () => {
  const targetUrl = process.argv[2] || 'http://localhost:5173';
  console.log('Testing URL:', targetUrl);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const devices = require('puppeteer/DeviceDescriptors');
  const iPhone = devices['iPhone 14'];
  await page.emulate(iPhone);

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Scroll a bit to ensure hero loaded
  await page.evaluate(() => window.scrollBy(0, 300));

  // Click first button containing Request Demo (case-insensitive)
  const button = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'request')]" );
  if (button.length === 0) {
    console.error('❌ Could not find Request Demo button');
    await browser.close();
    process.exit(1);
  }
  await button[0].click();

  // Wait for modal fixed element to appear
  await page.waitForSelector('.progressive-demo-capture .fixed', { visible: true, timeout: 5000 });

  const modal = await page.$('.progressive-demo-capture .fixed');
  const bounding = await modal.boundingBox();
  console.log('Modal bounding box:', bounding);

  // Check central point overlap
  const overlap = await page.evaluate(() => {
    const modal = document.querySelector('.progressive-demo-capture .fixed');
    if (!modal) return 'Modal not found';
    const rect = modal.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(x, y);
    return !modal.contains(topEl) && topEl !== modal ? topEl.outerHTML.slice(0, 100) : null;
  });
  console.log('Overlap check:', overlap === null ? 'No overlap ✅' : `Overlap detected: ${overlap}`);

  // Take screenshot for docs
  const screenshotPath = 'mobile-modal-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to', screenshotPath);

  await browser.close();
})();