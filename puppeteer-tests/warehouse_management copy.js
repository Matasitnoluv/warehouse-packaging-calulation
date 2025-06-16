// require('dotenv').config();
// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');

// (async () => {
//   const logLines = [];


//   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       '--disable-features=PasswordManagerEnabled,AutofillServerCommunication,AutofillEnableAccountWalletStorage',
//       '--disable-save-password-bubble',
//       '--disable-popup-blocking',
//       '--no-default-browser-check',
//       '--no-first-run',
//       '--disable-notifications',
//       '--disable-extensions',
//       '--disable-translate'
//     ],
//     defaultViewport: null,
//     ignoreDefaultArgs: ['--enable-automation'],
//   });

//   const page = await browser.newPage();

//   page.on('dialog', async dialog => {
//     console.log('Auto-accept dialog:', dialog.message());
//     await dialog.accept();
//   });

//   // เพิ่ม listener debug navigation
//   page.on('framenavigated', () => {
//     console.log('⚠️ Navigation detected!');
//   });

//   try {
//     // === Page Reload Step ===
//     console.log('🔄 Loading webpage...');
//     const reloadStart = Date.now();
//     await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
//     const reloadTime = Date.now() - reloadStart;
//     logLines.push(`🔄 Page Reload Time: ${reloadTime} ms`);

//     // === Login Step ===
//     console.log('🔑 Starting login process...');
//     const loginStart = Date.now();
//     await page.type('#username', process.env.LOGIN_USERNAME);
//     await page.type('#password', process.env.LOGIN_PASSWORD);
//     await page.click('button[type="submit"]');
//     // Wait for navigation or a post-login element
//     await page.waitForNavigation({ waitUntil: 'networkidle0' });
//     // Optionally, wait for a selector that only appears after login
//     // await page.waitForSelector('.navbar-user, .logout-btn, #btn-add', { timeout: 10000 });
//     const loginTime = Date.now() - loginStart;
//     logLines.push(`⏱️ Login Time: ${loginTime} ms`);

//     // === Navigate to Warehouse Management Page ===
//     console.log('🔄 Navigating to Warehouse Management page...');
//     await page.goto(`${process.env.APP_URL}/mswarehouse`, { waitUntil: 'domcontentloaded' });
//     await page.waitForSelector('#btn-add', { visible: true });

//     // === Create Warehouse ===
//     console.log('🏭 Starting to create new warehouse...');
//     const createStart = Date.now();
//     await page.waitForSelector('#btn-add');
//     await page.click('#btn-add');

//     await page.waitForSelector('input[placeholder="Enter warehouse name"]');
//     const warehouseName = 'Test Warehouse 2';
//     await page.type('input[placeholder="Enter warehouse name"]', warehouseName);
//     await page.type('input[placeholder="Width"]', '100');
//     await page.type('input[placeholder="Height"]', '100');
//     await page.type('input[placeholder="Length"]', '100');
//     await page.type('textarea[placeholder="Enter warehouse description..."]', 'Test Warehouse Description');
//     await page.click('#btn-create');

//     // Click Close to close the dialog after creation
//     const modalButtons = await page.$$('button');
//     for (const btn of modalButtons) {
//       const text = await page.evaluate(el => el.textContent, btn);
//       if (text && text.trim() === 'Cancel') {
//         await btn.click();
//         break;
//       }
//     }

//     // Wait for the new warehouse to appear in the table before editing
//     await page.waitForFunction(
//       (name) => {
//         return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
//       },
//       {},
//       warehouseName
//     );

//     const createTime = Date.now() - createStart;
//     logLines.push(`⏱️ Create Warehouse Time: ${createTime} ms`);

//     // === Click Edit Button ===
//     console.log('✏️ Starting to edit warehouse...');
//     // Take a screenshot before searching for Edit button
//     await page.screenshot({ path: 'before-edit.png' });
//     const rows = await page.$$('tr');
//     let clickedEdit = false;

//     for (const row of rows) {
//       // Try both th and td for the warehouse name
//       const header = await row.$('th') || await row.$('td');
//       if (header) {
//         const text = await page.evaluate(el => el.textContent.trim(), header);
//         if (text === warehouseName) {
//           // Try to find #btn-edit first
//           const editButton = await row.$('#btn-edit');
//           if (editButton) {
//             await editButton.click();
//             clickedEdit = true;
//             break;
//           }
//           // Fallback: find button with text 'Edit'
//           const buttons = await row.$$('button');
//           for (const btn of buttons) {
//             const btnText = await page.evaluate(el => el.textContent.trim(), btn);
//             if (btnText === 'Edit') {
//               await btn.click();
//               clickedEdit = true;
//               break;
//             }
//           }
//         }
//       }
//       if (clickedEdit) break;
//     }

//     if (!clickedEdit) {
//       const msg = '❌ Edit button not found for created warehouse';
//       console.error(msg);
//       logLines.push(msg);
//       throw new Error(msg);
//     }

//     // === Edit Form ===
//     const editStart = Date.now();
//     await page.waitForSelector('input[placeholder="Enter warehouse name"]');
//     await page.click('input[placeholder="Enter warehouse name"]', { clickCount: 3 });
//     const editedWarehouseName = 'Edit Warehouse 2';
//     await page.type('input[placeholder="Enter warehouse name"]', editedWarehouseName);

//     await page.click('input[placeholder="Width"]', { clickCount: 3 });
//     await page.type('input[placeholder="Width"]', '200');

//     await page.click('input[placeholder="Height"]', { clickCount: 3 });
//     await page.type('input[placeholder="Height"]', '200');

//     await page.click('input[placeholder="Length"]', { clickCount: 3 });
//     await page.type('input[placeholder="Length"]', '200');

//     await page.click('textarea[placeholder="Enter warehouse description..."]', { clickCount: 3 });
//     await page.type('textarea[placeholder="Enter warehouse description..."]', 'Edit Warehouse Description');

//     await page.click('#btn-update');
//     const editTime = Date.now() - editStart;
//     logLines.push(`✏️ Edit Warehouse Time: ${editTime} ms`);
//     console.log('✅ Warehouse edited successfully');

//     // Wait for the edited warehouse to appear in the table before deleting
//     await page.waitForFunction(
//       (name) => {
//         return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
//       },
//       {},
//       editedWarehouseName
//     );

//     // === Add Zone ใหม่ (Test Zone 2) ===
//     console.log('🔍 Starting to view warehouse and add new zone...');
//     // 1. กดปุ่ม View
//     const viewRows2 = await page.$$('tr');
//     let clickedView2 = false;
//     for (const row of viewRows2) {
//       const header = await row.$('th') || await row.$('td');
//       if (header) {
//         const text = await page.evaluate(el => el.textContent.trim(), header);
//         if (text === editedWarehouseName) {
//           const buttons = await row.$$('button');
//           for (const btn of buttons) {
//             const btnText = await page.evaluate(el => el.textContent.trim(), btn);
//             if (btnText === 'View') {
//               await btn.click();
//               // รอปุ่ม Add Zone แสดงผลหลังคลิก View
//               await page.waitForSelector('#btn-add-zone', { visible: true, timeout: 10000 });
//               clickedView2 = true;
//               break;
//             }
//           }
//         }
//       }
//       if (clickedView2) break;
//     }
//     if (!clickedView2) throw new Error('ไม่พบปุ่ม View');

//     // 2. รอให้ปุ่ม Add Zone แสดงผล
//     console.log('⏳ Waiting for Add Zone button...');
//     await page.waitForSelector('#btn-add-zone', { visible: true, timeout: 10000 });
//     await page.click('#btn-add-zone');
//     console.log('✅ Clicked Add Zone button');

//     // 3. รอให้ฟอร์ม Add Zone แสดงผล
//     console.log('⏳ Waiting for Add Zone form...');
//     await page.waitForSelector('input[placeholder="Enter zone name"]', { visible: true, timeout: 10000 });

//     // 4. กรอกข้อมูล Zone ใหม่
//     console.log('⏳ Filling new zone details...');
//     await page.type('input[placeholder="Enter zone name"]', 'Test Zone 2');
//     await page.type('input[placeholder="Width"]', '15');
//     await page.type('input[placeholder="Length"]', '15');
//     await page.type('input[placeholder="Height"]', '15');
//     await page.type('input[placeholder="Enter description (optional)"]', 'Zone for test 2');
//     console.log('✅ Filled new zone details');

//     // 5. คลิกปุ่ม Create Zone
//     console.log('⏳ Clicking Create Zone button...');
//     await page.click('#btn-create-zone');
//     console.log('✅ Clicked Create Zone button');

//     // รอ dialog ปิด ([role=dialog] หรือ .rt-DialogContent)
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//       console.log('✅ Dialog closed');
//     } catch (e) {
//       try {
//         await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 });
//         console.log('✅ .rt-DialogContent closed');
//       } catch (e2) {
//         console.log('⚠️ Dialog did not close in time, continue anyway');
//       }
//     }

//     // รอข้อมูล refresh
//     await new Promise(res => setTimeout(res, 1500));

//     // 6. รอให้ Zone ใหม่แสดงในตาราง (ขยาย selector ให้ครอบคลุม h4/div/span/td/th)
//     console.log('⏳ Waiting for new zone to appear...');
//     await page.waitForFunction(
//       () => Array.from(document.querySelectorAll('h4,td,th,div,span')).some(cell => cell.textContent.trim() === 'Test Zone 2'),
//       { timeout: 15000 }
//     );
//     console.log('✅ New zone (Test Zone 2) appeared in table');

//     // 7. ทดสอบ Edit Zone 2 ทันทีหลังสร้าง
//     console.log('✏️ Starting to edit Test Zone 2...');
//     // หา div card ทั้งหมด
//     const cards = await page.$$('div.bg-white');
//     let found = false;
//     for (const card of cards) {
//       const h4 = await card.$('h4.font-semibold');
//       if (h4) {
//         const text = await (await h4.getProperty('textContent')).jsonValue();
//         if (text && text.trim() === 'Test Zone 2') {
//           const editBtn = await card.$('button#btn-edit-zone');
//           if (editBtn) {
//             await editBtn.click();
//             await page.waitForSelector('input[placeholder="Enter zone name"]', { visible: true });
//             found = true;
//             break;
//           }
//         }
//       }
//     }
//     if (!found) throw new Error('ไม่พบปุ่ม Edit Zone สำหรับ Test Zone 2');
//     // กรอกข้อมูลใหม่
//     await page.click('input[placeholder="Enter zone name"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter zone name"]', 'Test Zone 2 Edited');
//     await page.click('input[placeholder="Width"]', { clickCount: 3 });
//     await page.type('input[placeholder="Width"]', '25');
//     await page.click('input[placeholder="Length"]', { clickCount: 3 });
//     await page.type('input[placeholder="Length"]', '25');
//     await page.click('input[placeholder="Height"]', { clickCount: 3 });
//     await page.type('input[placeholder="Height"]', '25');
//     await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter description (optional)"]', 'Zone 2 edited');
//     // คลิกปุ่ม Update Zone
//     await page.click('#btn-update-zone');
//     console.log('✅ Clicked Update Zone button for Test Zone 2');
//     // รอให้ชื่อ zone เปลี่ยนใน UI
//     await page.waitForFunction(
//       () => Array.from(document.querySelectorAll('td,th,div,span,h4')).some(cell => cell.textContent.trim() === 'Test Zone 2 Edited'),
//       { timeout: 15000 }
//     );
//     console.log('✅ Test Zone 2 name updated in UI');

//     // 8. ทดสอบ Add Rack ใน Test Zone 2 Edited
//     console.log('➕ Starting to add rack in Test Zone 2 Edited...');
//     // หา div card ของ Test Zone 2 Edited
//     let foundZone = false;
//     let zoneCard = null;
//     const cards2 = await page.$$('div.bg-white');
//     for (const card of cards2) {
//       const h4 = await card.$('h4.font-semibold');
//       if (h4) {
//         const text = await (await h4.getProperty('textContent')).jsonValue();
//         if (text && text.trim() === 'Test Zone 2 Edited') {
//           zoneCard = card;
//           foundZone = true;
//           break;
//         }
//       }
//     }
//     if (!foundZone) throw new Error('ไม่พบ card ของ Test Zone 2 Edited');
//     // หาและคลิกปุ่ม Add Rack ด้วยข้อความ
//     const allButtons = await zoneCard.$$('button');
//     let addRackBtn = null;
//     for (const btn of allButtons) {
//       const btnText = await (await btn.getProperty('textContent')).jsonValue();
//       if (btnText && btnText.trim().includes('Add Rack')) {
//         addRackBtn = btn;
//         break;
//       }
//     }
//     if (!addRackBtn) throw new Error('ไม่พบปุ่ม Add Rack ใน Test Zone 2 Edited');
//     console.log('🟢 Click Add Rack button');
//     await addRackBtn.click();
//     await page.waitForSelector('input[placeholder="Enter rack name"]', { visible: true });
//     // กรอกข้อมูล rack ใหม่
//     await page.type('input[placeholder="Enter rack name"]', 'Test Rack 1');
//     await page.type('input[placeholder="Width"]', '5');
//     await page.type('input[placeholder="Length"]', '5');
//     await page.type('input[placeholder="Height"]', '5');
//     await page.type('input[placeholder="Enter description (optional)"]', 'Rack for test');
//     // คลิกปุ่ม Create Rack
//     console.log('🟢 Click Create Rack button');
//     await page.click('button.bg-blue-500');
//     // รอ dialog ปิด
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//       console.log('✅ Dialog closed after create rack');
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); console.log('✅ .rt-DialogContent closed after create rack'); } catch (e2) { console.log('⚠️ Dialog did not close in time, continue anyway'); }
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // รอ rack ใหม่ปรากฏใน DOM (หาใน div, span, h4, td, th)
//     console.log('⏳ Waiting for Test Rack 1 to appear...');
//     await page.waitForFunction(
//       () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1'),
//       { timeout: 15000 }
//     );
//     console.log('✅ Test Rack 1 appeared in UI');

//     // 9. ทดสอบ Edit Rack
//     console.log('✏️ Starting to edit Test Rack 1...');
//     // หา card ของ rack (หา div.bg-white ที่มีชื่อ Test Rack 1 เท่านั้น)
//     let rackCard = null;
//     const allDivs = await page.$$('div.bg-white');
//     for (const div of allDivs) {
//       const txt = await (await div.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Rack 1')) {
//         rackCard = div;
//         break;
//       }
//     }
//     if (!rackCard) throw new Error('ไม่พบ div ของ Test Rack 1');
//     // หาและคลิกปุ่ม Edit Rack จาก rackCard เท่านั้น
//     let editRackBtn = await rackCard.$('[data-testid^="edit-rack-"]');
//     if (!editRackBtn) {
//       const editBtns = await rackCard.$$('button');
//       for (const btn of editBtns) {
//         const btnText = await (await btn.getProperty('textContent')).jsonValue();
//         if (btnText && btnText.trim().toLowerCase().includes('edit')) {
//           editRackBtn = btn;
//           break;
//         }
//       }
//     }
//     if (!editRackBtn) {
//       const html = await rackCard.evaluate(node => node.innerHTML);
//       console.error('❌ ไม่พบปุ่ม Edit Rack ใน card ของ Test Rack 1, innerHTML:', html);
//       throw new Error('ไม่พบปุ่ม Edit Rack ใน card ของ Test Rack 1');
//     }
//     await editRackBtn.click();
//     await page.waitForSelector('input[placeholder="Enter rack name"]', { visible: true, timeout: 10000 });
//     // กรอกข้อมูลใหม่
//     await page.click('input[placeholder="Enter rack name"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter rack name"]', 'Test Rack 1 Edited');
//     await page.click('input[placeholder="Width"]', { clickCount: 3 });
//     await page.type('input[placeholder="Width"]', '10');
//     await page.click('input[placeholder="Length"]', { clickCount: 3 });
//     await page.type('input[placeholder="Length"]', '10');
//     await page.click('input[placeholder="Height"]', { clickCount: 3 });
//     await page.type('input[placeholder="Height"]', '10');
//     await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter description (optional)"]', 'Rack edited');
//     // คลิกปุ่ม Update Rack
//     await page.click('button.bg-blue-500');
//     // รอ dialog ปิด
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // รอให้ชื่อ rack เปลี่ยนใน UI
//     await page.waitForFunction(
//       () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1 Edited'),
//       { timeout: 15000 }
//     );
//     console.log('✅ Test Rack 1 Edited name updated in UI');

//     // 10. ทดสอบ Add Shelf ใน Test Rack 1 Edited
//     console.log('➕ Starting to add shelf in Test Rack 1 Edited...');
//     // หา div card ของ Test Rack 1 Edited
//     let foundRack2 = false;
//     let rackCard2 = null;
//     const cards3 = await page.$$('div.bg-white');
//     for (const card of cards3) {
//       const txt = await (await card.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Rack 1 Edited')) {
//         rackCard2 = card;
//         foundRack2 = true;
//         break;
//       }
//     }
//     if (!foundRack2) throw new Error('ไม่พบ card ของ Test Rack 1 Edited');

//     // คลิกที่ rack card เพื่อขยาย
//     await rackCard2.click();
//     await new Promise(res => setTimeout(res, 1000));

//     // หาและคลิกปุ่ม Add Shelf
//     const addShelfBtn = await rackCard2.$('button.bg-green-500');
//     if (!addShelfBtn) {
//       // ถ้าไม่พบปุ่ม Add Shelf ให้ลองหาใหม่หลังจากขยาย rack
//       const allButtons = await page.$$('button');
//       for (const btn of allButtons) {
//         const btnText = await (await btn.getProperty('textContent')).jsonValue();
//         if (btnText && btnText.trim().includes('Add Shelf')) {
//           await btn.click();
//           break;
//         }
//       }
//     } else {
//       await addShelfBtn.click();
//     }

//     // รอให้ฟอร์ม Add Shelf แสดงผล
//     await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true, timeout: 10000 });
    
//     // กรอกข้อมูล shelf ใหม่
//     await page.type('input[placeholder="Enter shelf name"]', 'Test Shelf 1');
//     await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '1');
//     await page.type('input[placeholder="Width"]', '2');
//     await page.type('input[placeholder="Length"]', '2');
//     await page.type('input[placeholder="Height"]', '2');
//     await page.type('input[placeholder="Enter description (optional)"]', 'Shelf for test');

//     // คลิกปุ่ม Create Shelf
//     console.log('🟢 Click Create Shelf button');
//     const createShelfBtn = await page.$('button.bg-green-500');
//     if (!createShelfBtn) throw new Error('ไม่พบปุ่ม Create Shelf');
//     await createShelfBtn.click();

//     // รอ dialog ปิด
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//       console.log('✅ Dialog closed after create shelf');
//     } catch (e) {
//       try { 
//         await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); 
//         console.log('✅ .rt-DialogContent closed after create shelf'); 
//       } catch (e2) { 
//         console.log('⚠️ Dialog did not close in time, continue anyway'); 
//       }
//     }

//     // รอข้อมูล refresh
//     await new Promise(res => setTimeout(res, 2000));

//     // ตรวจสอบว่า shelf ถูกสร้างสำเร็จ
//     const shelfCreated = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1');
//     });

//     if (!shelfCreated) {
//       throw new Error('ไม่พบ Test Shelf 1 หลังการสร้าง');
//     }

//     console.log('✅ Test Shelf 1 appeared in UI');

//     // 11. ทดสอบ Edit Shelf
//     console.log('✏️ Starting to edit Test Shelf 1...');
//     // หา card ของ shelf (หา div ที่มีชื่อ Test Shelf 1)
//     let foundShelf = false;
//     let shelfCard = null;
//     const allDivs2 = await page.$$('div');
//     for (const div of allDivs2) {
//       const txt = await (await div.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Shelf 1')) {
//         shelfCard = div;
//         foundShelf = true;
//         break;
//       }
//     }
//     if (!foundShelf) throw new Error('ไม่พบ div ของ Test Shelf 1');
//     // หาและคลิกปุ่ม Edit (soft button)
//     const editShelfBtn = await shelfCard.$('button[variant="soft"]');
//     if (!editShelfBtn) throw new Error('ไม่พบปุ่ม Edit Shelf ใน card ของ Test Shelf 1');
//     await editShelfBtn.click();
//     await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true });
//     // กรอกข้อมูลใหม่
//     await page.click('input[placeholder="Enter shelf name"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter shelf name"]', 'Test Shelf 1 Edited');
//     await page.click('input[placeholder="Shelf level (1, 2, 3, etc.)"]', { clickCount: 3 });
//     await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '2');
//     await page.click('input[placeholder="Width"]', { clickCount: 3 });
//     await page.type('input[placeholder="Width"]', '4');
//     await page.click('input[placeholder="Length"]', { clickCount: 3 });
//     await page.type('input[placeholder="Length"]', '4');
//     await page.click('input[placeholder="Height"]', { clickCount: 3 });
//     await page.type('input[placeholder="Height"]', '4');
//     await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
//     await page.type('input[placeholder="Enter description (optional)"]', 'Shelf edited');
//     // คลิกปุ่ม Update Shelf
//     await page.click('button.bg-blue-500');
//     // รอ dialog ปิด
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // รอให้ชื่อ shelf เปลี่ยนใน UI
//     await page.waitForFunction(
//       () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1 Edited'),
//       { timeout: 15000 }
//     );
//     console.log('✅ Test Shelf 1 Edited name updated in UI');

//     // 12. ทดสอบ Delete Shelf
//     console.log('🗑️ Starting to delete Test Shelf 1 Edited...');
//     let foundShelf2 = false;
//     let shelfCard2 = null;
//     const allDivs3 = await page.$$('div.bg-white');
//     for (const div of allDivs3) {
//       const txt = await (await div.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Shelf 1 Edited')) {
//         shelfCard2 = div;
//         foundShelf2 = true;
//         break;
//       }
//     }
//     if (!foundShelf2) throw new Error('ไม่พบ div ของ Test Shelf 1 Edited');
//     const deleteShelfBtn = await shelfCard2.$('button.bg-red-500');
//     if (!deleteShelfBtn) throw new Error('ไม่พบปุ่ม Delete Shelf ใน card ของ Test Shelf 1 Edited');
//     await deleteShelfBtn.click();
//     await page.waitForSelector('#btn-confirm-delete', { visible: true });
//     await page.click('#btn-confirm-delete');
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // ตรวจสอบว่า shelf ถูกลบแล้วจริงๆ
//     const shelfExists = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1 Edited');
//     });
//     if (shelfExists) {
//       throw new Error('Shelf ยังคงอยู่ในระบบหลังการลบ');
//     }
//     console.log('✅ Test Shelf 1 Edited deleted successfully');

//     // 13. ทดสอบ Delete Rack
//     console.log('🗑️ Starting to delete Test Rack 1 Edited...');
//     let foundRack3 = false;
//     let rackCard3 = null;
//     const allDivs4 = await page.$$('div.bg-white');
//     for (const div of allDivs4) {
//       const txt = await (await div.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Rack 1 Edited')) {
//         rackCard3 = div;
//         foundRack3 = true;
//         break;
//       }
//     }
//     if (!foundRack3) throw new Error('ไม่พบ div ของ Test Rack 1 Edited');
//     const deleteRackBtn = await rackCard3.$('button.bg-red-500');
//     if (!deleteRackBtn) throw new Error('ไม่พบปุ่ม Delete Rack ใน card ของ Test Rack 1 Edited');
//     await deleteRackBtn.click();
//     await page.waitForSelector('#btn-confirm-delete', { visible: true });
//     await page.click('#btn-confirm-delete');
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // ตรวจสอบว่า rack ถูกลบแล้วจริงๆ
//     const rackExists = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1 Edited');
//     });
//     if (rackExists) {
//       throw new Error('Rack ยังคงอยู่ในระบบหลังการลบ');
//     }
//     console.log('✅ Test Rack 1 Edited deleted successfully');

//     // 14. ทดสอบ Delete Zone
//     console.log('🗑️ Starting to delete Test Zone 2 Edited...');
//     let foundZone2 = false;
//     let zoneCard2 = null;
//     const allDivs5 = await page.$$('div.bg-white');
//     for (const div of allDivs5) {
//       const txt = await (await div.getProperty('textContent')).jsonValue();
//       if (txt && txt.trim().includes('Test Zone 2 Edited')) {
//         zoneCard2 = div;
//         foundZone2 = true;
//         break;
//       }
//     }
//     if (!foundZone2) throw new Error('ไม่พบ div ของ Test Zone 2 Edited');
//     const deleteZoneBtn = await zoneCard2.$('button.bg-red-500');
//     if (!deleteZoneBtn) throw new Error('ไม่พบปุ่ม Delete Zone ใน card ของ Test Zone 2 Edited');
//     await deleteZoneBtn.click();
//     await page.waitForSelector('#btn-confirm-delete', { visible: true });
//     await page.click('#btn-confirm-delete');
//     try {
//       await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
//     } catch (e) {
//       try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
//     }
//     await new Promise(res => setTimeout(res, 1000));
//     // ตรวจสอบว่า zone ถูกลบแล้วจริงๆ
//     const zoneExists = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Zone 2 Edited');
//     });
//     if (zoneExists) {
//       throw new Error('Zone ยังคงอยู่ในระบบหลังการลบ');
//     }
//     console.log('✅ Test Zone 2 Edited deleted successfully');

//     // === Delete Warehouse ===
//     console.log('🗑️ Starting to delete warehouse...');
//     const deleteStart = Date.now();
    
//     // กลับไปที่หน้า warehouse list
//     await page.goto(`${process.env.APP_URL}/mswarehouse`, { waitUntil: 'networkidle0' });
    
//     // Use the edited name for delete
//     await page.waitForFunction(
//       (name) => {
//         return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
//       },
//       {},
//       editedWarehouseName
//     );

//     const updatedRows = await page.$$('tr');
//     let clickedDelete = false;

//     for (const row of updatedRows) {
//       const header = await row.$('th') || await row.$('td');
//       if (header) {
//         const text = await page.evaluate(el => el.textContent.trim(), header);
//         if (text === editedWarehouseName) {
//           // Find button with text 'Delete'
//           const buttons = await row.$$('button');
//           for (const btn of buttons) {
//             const btnText = await page.evaluate(el => el.textContent.trim(), btn);
//             if (btnText === 'Delete') {
//               await btn.click();
//               clickedDelete = true;
//               break;
//             }
//           }
//         }
//       }
//       if (clickedDelete) break;
//     }

//     if (!clickedDelete) {
//       const msg = `❌ Delete button not found for warehouse ${editedWarehouseName}`;
//       console.error(msg);
//       logLines.push(msg);
//       throw new Error(msg);
//     }

//     // Wait for and click the confirm delete button in the popup
//     await page.waitForSelector('#btn-confirm-delete', { visible: true });
//     await page.click('#btn-confirm-delete');

//     // ตรวจสอบว่า warehouse ถูกลบแล้วจริงๆ
//     const warehouseExists = await page.evaluate((name) => {
//       return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
//     }, editedWarehouseName);
    
//     if (warehouseExists) {
//       throw new Error('Warehouse ยังคงอยู่ในระบบหลังการลบ');
//     }

//     const deleteTime = Date.now() - deleteStart;
//     logLines.push(`🗑️ Delete Warehouse Time: ${deleteTime} ms`);
//     console.log('✅ Warehouse deleted successfully');

//   } catch (err) {
//     const errorMsg = `❌ Error occurred: ${err.message}`;
//     console.error(errorMsg);
//     logLines.push(errorMsg);
//     try {
//       await page.screenshot({ path: 'error-screenshot.png' });
//     } catch (screenshotError) {
//       console.error('Failed to save screenshot:', screenshotError.message);
//     }
//   } finally {
//     const logPath = path.join(__dirname, 'warehouse-log.txt');
//     fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
//     console.log(`📄 Log saved at: ${logPath}`);
//     await browser.close();
//   }
// })(); 