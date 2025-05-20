require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const logLines = [];

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-features=PasswordManagerEnabled,AutofillServerCommunication,AutofillEnableAccountWalletStorage',
      '--disable-save-password-bubble',
      '--disable-popup-blocking',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-notifications',
      '--disable-extensions',
      '--disable-translate'
    ],
    defaultViewport: null,
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  page.on('dialog', async dialog => {
    console.log('Auto-accept dialog:', dialog.message());
    await dialog.accept();
  });

  try {
    // === Login Step ===
    const loginStart = Date.now();
    await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
    await page.type('#username', process.env.LOGIN_USERNAME);
    await page.type('#password', process.env.LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const loginTime = Date.now() - loginStart;
    logLines.push(`⏱️ Login Time: ${loginTime} ms`);

    // === Create Product ===
    const createStart = Date.now();

    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    let found = false;

    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text?.trim() === 'Create Product') {
        await btn.click();
        found = true;
        break;
      }
    }

    if (!found) {
      const errMsg = '❌ ไม่พบปุ่ม Create Product';
      console.error(errMsg);
      logLines.push(errMsg);
      await browser.close();
      return;
    }

    await page.waitForSelector('input[placeholder="Enter product code"]');
    await page.type('input[placeholder="Enter product code"]', 'Sunsceen2');
    await page.type('input[placeholder="Enter product name"]', 'small sunscreen');
    await page.type('input[placeholder="Width"]', '10');
    await page.type('input[placeholder="Height"]', '10');
    await page.type('input[placeholder="Length"]', '10');
    await page.type('textarea[placeholder="Enter product description (optional)"]', 'small sunscreen');
    await page.click('#btn-create');

    const createTime = Date.now() - createStart;
    logLines.push(`⏱️ Create Product Time: ${createTime} ms`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const productCode = 'Sunsceen2';

    // === Click Edit Button ===
    await page.waitForFunction(
      (code) => {
        return Array.from(document.querySelectorAll('th')).some(th => th.textContent.trim() === code);
      },
      {},
      productCode
    );

    const rows = await page.$$('tr');
    let clicked = false;

    for (const row of rows) {
      const header = await row.$('th');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === productCode) {
          const buttons = await row.$$('button');
          for (const btn of buttons) {
            const btnText = await page.evaluate(el => el.textContent.trim(), btn);
            if (btnText === 'Edit') {
              await btn.click();
              clicked = true;
              break;
            }
          }
        }
      }
      if (clicked) break;
    }

    if (!clicked) {
      const msg = '❌ ไม่พบปุ่ม Edit สำหรับสินค้าที่สร้าง';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }

    // === แก้ไขฟอร์ม ===
    await page.waitForSelector('input[placeholder="Enter product code"]');
    await page.click('input[placeholder="Enter product code"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter product code"]', 'DayCream');

    await page.click('input[placeholder="Enter product name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter product name"]', 'small DayCream');

    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '20');

    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '20');

    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '20');

    await page.click('textarea[placeholder="Enter product description..."]', { clickCount: 3 });
    await page.type('textarea[placeholder="Enter product description..."]', 'small DayCream');

    await page.click('#btn-update'); // หรือปุ่ม Save แล้วแต่ระบบ
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ แก้ไขสินค้าเรียบร้อยแล้ว');

  } catch (err) {
    const errorMsg = `❌ เกิดข้อผิดพลาด: ${err.message}`;
    console.error(errorMsg);
    logLines.push(errorMsg);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    const logPath = path.join(__dirname, 'performance-log.txt');
    fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
    console.log(`📄 บันทึก log ที่: ${logPath}`);
    await browser.close();
  }
})();
