require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // Login process
  console.log('Navigating to:', process.env.APP_URL);
  await page.goto(process.env.APP_URL);
  console.log('Page loaded, waiting for username input...');
  await page.waitForSelector('input[name="username"]');
  console.log('Username input found, proceeding with login...');
  await page.type('input[name="username"]', 'rootadmin');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // ไปหน้า Product Management
  await page.goto(process.env.APP_URL + '/product-management');

  //Test Create
  await page.click('button#create-product');
  await page.type('input[name="product_name"]', 'Test Product');
  await page.type('input[name="product_price"]', '99');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Create Product: Success');

  //Test Edit
  await page.click('button.edit-product');
  await page.type('input[name="product_name"]', ' (Edited)');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Edit Product: Success');

  //Test Delete
  await page.click('button.delete-product');
  await page.waitForSelector('.confirm-delete');
  await page.click('.confirm-delete');
  await page.waitForSelector('.alert-success');
  console.log('Delete Product: Success');

  await browser.close();
})(); 