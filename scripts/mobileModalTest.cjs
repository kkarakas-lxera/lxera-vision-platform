// @ts-nocheck
 
/**
 * Automated test to verify mobile Request Demo modal renders correctly.
 * Usage: node scripts/mobileModalTest.cjs [url]
 */

const puppeteer = require('puppeteer');

(async () => {
  const targetUrl = process.argv[2] || 'http://localhost:5173';
  console.log('Testing URL:', targetUrl);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const { devices } = puppeteer;
  const iPhone = puppeteer.KnownDevices['iPhone X'];
  await page.emulate(iPhone);

  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  // Scroll a bit to ensure hero loaded
  await page.evaluate(() => window.scrollBy(0, 300));

  // Click first button containing text "Request" (case-insensitive)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => /request/i.test(b.textContent));
    if (btn) btn.click();
  });

  // Wait for modal
  await page.waitForSelector('.progressive-demo-capture .fixed', { visible: true, timeout: 10000 });
  const modal = await page.$('.progressive-demo-capture .fixed');
  const bounding = await modal.boundingBox();
  console.log('Modal bounding box:', bounding);

  const overlap = await page.evaluate(() => {
    const modal = document.querySelector('.progressive-demo-capture .fixed');
    if (!modal) return 'not found';
    const rect = modal.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(x, y);
    return !modal.contains(topEl) && topEl !== modal ? topEl.outerHTML.slice(0, 60) : null;
  });
  console.log('Overlap check:', overlap === null ? 'No overlap ✅' : overlap);

  await page.screenshot({ path: 'mobile-modal-screenshot.png' });
  console.log('Screenshot saved to mobile-modal-screenshot.png');

  await browser.close();
})();