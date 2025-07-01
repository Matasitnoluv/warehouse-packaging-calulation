require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const logLines = [];
  const startTime = Date.now();

  // เพิ่มฟังก์ชัน logAction
  const logAction = (action) => {
    const currentTime = Date.now();
    const timeDiff = (currentTime - startTime) / 1000;
    const logMessage = `[${timeDiff.toFixed(2)}s] ${action}`;
    console.log(logMessage);
    logLines.push(logMessage);
  };

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
    // === Page Reload Step ===
    const reloadStart = Date.now();
    await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
    const reloadTime = Date.now() - reloadStart;
    logLines.push(`🔄 Page Reload Time: ${reloadTime} ms`);

    // === Login Step ===
    const loginStart = Date.now();
    await page.type('#username', process.env.LOGIN_USERNAME);
    await page.type('#password', process.env.LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const loginTime = Date.now() - loginStart;
    logLines.push(`⏱️ Login Time: ${loginTime} ms`);

    // === Go to Calculation Page ===
    logAction('🔄 กำลังไปที่หน้า Calculation...');
    await page.goto(`${process.env.APP_URL}/calculationproductbox`, { waitUntil: 'networkidle0' });
    logAction('✅ ไปหน้า Calculation สำเร็จ');

    // === กดปุ่ม Calculate ฝั่งขวา (Zone & Warehouse) ===
    logAction('🧮 กำลังกดปุ่ม Calculate Zone & Warehouse...');
    let calcBtn = await page.$('#btn-calculate-zone');
    if (!calcBtn) {
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.evaluate(el => el.textContent?.toLowerCase());
        if (text && (text.includes('zone') || text.includes('warehouse'))) {
          calcBtn = btn;
          break;
        }
      }
    }
    if (!calcBtn) {
      const allBtnTexts = await page.$$eval('button', btns => btns.map(b => b.textContent));
      console.log('ปุ่มทั้งหมดในหน้า:', allBtnTexts);
      throw new Error('ไม่พบปุ่ม Calculate Zone & Warehouse');
    }
    await calcBtn.click();
    logAction('✅ กดปุ่ม Calculate Zone & Warehouse สำเร็จ');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();