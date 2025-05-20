require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  Login
  await page.goto(process.env.APP_URL);
  await page.type('input[name="username"]', process.env.LOGIN_USERNAME);
  await page.type('input[name="password"]', process.env.LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  //ไปหน้า Box Management
  await page.goto(process.env.APP_URL + '/box-management');

  //Test Create Box
  await page.click('button#create-box');
  await page.type('input[name="box_name"]', 'Test Box');
  await page.type('input[name="box_size"]', '50');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Create Box: Success');

  //Test Edit Box
  await page.click('button.edit-box');
  await page.type('input[name="box_name"]', ' (Edited)');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Edit Box: Success');

  //Test Delete Box
  await page.click('button.delete-box');
  await page.waitForSelector('.confirm-delete');
  await page.click('.confirm-delete');
  await page.waitForSelector('.alert-success');
  console.log('Delete Box: Success');

  await browser.close();
})(); 