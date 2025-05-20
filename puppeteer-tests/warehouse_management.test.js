require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto(process.env.APP_URL);
  await page.type('input[name="username"]', process.env.LOGIN_USERNAME);
  await page.type('input[name="password"]', process.env.LOGIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // ไปหน้า Warehouse Management
  await page.goto(process.env.APP_URL + '/mswarehouse');

  // Test Create Warehouse
  await page.click('button#create-warehouse');
  await page.type('input[name="warehouse_name"]', 'Test Warehouse');
  await page.type('input[name="warehouse_width"]', '100');
  await page.type('input[name="warehouse_length"]', '100');
  await page.type('input[name="warehouse_height"]', '100');
  await page.click('button[type="Create Warehouse"]');
  await page.waitForSelector('.alert-success');
  console.log('Create Warehouse: Success');

  //Test Edit Warehouse
  await page.click('button.edit-warehouse');
  await page.type('input[name="warehouse_name"]', ' (Edited)');
  await page.click('button[type="Update Warehouse"]');
  await page.waitForSelector('.alert-success');
  console.log('Edit Warehouse: Success');

  //Test Delete Warehouse
  await page.click('button.delete-warehouse');
  await page.waitForSelector('.confirm-delete');
  await page.click('.confirm-delete');
  await page.waitForSelector('.alert-success');
  console.log('Delete Warehouse: Success');

  //Test View Warehouse
  await page.click('button.view-warehouse');
  await page.waitForSelector('.warehouse-detail');
  console.log('View Warehouse: Success');

  //Test Add Zone
  await page.click('button.add-zone');
  await page.type('input[name="zone_name"]', 'Test Zone');
  await page.type('input[name="zone_width"]', '50');
  await page.type('input[name="zone_length"]', '50');
  await page.type('input[name="zone_height"]', '50');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Add Zone: Success');

  //Test Add Rack
  await page.click('button.add-rack');
  await page.type('input[name="rack_name"]', 'Test Rack');
  await page.type('input[name="rack_width"]', '20');
  await page.type('input[name="rack_length"]', '20');
  await page.type('input[name="rack_height"]', '20');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Add Rack: Success');

  //Test Add Shelf
  await page.click('button.add-shelf');
  await page.type('input[name="shelf_name"]', 'Test Shelf');
  await page.type('input[name="shelf_level"]', '1');
  await page.type('input[name="shelf_volume"]', '1000');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.alert-success');
  console.log('Add Shelf: Success');

  await browser.close();
})(); 