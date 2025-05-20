require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
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
    ignoreDefaultArgs: ['--enable-automation'], // ทำให้ดูเหมือน user เปิดเอง
});
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        console.log('Auto-accept dialog:', dialog.message());
        await dialog.accept();
    });

    // เข้าหน้าแอดมิน (หรือหน้าที่มี DialogAddUser)
    await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });

    // ล็อกอิน
    await page.type('#username', process.env.LOGIN_USERNAME);
    await page.type('#password', process.env.LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
})();