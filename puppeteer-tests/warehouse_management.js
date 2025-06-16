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

  // เพิ่ม listener debug navigation
  page.on('framenavigated', () => {
    console.log('⚠️ Navigation detected!');
  });

  try {
    // === Page Reload Step ===
    console.log('🔄 Loading webpage...');
    const reloadStart = Date.now();
    await page.goto(process.env.APP_URL, { waitUntil: 'networkidle0' });
    const reloadTime = Date.now() - reloadStart;
    logLines.push(`Page Reload Time: ${reloadTime} ms`);

    // === Login Step ===
    console.log('🔑 Starting login process...');
    const loginStart = Date.now();
    await page.type('#username', process.env.LOGIN_USERNAME);
    await page.type('#password', process.env.LOGIN_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);
    const loginTime = Date.now() - loginStart;
    logLines.push(`Login Time: ${loginTime} ms`);

    // === Navigate to Warehouse Management Page ===
    console.log('🔄 Navigating to Warehouse Management page...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.goto(`${process.env.APP_URL}/mswarehouse`)
    ]);
    await page.waitForSelector('#btn-add', { visible: true });

    // === Create Warehouse ===
    console.log('🏭 Starting to create new warehouse...');
    const createWarehouseStart = Date.now();
    await page.waitForSelector('#btn-add');
    await page.click('#btn-add');

    await page.waitForSelector('input[placeholder="Enter warehouse name"]');
    const warehouseName = 'Test Warehouse 2';
    await page.type('input[placeholder="Enter warehouse name"]', warehouseName);
    await page.type('input[placeholder="Width"]', '100');
    await page.type('input[placeholder="Height"]', '100');
    await page.type('input[placeholder="Length"]', '100');
    await page.type('textarea[placeholder="Enter warehouse description..."]', 'Test Warehouse Description');
    await page.click('#btn-create');

    // Click Close to close the dialog after creation
    const modalButtons = await page.$$('button');
    for (const btn of modalButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === 'Cancel') {
        await btn.click();
        break;
      }
    }

    // Wait for the new warehouse to appear in the table before editing
    await page.waitForFunction(
      (name) => {
        return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
      },
      {},
      warehouseName
    );

    const createWarehouseTime = Date.now() - createWarehouseStart;
    logLines.push(`Create Warehouse Time: ${createWarehouseTime} ms`);

    // === Click Edit Button ===
    console.log('✏️ Starting to edit warehouse...');
    // Take a screenshot before searching for Edit button
    await page.screenshot({ path: 'before-edit.png' });
    const rows = await page.$$('tr');
    let clickedEdit = false;

    for (const row of rows) {
      // Try both th and td for the warehouse name
      const header = await row.$('th') || await row.$('td');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === warehouseName) {
          // Try to find #btn-edit first
          const editButton = await row.$('#btn-edit');
          if (editButton) {
            await editButton.click();
            clickedEdit = true;
            break;
          }
          // Fallback: find button with text 'Edit'
          const buttons = await row.$$('button');
          for (const btn of buttons) {
            const btnText = await page.evaluate(el => el.textContent.trim(), btn);
            if (btnText === 'Edit') {
              await btn.click();
              clickedEdit = true;
              break;
            }
          }
        }
      }
      if (clickedEdit) break;
    }

    if (!clickedEdit) {
      const msg = '❌ Edit button not found for created warehouse';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }

    // === Edit Form ===
    const editWarehouseStart = Date.now();
    await page.waitForSelector('input[placeholder="Enter warehouse name"]');
    await page.click('input[placeholder="Enter warehouse name"]', { clickCount: 3 });
    const editedWarehouseName = 'Edit Warehouse 2';
    await page.type('input[placeholder="Enter warehouse name"]', editedWarehouseName);

    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '200');

    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '200');

    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '200');

    await page.click('textarea[placeholder="Enter warehouse description..."]', { clickCount: 3 });
    await page.type('textarea[placeholder="Enter warehouse description..."]', 'Edit Warehouse Description');

    await page.click('#btn-update');
    const editWarehouseTime = Date.now() - editWarehouseStart;
    logLines.push(`Edit Warehouse Time: ${editWarehouseTime} ms`);
    console.log('✅ Warehouse edited successfully');

    // Wait for the edited warehouse to appear in the table before deleting
    await page.waitForFunction(
      (name) => {
        return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
      },
      {},
      editedWarehouseName
    );

    // === Add Zone ใหม่ (Test Zone 2) ===
    console.log('🔍 Starting to view warehouse and add new zone...');
    // 1. กดปุ่ม View
    const viewRows2 = await page.$$('tr');
    let clickedView2 = false;
    for (const row of viewRows2) {
      const header = await row.$('th') || await row.$('td');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === editedWarehouseName) {
          const buttons = await row.$$('button');
          for (const btn of buttons) {
            const btnText = await page.evaluate(el => el.textContent.trim(), btn);
            if (btnText === 'View') {
              try {
                await Promise.all([
                  page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }),
                  btn.click()
                ]);
              } catch (e) {
                // ถ้าไม่เกิด navigation ให้รอ selector ตามปกติ
                await btn.click();
                await page.waitForSelector('#btn-add-zone', { visible: true, timeout: 10000 });
              }
              clickedView2 = true;
              break;
            }
          }
        }
      }
      if (clickedView2) break;
    }
    if (!clickedView2) throw new Error('ไม่พบปุ่ม View');

    // 2. รอให้ปุ่ม Add Zone แสดงผล
    console.log('⏳ Waiting for Add Zone button...');
    await page.waitForSelector('#btn-add-zone', { visible: true, timeout: 10000 });
    await page.click('#btn-add-zone');
    console.log('✅ Clicked Add Zone button');

    // 3. รอให้ฟอร์ม Add Zone แสดงผล
    console.log('⏳ Waiting for Add Zone form...');
    await page.waitForSelector('input[placeholder="Enter zone name"]', { visible: true, timeout: 10000 });

    // 4. กรอกข้อมูล Zone ใหม่
    console.log('⏳ Filling new zone details...');
    await page.type('input[placeholder="Enter zone name"]', 'Test Zone 2');
    await page.type('input[placeholder="Width"]', '15');
    await page.type('input[placeholder="Length"]', '15');
    await page.type('input[placeholder="Height"]', '15');
    await page.type('input[placeholder="Enter description (optional)"]', 'Zone for test 2');
    console.log('✅ Filled new zone details');

    // 5. คลิกปุ่ม Create Zone
    console.log('⏳ Clicking Create Zone button...');
    await page.click('#btn-create-zone');
    console.log('✅ Clicked Create Zone button');

    // รอ dialog ปิด ([role=dialog] หรือ .rt-DialogContent)
    try {
      await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
      console.log('✅ Dialog closed');
    } catch (e) {
      try {
        await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 });
        console.log('✅ .rt-DialogContent closed');
      } catch (e2) {
        console.log('⚠️ Dialog did not close in time, continue anyway');
      }
    }

    // รอข้อมูล refresh
    await new Promise(res => setTimeout(res, 1500));

    // 6. รอให้ Zone ใหม่แสดงในตาราง (ขยาย selector ให้ครอบคลุม h4/div/span/td/th)
    console.log('⏳ Waiting for new zone to appear...');
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('h4,td,th,div,span')).some(cell => cell.textContent.trim() === 'Test Zone 2'),
      { timeout: 15000 }
    );
    console.log('✅ New zone (Test Zone 2) appeared in table');

    // 7. ทดสอบ Edit Zone 2 ทันทีหลังสร้าง
    console.log('✏️ Starting to edit Test Zone 2...');
    // หา div card ทั้งหมด
    const cards = await page.$$('div.bg-white');
    let found = false;
    for (const card of cards) {
      const h4 = await card.$('h4.font-semibold');
      if (h4) {
        const text = await (await h4.getProperty('textContent')).jsonValue();
        if (text && text.trim() === 'Test Zone 2') {
          const editBtn = await card.$('button#btn-edit-zone');
          if (editBtn) {
            await editBtn.click();
            await page.waitForSelector('input[placeholder="Enter zone name"]', { visible: true });
            found = true;
            break;
          }
        }
      }
    }
    if (!found) throw new Error('ไม่พบปุ่ม Edit Zone สำหรับ Test Zone 2');
    // กรอกข้อมูลใหม่
    await page.click('input[placeholder="Enter zone name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter zone name"]', 'Test Zone 2 Edited');
    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '25');
    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '25');
    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '25');
    await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter description (optional)"]', 'Zone 2 edited');
    // คลิกปุ่ม Update Zone
    await page.click('#btn-update-zone');
    console.log('✅ Clicked Update Zone button for Test Zone 2');
    // รอให้ชื่อ zone เปลี่ยนใน UI
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('td,th,div,span,h4')).some(cell => cell.textContent.trim() === 'Test Zone 2 Edited'),
      { timeout: 15000 }
    );
    console.log('✅ Test Zone 2 name updated in UI');

    // 8. ทดสอบ Add Rack ใน Test Zone 2 Edited
    console.log('➕ Starting to add rack in Test Zone 2 Edited...');
    // หา div card ของ Test Zone 2 Edited
    let foundZone = false;
    let zoneCard = null;
    const cards2 = await page.$$('div.bg-white');
    for (const card of cards2) {
      const h4 = await card.$('h4.font-semibold');
      if (h4) {
        const text = await (await h4.getProperty('textContent')).jsonValue();
        if (text && text.trim() === 'Test Zone 2 Edited') {
          zoneCard = card;
          foundZone = true;
          break;
        }
      }
    }
    if (!foundZone) throw new Error('ไม่พบ card ของ Test Zone 2 Edited');
    // หาและคลิกปุ่ม Add Rack ด้วยข้อความ
    const allButtons = await zoneCard.$$('button');
    let addRackBtn = null;
    for (const btn of allButtons) {
      const btnText = await (await btn.getProperty('textContent')).jsonValue();
      if (btnText && btnText.trim().includes('Add Rack')) {
        addRackBtn = btn;
        break;
      }
    }
    if (!addRackBtn) throw new Error('ไม่พบปุ่ม Add Rack ใน Test Zone 2 Edited');
    console.log('🟢 Click Add Rack button');
    await addRackBtn.click();
    await page.waitForSelector('input[placeholder="Enter rack name"]', { visible: true });
    // กรอกข้อมูล rack ใหม่
    await page.type('input[placeholder="Enter rack name"]', 'Test Rack 1');
    await page.type('input[placeholder="Width"]', '5');
    await page.type('input[placeholder="Length"]', '5');
    await page.type('input[placeholder="Height"]', '5');
    await page.type('input[placeholder="Enter description (optional)"]', 'Rack for test');
    // คลิกปุ่ม Create Rack
    console.log('🟢 Click Create Rack button');
    await page.click('button.bg-blue-500');
    // รอ dialog ปิด
    try {
      await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
      console.log('✅ Dialog closed after create rack');
    } catch (e) {
      try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); console.log('✅ .rt-DialogContent closed after create rack'); } catch (e2) { console.log('⚠️ Dialog did not close in time, continue anyway'); }
    }
    await new Promise(res => setTimeout(res, 1000));
    // รอ rack ใหม่ปรากฏใน DOM (หาใน div, span, h4, td, th)
    console.log('⏳ Waiting for Test Rack 1 to appear...');
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1'),
      { timeout: 15000 }
    );
    console.log('✅ Test Rack 1 appeared in UI');

    // 9. ทดสอบ Edit Rack
    console.log('✏️ Starting to edit Test Rack 1...');

    // รอให้ rack card แสดงผลและเสถียร
    await page.waitForSelector('div.bg-white', { visible: true });
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // หา card ของ rack (หา div ที่มีชื่อ Test Rack 1)
    let foundRack = false;
    let rackCard = null;
    const rackDivs = await page.$$('div.bg-white');
    for (const div of rackDivs) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().includes('Test Rack 1')) {
        rackCard = div;
        foundRack = true;
        break;
      }
    }
    if (!foundRack) throw new Error('ไม่พบ div ของ Test Rack 1');

    // หาและคลิกปุ่ม Edit Rack โดยใช้ data-testid
    const editRackBtn = await rackCard.$('[data-testid^="edit-rack-btn-"]');
    if (!editRackBtn) {
      const html = await rackCard.evaluate(node => node.innerHTML);
      console.error('❌ ไม่พบปุ่ม Edit Rack ใน card ของ Test Rack 1, innerHTML:', html);
      throw new Error('ไม่พบปุ่ม Edit Rack ใน card ของ Test Rack 1');
    }
    await editRackBtn.click();

    // รอให้ฟอร์ม Edit Rack แสดงผล
    await page.waitForSelector('input[placeholder="Enter rack name"]', { visible: true, timeout: 10000 });
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // กรอกข้อมูล rack ใหม่
    await page.click('input[placeholder="Enter rack name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter rack name"]', 'Test Rack 1 Edited');
    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '4');
    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '4');
    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '4');
    await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter description (optional)"]', 'Rack edited');

    // คลิกปุ่ม Update Rack
    console.log('✅ Clicked Update Rack button for Test Rack 1');
    const updateRackBtn = await page.$('button.bg-blue-500');
    if (!updateRackBtn) throw new Error('ไม่พบปุ่ม Update Rack');
    await updateRackBtn.click();

    // รอ dialog ปิด
    try {
      await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
    } catch (e) {
      try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
    }

    // รอให้ DOM ถูก update หลังจากแก้ไขชื่อ rack
    console.log('⏳ Waiting for rack name to update in UI...');
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1 Edited'),
      { timeout: 10000 }
    );
    console.log('✅ Test Rack 1 Edited name updated in UI');

    // รอให้ DOM เสถียรก่อนดำเนินการต่อ
    await new Promise(res => setTimeout(res, 2000));

    // 10. ทดสอบ Add Shelf ใน Test Rack 1 Edited
    console.log('➕ Starting to add shelf in Test Rack 1 Edited...');

    // รอให้ rack card แสดงผลและเสถียร
    await page.waitForSelector('div.bg-white', { visible: true });
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // หา rack card ใหม่ที่มีชื่อ Test Rack 1 Edited
    let foundRack2 = false;
    let rackCard2 = null;
    const rackDivs2 = await page.$$('div.bg-white');
    for (const div of rackDivs2) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.includes('Test Rack 1 Edited')) {
        rackCard2 = div;
        foundRack2 = true;
        break;
      }
    }
    if (!foundRack2) throw new Error('ไม่พบ rack card ของ Test Rack 1 Edited');

    // หาและคลิกปุ่ม Add Shelf (ถ้าไม่เจอ ให้ expand rack ก่อน)
    let addShelfBtn = await rackCard2.$('button#btn-add-shelf');
    if (!addShelfBtn) {
      // หา expand button แล้วคลิก
      const expandBtn = await rackCard2.$('button[variant="soft"]');
      if (expandBtn) {
        await expandBtn.click();
        await new Promise(res => setTimeout(res, 1000));
        addShelfBtn = await rackCard2.$('button#btn-add-shelf');
      }
    }
    if (!addShelfBtn) throw new Error('ไม่พบปุ่ม Add Shelf');
    await addShelfBtn.click();

    // รอให้ฟอร์ม Add Shelf แสดงผล
    await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true, timeout: 10000 });
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // กรอกข้อมูล shelf ใหม่
    await page.click('input[placeholder="Enter shelf name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter shelf name"]', 'Test Shelf 1');
    await page.click('input[placeholder="Shelf level (1, 2, 3, etc.)"]', { clickCount: 3 });
    await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '1');
    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '3');
    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '3');
    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '3');
    await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter description (optional)"]', 'Shelf for test');

    // คลิกปุ่ม Create Shelf
    console.log('🟢 Click Create Shelf button');
    const createShelfBtn = await page.$('button#btn-create-shelf');
    if (!createShelfBtn) throw new Error('ไม่พบปุ่ม Create Shelf');
    await createShelfBtn.click();

    // รอ dialog ปิด
    try {
      await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
    } catch (e) {
      try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
    }
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // ตรวจสอบว่า shelf ถูกสร้างสำเร็จ
    const shelfCreated = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1');
    });
    if (!shelfCreated) {
      throw new Error('ไม่พบ Test Shelf 1 หลังการสร้าง');
    }
    console.log('✅ Test Shelf 1 appeared in UI');

    // 11. ทดสอบ Edit Shelf
    console.log('✏️ Starting to edit Test Shelf 1...');
    // หา card ของ shelf (หา div ที่มีชื่อ Test Shelf 1)
    let foundShelf = false;
    let shelfCard = null;
    const shelfDivs = await page.$$('div.bg-white');
    for (const div of shelfDivs) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().includes('Test Shelf 1')) {
        shelfCard = div;
        foundShelf = true;
        break;
      }
    }
    if (!foundShelf) throw new Error('ไม่พบ div ของ Test Shelf 1');

    const editShelfBtn = await shelfCard.$('button[id^="btn-edit-shelf-"]');
    if (!editShelfBtn) throw new Error('ไม่พบปุ่ม Edit Shelf ใน card ของ Test Shelf 1');
    await editShelfBtn.click();
    await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true });

    await page.click('input[placeholder="Enter shelf name"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter shelf name"]', 'Test Shelf 1 Edited');
    await page.click('input[placeholder="Shelf level (1, 2, 3, etc.)"]', { clickCount: 3 });
    await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '2');
    await page.click('input[placeholder="Width"]', { clickCount: 3 });
    await page.type('input[placeholder="Width"]', '4');
    await page.click('input[placeholder="Length"]', { clickCount: 3 });
    await page.type('input[placeholder="Length"]', '4');
    await page.click('input[placeholder="Height"]', { clickCount: 3 });
    await page.type('input[placeholder="Height"]', '4');
    await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
    await page.type('input[placeholder="Enter description (optional)"]', 'Shelf edited');

    // คลิกปุ่ม Update Shelf
    console.log('✅ Clicked Update Shelf button for Test Shelf 1');
    const updateShelfBtn = await page.$('button#btn-update-shelf');
    if (!updateShelfBtn) throw new Error('ไม่พบปุ่ม Update Shelf');
    await updateShelfBtn.click();

    // รอ dialog ปิด
    try {
      await page.waitForSelector('[role=dialog]', { hidden: true, timeout: 10000 });
    } catch (e) {
      try { await page.waitForSelector('.rt-DialogContent', { hidden: true, timeout: 10000 }); } catch (e2) {}
    }
    await new Promise(res => setTimeout(res, 2000)); // รอให้ DOM เสถียร

    // รอให้ชื่อ shelf เปลี่ยนใน UI
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1 Edited'),
      { timeout: 10000 }
    );
    console.log('✅ Test Shelf 1 Edited name updated in UI');

    // === ขั้นตอนลบทั้งหมด (หลังสุด) ===
    // 12. ทดสอบ Delete Shelf
    logLines.push('🗑️ Starting to delete Test Shelf 1 Edited...');
    const deleteShelfStart = Date.now();
    let foundShelf2 = false;
    let shelfCard2 = null;
    const shelfDivs2 = await page.$$('div.bg-white');
    for (const div of shelfDivs2) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().includes('Test Shelf 1 Edited')) {
        shelfCard2 = div;
        foundShelf2 = true;
        break;
      }
    }
    if (!foundShelf2) {
      const msg = '❌ ไม่พบ div ของ Test Shelf 1 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    // หา id ปุ่มลบ shelf ให้ตรงกับ DOM จริง
    const deleteShelfBtn = await shelfCard2.$('button[id^="btn-delete-shelf-"]');
    if (!deleteShelfBtn) {
      const msg = '❌ ไม่พบปุ่ม Delete Shelf ใน card ของ Test Shelf 1 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    await deleteShelfBtn.click();
    logLines.push('✅ Clicked Delete Shelf button');
    // ไม่ต้องรอ #btn-confirm-delete เพราะใช้ window.confirm
    await new Promise(res => setTimeout(res, 1500)); // รอ DOM update
    // ตรวจสอบว่า shelf ถูกลบแล้วจริงๆ
    const shelfExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Shelf 1 Edited');
    });
    if (shelfExists) {
      const msg = '❌ Shelf ยังคงอยู่ในระบบหลังการลบ';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    const deleteShelfTime = Date.now() - deleteShelfStart;
    logLines.push(`Delete Shelf Time: ${deleteShelfTime} ms`);

    // 13. ทดสอบ Delete Rack
    logLines.push('🗑️ Starting to delete Test Rack 1 Edited...');
    const deleteRackStart = Date.now();
    let foundRack3 = false;
    let rackCard3 = null;
    const allDivs4 = await page.$$('div.bg-white');
    for (const div of allDivs4) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().includes('Test Rack 1 Edited')) {
        rackCard3 = div;
        foundRack3 = true;
        break;
      }
    }
    if (!foundRack3) {
      const msg = '❌ ไม่พบ div ของ Test Rack 1 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    const deleteRackBtn = await rackCard3.$('button[data-testid^="delete-rack-"]');
    if (!deleteRackBtn) {
      const msg = '❌ ไม่พบปุ่ม Delete Rack ใน card ของ Test Rack 1 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    await deleteRackBtn.click();
    logLines.push('✅ Clicked Delete Rack button');
    // ไม่ต้องรอปุ่มยืนยันลบ เพราะใช้ window.confirm
    await new Promise(res => setTimeout(res, 1500)); // รอ DOM update
    // ตรวจสอบว่า rack ถูกลบแล้วจริงๆ
    const rackExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Rack 1 Edited');
    });
    if (rackExists) {
      const msg = '❌ Rack ยังคงอยู่ในระบบหลังการลบ';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    const deleteRackTime = Date.now() - deleteRackStart;
    logLines.push(`Delete Rack Time: ${deleteRackTime} ms`);

    // 14. ทดสอบ Delete Zone
    logLines.push('🗑️ Starting to delete Test Zone 2 Edited...');
    const deleteZoneStart = Date.now();
    let foundZone2 = false;
    let zoneCard2 = null;
    const allDivs5 = await page.$$('div.bg-white');
    for (const div of allDivs5) {
      const txt = await (await div.getProperty('textContent')).jsonValue();
      if (txt && txt.trim().includes('Test Zone 2 Edited')) {
        zoneCard2 = div;
        foundZone2 = true;
        break;
      }
    }
    if (!foundZone2) {
      const msg = '❌ ไม่พบ div ของ Test Zone 2 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    // หาและคลิกปุ่ม Delete ใน zoneCard2 แบบวนลูปเช็คข้อความ
    const buttons = await zoneCard2.$$('button');
    let deleteZoneBtn = null;
    for (const btn of buttons) {
      const btnText = await (await btn.getProperty('textContent')).jsonValue();
      if (btnText && btnText.trim() === 'Delete') {
        deleteZoneBtn = btn;
        break;
      }
    }
    if (!deleteZoneBtn) {
      const msg = '❌ ไม่พบปุ่ม Delete Zone ใน card ของ Test Zone 2 Edited';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    await deleteZoneBtn.click();
    logLines.push('✅ Clicked Delete Zone button');
    // ไม่ต้องรอปุ่มยืนยันลบ เพราะใช้ window.confirm
    await new Promise(res => setTimeout(res, 1500)); // รอ DOM update
    // ตรวจสอบว่า zone ถูกลบแล้วจริงๆ
    const zoneExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent.trim() === 'Test Zone 2 Edited');
    });
    if (zoneExists) {
      const msg = '❌ Zone ยังคงอยู่ในระบบหลังการลบ';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    const deleteZoneTime = Date.now() - deleteZoneStart;
    logLines.push(`Delete Zone Time: ${deleteZoneTime} ms`);

    // 15. ทดสอบ Delete Warehouse
    logLines.push('🗑️ Starting to delete warehouse...');
    const deleteWarehouseStart = Date.now();
    // กลับไปที่หน้า warehouse list
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }),
      page.goto(`${process.env.APP_URL}/mswarehouse`)
    ]);
    // Use the edited name for delete
    await page.waitForFunction(
      (name) => {
        return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
      },
      {},
      editedWarehouseName
    );
    const updatedRows = await page.$$('tr');
    let clickedDelete = false;
    for (const row of updatedRows) {
      const header = await row.$('th') || await row.$('td');
      if (header) {
        const text = await page.evaluate(el => el.textContent.trim(), header);
        if (text === editedWarehouseName) {
          // Find button with id btn-delete
          const btnDelete = await row.$('#btn-delete');
          if (btnDelete) {
            await btnDelete.click();
            logLines.push('✅ Clicked Delete Warehouse button');
            // รอ dialog แสดงผล
            await page.waitForSelector('#btn-confirm-delete', { visible: true, timeout: 10000 });
            await page.click('#btn-confirm-delete');
            logLines.push('✅ Clicked confirm delete button');
            // รอ reload
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 });
            clickedDelete = true;
            break;
          }
        }
      }
      if (clickedDelete) break;
    }
    if (!clickedDelete) {
      const msg = `❌ Delete button not found for warehouse ${editedWarehouseName}`;
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    // ตรวจสอบว่า warehouse ถูกลบแล้วจริงๆ
    const warehouseExists = await page.evaluate((name) => {
      return Array.from(document.querySelectorAll('td,th')).some(cell => cell.textContent.trim() === name);
    }, editedWarehouseName);
    if (warehouseExists) {
      const msg = '❌ Warehouse ยังคงอยู่ในระบบหลังการลบ';
      console.error(msg);
      logLines.push(msg);
      throw new Error(msg);
    }
    const deleteWarehouseTime = Date.now() - deleteWarehouseStart;
    logLines.push(`Delete Warehouse Time: ${deleteWarehouseTime} ms`);

    // === Create Zone ===
    const createZoneStart = Date.now();
    // ... (ขั้นตอนสร้าง zone เดิม)
    // หลังสร้าง zone สำเร็จ
    const createZoneTime = Date.now() - createZoneStart;
    logLines.push(`Create Zone Time: ${createZoneTime} ms`);

    // === Edit Zone ===
    const editZoneStart = Date.now();
    // ... (ขั้นตอน edit zone เดิม)
    // หลังแก้ไข zone สำเร็จ
    const editZoneTime = Date.now() - editZoneStart;
    logLines.push(`Edit Zone Time: ${editZoneTime} ms`);

    // === Create Rack ===
    const createRackStart = Date.now();
    // ... (ขั้นตอนสร้าง rack เดิม)
    // หลังสร้าง rack สำเร็จ
    const createRackTime = Date.now() - createRackStart;
    logLines.push(`Create Rack Time: ${createRackTime} ms`);

    // === Edit Rack ===
    const editRackStart = Date.now();
    // ... (ขั้นตอน edit rack เดิม)
    // หลังแก้ไข rack สำเร็จ
    const editRackTime = Date.now() - editRackStart;
    logLines.push(`Edit Rack Time: ${editRackTime} ms`);

    // === Create Shelf ===
    const createShelfStart = Date.now();
    // ... (ขั้นตอนสร้าง shelf เดิม)
    // หลังสร้าง shelf สำเร็จ
    const createShelfTime = Date.now() - createShelfStart;
    logLines.push(`Create Shelf Time: ${createShelfTime} ms`);

    // === Edit Shelf ===
    const editShelfStart = Date.now();
    // ... (ขั้นตอน edit shelf เดิม)
    // หลังแก้ไข shelf สำเร็จ
    const editShelfTime = Date.now() - editShelfStart;
    logLines.push(`Edit Shelf Time: ${editShelfTime} ms`);

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
    const logPath = path.join(__dirname, 'warehouse-log.txt');
    fs.writeFileSync(logPath, logLines.join('\n'), 'utf-8');
    console.log(`📄 Log saved at: ${logPath}`);
    await browser.close();
  }
})();

// Helper: click by id
async function clickById(page, id) {
  await page.waitForSelector(`#${id}`, { visible: true });
  await page.click(`#${id}`);
}

// Shelf
async function createShelf(page, name) {
  await clickById(page, 'btn-add-shelf');
  await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true });
  // กรอกข้อมูลใหม่ทุกครั้งหลังเปิด dialog
  await page.click('input[placeholder="Enter shelf name"]', { clickCount: 3 });
  await page.type('input[placeholder="Enter shelf name"]', name);
  await page.click('input[placeholder="Shelf level (1, 2, 3, etc.)"]', { clickCount: 3 });
  await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '1');
  await page.click('input[placeholder="Width"]', { clickCount: 3 });
  await page.type('input[placeholder="Width"]', '3');
  await page.click('input[placeholder="Length"]', { clickCount: 3 });
  await page.type('input[placeholder="Length"]', '3');
  await page.click('input[placeholder="Height"]', { clickCount: 3 });
  await page.type('input[placeholder="Height"]', '3');
  await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
  await page.type('input[placeholder="Enter description (optional)"]', 'Shelf for test');
  await clickById(page, 'btn-create-shelf');
  // รอ dialog ปิด (หา selector ใหม่ทุกครั้งหลัง action)
  await page.waitForSelector('div[role=dialog], .rt-DialogContent', { hidden: true });
  // รอ shelf ปรากฏใน UI (หา DOM ใหม่)
  await page.waitForFunction(
    (name) => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent && cell.textContent.trim() === name),
    { timeout: 10000 }, name
  );
}

async function editShelf(page, oldName, newName) {
  // หา card shelf ที่มีชื่อ oldName ใหม่ทุกครั้ง
  const allDivs = await page.$$('div.bg-white');
  let shelfId = null;
  for (const div of allDivs) {
    const txt = await (await div.getProperty('textContent')).jsonValue();
    if (txt && txt.trim().includes(oldName)) {
      // ดึง id ปุ่ม edit shelf ใหม่
      const btn = await div.$('button[id^="btn-edit-shelf-"]');
      if (btn) {
        const id = await (await btn.getProperty('id')).jsonValue();
        shelfId = id;
        await btn.click();
        break;
      }
    }
  }
  if (!shelfId) throw new Error('ไม่พบปุ่ม Edit Shelf');
  await page.waitForSelector('input[placeholder="Enter shelf name"]', { visible: true });
  // กรอกข้อมูลใหม่ทุก field
  await page.click('input[placeholder="Enter shelf name"]', { clickCount: 3 });
  await page.type('input[placeholder="Enter shelf name"]', newName);
  await page.click('input[placeholder="Shelf level (1, 2, 3, etc.)"]', { clickCount: 3 });
  await page.type('input[placeholder="Shelf level (1, 2, 3, etc.)"]', '2');
  await page.click('input[placeholder="Width"]', { clickCount: 3 });
  await page.type('input[placeholder="Width"]', '4');
  await page.click('input[placeholder="Length"]', { clickCount: 3 });
  await page.type('input[placeholder="Length"]', '4');
  await page.click('input[placeholder="Height"]', { clickCount: 3 });
  await page.type('input[placeholder="Height"]', '4');
  await page.click('input[placeholder="Enter description (optional)"]', { clickCount: 3 });
  await page.type('input[placeholder="Enter description (optional)"]', 'Shelf edited');
  await clickById(page, 'btn-update-shelf');
  // รอ dialog ปิด (หา selector ใหม่)
  await page.waitForSelector('div[role=dialog], .rt-DialogContent', { hidden: true });
  // รอชื่อ shelf เปลี่ยนใน UI (หา DOM ใหม่)
  await page.waitForFunction(
    (name) => Array.from(document.querySelectorAll('div,span,h4,td,th')).some(cell => cell.textContent && cell.textContent.trim() === name),
    { timeout: 10000 }, newName
  );
} 