const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const root = __dirname;
  const output = path.join(root, 'images');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'workflow-screens.html')).href, { waitUntil: 'load' });
  await page.waitForSelector('.screen');
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  const screens = page.locator('.screen');
  const count = await screens.count();
  for (let i = 0; i < count; i += 1) {
    const screen = screens.nth(i);
    const file = await screen.getAttribute('data-file');
    await screen.screenshot({ path: path.join(output, file) });
  }
  await browser.close();
  console.log(`Captured ${count} workflow screens in ${output}`);
})();
