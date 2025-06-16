const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.type('input[name="username"]', 'rootadmin');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  await page.screenshot({ path: 'after-login.png' });
  await browser.close();
})(); 