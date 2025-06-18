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
    // === Page Reload Step ===
    console.log('🔄 Loading webpage...');
    const reloadStart = Date.now();
    await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
    const reloadTime = Date.now() - reloadStart;
    logLines.push(`🔄 Page Reload Time: ${reloadTime} ms`);

    // === Login Step ===
    console.log('🔑 Starting login process...');
    const loginStart = Date.now();
    await page.type('#username', process.env.LOGIN_USERNAME);
    await page.type('#password', process.env.LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const loginTime = Date.now() - loginStart;
    logLines.push(`⏱️ Login Time: ${loginTime} ms`);

    // === Navigate to Box Management Page ===
    console.log('🔄 กำลังไปที่หน้า Box Management...');
    await page.goto(`${process.env.APP_URL}/Msbox`, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // === Create Box ===
    console.log('📦Starting to create new box...');
    const createStart = Date.now();
    await page.waitForSelector('#btn-add');
    await page.click('#btn-add');

    await page.waitForSelector('input[placeholder="Enter box code"]');
    await page.type('input[placeholder="Enter box code"]', 'BoxTest2');
    await page.type('input[placeholder="Enter box name"]', 'Test Box 2');
    await page.type('input[placeholder="Width"]', '10');
    await page.type('input[placeholder="Height"]', '10');
    await page.type('input[placeholder="Length"]', '10');
    await page.type('textarea[placeholder="Enter box description..."]', 'Test Box Description');
    await page.click('#btn-create');

    const createTime = Date.now() - createStart;
    logLines.push(`⏱️ Create Box Time: ${createTime} ms`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    const boxCode = 'BoxTest2';

    // === Click Edit Button ===
    console.log('✏️ Starting to edit box...');
    await page.waitForFunction(
      (code) => {
        return Array.from(document.querySelectorAll('th')).some(th => th.textContent.trim() === code);
      },
      {},
      boxCode
    );

    const rows = await page.$$('tr');
    let clickedEdit = false;

    for (const row of rows) {
      const header = await row.$('th');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === boxCode) {
          const editButton = await row.$('#btn-edit');
          if (editButton) {
            await editButton.click();
            clickedEdit = true;
            break;
          }
        }
      }
      if (clickedEdit) break;
    }

    if (!clickedEdit) {
      const msg = '❌ Edit button not found for created box';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }

    // === Edit Form ===
    const editStart = Date.now();
    await page.waitForSelector('input[placeholder="Enter box code"]');
    await page.click('input[placeholder="Enter box code"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter box code"]', 'BoxEdit2');

    await page.click('input[placeholder="Enter box name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter box name"]', 'Edit Box 2');

    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '20');

    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '20');

    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '20');

    await page.click('textarea[placeholder="Enter box description..."]', { clickCount: 3 });
    await page.type('textarea[placeholder="Enter box description..."]', 'Edit Box Description');

    await page.click('#btn-update');
    const editTime = Date.now() - editStart;
    logLines.push(`✏️ Edit Box Time: ${editTime} ms`);
    console.log('✅ Box edited successfully');

    // === Delete Box ===
    console.log('🗑️ Starting to delete box...');
    const deleteStart = Date.now();
    const editedCode = 'BoxEdit2';

    await page.waitForFunction(
      (code) => {
        return Array.from(document.querySelectorAll('th')).some(th => th.textContent.trim() === code);
      },
      {},
      editedCode
    );

    const updatedRows = await page.$$('tr');
    let clickedDelete = false;

    for (const row of updatedRows) {
      const header = await row.$('th');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === editedCode) {
          const deleteButton = await row.$('#delete-box');
          if (deleteButton) {
            await deleteButton.click();
            clickedDelete = true;
            break;
          }
        }
      }
      if (clickedDelete) break;
    }

    if (!clickedDelete) {
      const msg = `❌ Delete button not found for box ${editedCode}`;
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }

    // Confirm delete
    await page.waitForSelector('#btn-confirm-delete', { visible: true });
    await page.click('#btn-confirm-delete');

    const deleteTime = Date.now() - deleteStart;
    logLines.push(`🗑️ Delete Box Time: ${deleteTime} ms`);
    console.log('✅ Box deleted successfully');

  } catch (err) {
    const errorMsg = `❌ Error occurred: ${err.message}`;
    console.error(errorMsg);
    logLines.push(errorMsg);
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
    } catch (screenshotError) {
      console.error('Failed to save screenshot:', screenshotError.message);
    }
  } finally {
    const logPath = path.join(__dirname, 'box-log.txt');
    fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
    console.log(`📄 Log saved at: ${logPath}`);
    await browser.close();
  }
})(); 