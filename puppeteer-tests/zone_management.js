// require('dotenv').config();
// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // 1. Login
//   await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
//   await page.type('#username', process.env.LOGIN_USERNAME);
//   await page.type('#password', process.env.LOGIN_PASSWORD);
//   await page.click('button[type="submit"]');
//   await page.waitForNavigation({ waitUntil: 'networkidle0' });

//   // 2. Go to Warehouse Management page
//   await page.goto(process.env.APP_URL + '/mswarehouse', { waitUntil: 'networkidle0' });

//   // 3. Create Warehouse
//   await page.waitForSelector('#btn-add');
//   await page.click('#btn-add');
//   await page.waitForSelector('input[placeholder="Enter warehouse name"]');
//   const warehouseName = 'ZoneTestWarehouse';
//   await page.type('input[placeholder="Enter warehouse name"]', warehouseName);
//   await page.type('input[placeholder="Width"]', '100');
//   await page.type('input[placeholder="Length"]', '100');
//   await page.type('input[placeholder="Height"]', '100');
//   await page.type('textarea[placeholder="Enter warehouse description..."]', 'Warehouse for zone test');
//   await page.click('#btn-create');
//   // ปิด popup ด้วย Cancel หรือ Close
//   const modalButtons = await page.$$('button');
//   for (const btn of modalButtons) {
//     const text = await page.evaluate(el => el.textContent, btn);
//     if (text && (text.trim() === 'Cancel' || text.trim() === 'Close')) {
//       await btn.click();
//       break;
//     }
//   }
//   // รอ warehouse ปรากฏในตาราง
//   await page.waitForFunction(
//     (name) => Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name),
//     {},
//     warehouseName
//   );

//   // 4. Click View
//   const rows = await page.$$('tr');
//   let clickedView = false;
//   for (const row of rows) {
//     const header = await row.$('th') || await row.$('td');
//     if (header) {
//       const text = await page.evaluate(el => el.textContent.trim(), header);
//       if (text === warehouseName) {
//         const buttons = await row.$$('button');
//         for (const btn of buttons) {
//           const btnText = await page.evaluate(el => el.textContent.trim(), btn);
//           if (btnText === 'View') {
//             await btn.click();
//             clickedView = true;
//             break;
//           }
//         }
//       }
//     }
//     if (clickedView) break;
//   }

//   // 5. Click Add Zone
//   await page.waitForSelector('#btn-add-zone');
//   await page.click('#btn-add-zone');

//   // 6. Create Zone
//   await page.waitForSelector('input[placeholder="Enter zone name"]');
//   const zoneName = 'ZoneTest1';
//   await page.type('input[placeholder="Enter zone name"]', zoneName);
//   await page.type('input[placeholder="Width"]', '10');
//   await page.type('input[placeholder="Length"]', '10');
//   await page.type('input[placeholder="Height"]', '10');
//   await page.type('input[placeholder="Enter description (optional)"]', 'Zone for testing');
//   // กด Create Zone ด้วย id
//   await page.click('#btn-create-zone');
//   // รอ zone ปรากฏในตาราง
//   await page.waitForFunction(
//     (name) => Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name),
//     {},
//     zoneName
//   );

//   // 7. Test Edit Zone
//   const zoneRows = await page.$$('tr');
//   let clickedEdit = false;
//   for (const row of zoneRows) {
//     const header = await row.$('th') || await row.$('td');
//     if (header) {
//       const text = await page.evaluate(el => el.textContent.trim(), header);
//       if (text === zoneName) {
//         // หาและคลิกปุ่ม Edit ด้วย id
//         const editButton = await row.$('#btn-edit-zone');
//         if (editButton) {
//           await editButton.click();
//           clickedEdit = true;
//           break;
//         }
//       }
//     }
//     if (clickedEdit) break;
//   }
//   // รอ popup edit zone
//   await page.waitForSelector('input[placeholder="Enter zone name"]');
//   // แก้ชื่อ zone
//   const editedZoneName = 'ZoneTest1-Edited';
//   await page.click('input[placeholder="Enter zone name"]', { clickCount: 3 });
//   await page.type('input[placeholder="Enter zone name"]', editedZoneName);
//   await page.click('input[placeholder="Width"]', { clickCount: 3 });
//   await page.type('input[placeholder="Width"]', '20');
//   await page.click('input[placeholder="Length"]', { clickCount: 3 });
//   await page.type('input[placeholder="Length"]', '20');
//   await page.click('input[placeholder="Height"]', { clickCount: 3 });
//   await page.type('input[placeholder="Height"]', '20');
//   await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
//   await page.type('input[placeholder="Enter description (optional)"]', 'Zone edited');
//   // กด Update Zone ด้วย id
//   await page.click('#btn-update-zone');
//   // รอ zone ที่แก้ไขแล้วปรากฏในตาราง
//   await page.waitForFunction(
//     (name) => Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name),
//     {},
//     editedZoneName
//   );

//   // 8. Test Delete Zone
//   const updatedZoneRows = await page.$$('tr');
//   let clickedDelete = false;
//   for (const row of updatedZoneRows) {
//     const header = await row.$('th') || await row.$('td');
//     if (header) {
//       const text = await page.evaluate(el => el.textContent.trim(), header);
//       if (text === editedZoneName) {
//         const buttons = await row.$$('button');
//         for (const btn of buttons) {
//           const btnText = await page.evaluate(el => el.textContent.trim(), btn);
//           if (btnText === 'Delete') {
//             await btn.click();
//             clickedDelete = true;
//             break;
//           }
//         }
//       }
//     }
//     if (clickedDelete) break;
//   }
//   // รอ popup confirm แล้วกดปุ่มยืนยันลบ (สมมุติ id='btn-confirm-delete-zone')
//   await page.waitForSelector('#btn-confirm-delete-zone', { visible: true });
//   await page.click('#btn-confirm-delete-zone');

//   // ปิด browser
//   // await browser.close();
// })();