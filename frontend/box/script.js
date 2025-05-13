/**
 * script.js
 * ระบบคำนวณการจัดสินค้าลงกล่อง (Dynamic Packing Logic)
 * **ปรับปรุง: เพิ่มการตรวจสอบมิติ 3D เบื้องต้น**
 */

let productCount = 0;
let boxCount = 0;

// --- Functions: addProductEntry, addBoxEntry, removeEntry ---
// (ใช้โค้ดเดิมจากคำตอบก่อนหน้า ไม่มีการเปลี่ยนแปลงในส่วนนี้)
function addProductEntry(id = '', name = '', w = '', l = '', h = '', count = '') {
    productCount++;
    const productsList = document.getElementById('products-list'); if (!productsList) return;
    const entryDiv = document.createElement('div'); entryDiv.classList.add('product-entry'); entryDiv.id = `product-${productCount}`;
    entryDiv.innerHTML = `
        <button class="remove-btn" onclick="removeEntry('product-${productCount}')" title="ลบสินค้านี้">X</button>
        <strong>สินค้า #${productCount}</strong><br>
        <label for="product_id_${productCount}">เลข Number:</label>
        <input type="text" id="product_id_${productCount}" name="product_id_${productCount}" value="${id}" placeholder="เช่น 0001">
        <label for="product_name_${productCount}">ชื่อสินค้า:</label>
        <input type="text" id="product_name_${productCount}" name="product_name_${productCount}" value="${name}" placeholder="เช่น Test-01">
        <label>ขนาด (กว้าง x ยาว x สูง):</label>
        <div class="dimension-group">
            <input type="number" name="product_w_${productCount}" value="${w}" placeholder="กว้าง" min="0.01" step="any" aria-label="ความกว้างสินค้า ${productCount}">
            <span>x</span>
            <input type="number" name="product_l_${productCount}" value="${l}" placeholder="ยาว" min="0.01" step="any" aria-label="ความยาวสินค้า ${productCount}">
            <span>x</span>
            <input type="number" name="product_h_${productCount}" value="${h}" placeholder="สูง" min="0.01" step="any" aria-label="ความสูงสินค้า ${productCount}">
        </div>
        <label for="product_count_${productCount}">จำนวนทั้งหมด (ชิ้น):</label>
        <input type="number" id="product_count_${productCount}" name="product_count_${productCount}" value="${count}" placeholder="เช่น 90" min="1" step="1">
    `;
    productsList.appendChild(entryDiv);
}
function addBoxEntry(id = '', name = '', w = '', l = '', h = '') {
    boxCount++;
    const boxesList = document.getElementById('boxes-list'); if (!boxesList) return;
    const entryDiv = document.createElement('div'); entryDiv.classList.add('box-entry'); entryDiv.id = `box-${boxCount}`;
    entryDiv.innerHTML = `
        <button class="remove-btn" onclick="removeEntry('box-${boxCount}')" title="ลบขนาดกล่องนี้">X</button>
        <strong>กล่อง #${boxCount}</strong><br>
        <label for="box_id_${boxCount}">เลข Number:</label>
        <input type="text" id="box_id_${boxCount}" name="box_id_${boxCount}" value="${id}" placeholder="เช่น B001">
        <label for="box_name_${boxCount}">ชื่อกล่อง:</label>
        <input type="text" id="box_name_${boxCount}" name="box_name_${boxCount}" value="${name}" placeholder="เช่น TestBox-1">
        <label>ขนาด (กว้าง x ยาว x สูง):</label>
        <div class="dimension-group">
            <input type="number" name="box_w_${boxCount}" value="${w}" placeholder="กว้าง" min="0.1" step="any" aria-label="ความกว้างกล่อง ${boxCount}">
            <span>x</span>
            <input type="number" name="box_l_${boxCount}" value="${l}" placeholder="ยาว" min="0.1" step="any" aria-label="ความยาวกล่อง ${boxCount}">
            <span>x</span>
            <input type="number" name="box_h_${boxCount}" value="${h}" placeholder="สูง" min="0.1" step="any" aria-label="ความสูงกล่อง ${boxCount}">
        </div>
    `;
    boxesList.appendChild(entryDiv);
}
function removeEntry(elementId) {
    const element = document.getElementById(elementId); if (element) { element.remove(); }
}

// --- Initialization: Add Example Data on Load ---
// (ใช้โค้ดเดิมจากคำตอบก่อนหน้า)
document.addEventListener('DOMContentLoaded', () => {
    const productsList = document.getElementById('products-list'); const boxesList = document.getElementById('boxes-list');
    if (productsList && productsList.childElementCount === 0) { addProductEntry('0001', 'Test-01', 7, 7, 10, 90); addProductEntry('0002', 'Test-02', 10, 20, 12, 1000); }
    if (boxesList && boxesList.childElementCount === 0) { addBoxEntry('B001', 'TestBox-1', 20, 20, 25); addBoxEntry('B002', 'TestBox-2', 10, 20, 25); }
});


// --- Helper Function: Check if item fits in box dimensions (any orientation) ---
/**
 * Checks if an item can potentially fit into a box based on dimensions,
 * considering all 6 standard orientations of the item.
 * @param {object} item - Product object { width, length, height }
 * @param {object} box - Box object { width, length, height }
 * @returns {boolean} - True if at least one orientation fits, false otherwise.
 */
function checkDimensionFit(item, box) {
    // Ensure valid dimensions
    if (!item || !box || item.width <= 0 || item.length <= 0 || item.height <= 0 || box.width <= 0 || box.length <= 0 || box.height <= 0) {
        return false;
    }

    const itemDims = [item.width, item.length, item.height];
    const boxDims = [box.width, box.length, box.height].sort((a, b) => a - b); // Sort box dims small to large

    // Check all 6 orientations of the item
    const orientations = [
        [itemDims[0], itemDims[1], itemDims[2]], // W L H
        [itemDims[0], itemDims[2], itemDims[1]], // W H L
        [itemDims[1], itemDims[0], itemDims[2]], // L W H
        [itemDims[1], itemDims[2], itemDims[0]], // L H W
        [itemDims[2], itemDims[0], itemDims[1]], // H W L
        [itemDims[2], itemDims[1], itemDims[0]], // H L W
    ];

    for (const orient of orientations) {
        // Sort item's current orientation dims small to large
        const sortedOrient = [...orient].sort((a, b) => a - b);
        // Check if sorted item dims fit within sorted box dims
        if (sortedOrient[0] <= boxDims[0] && sortedOrient[1] <= boxDims[1] && sortedOrient[2] <= boxDims[2]) {
            return true; // Found an orientation that fits
        }
    }

    return false; // No orientation fits
}


/**
 * Main function to calculate the packing arrangement. (MODIFIED)
 */
function calculatePacking() {
    // --- 1. Read Product Data --- (Same as before)
    const products = [];
    // ... (code to read and validate products) ...
    const productEntries = document.querySelectorAll('.product-entry'); let currentProductIndex = 0;
    for (const entry of productEntries) { currentProductIndex++; const idMatch = entry.id.match(/product-(\d+)/); if (!idMatch) continue; const i = idMatch[1]; const idInput = entry.querySelector(`input[name="product_id_${i}"]`); const nameInput = entry.querySelector(`input[name="product_name_${i}"]`); const wInput = entry.querySelector(`input[name="product_w_${i}"]`); const lInput = entry.querySelector(`input[name="product_l_${i}"]`); const hInput = entry.querySelector(`input[name="product_h_${i}"]`); const countInput = entry.querySelector(`input[name="product_count_${i}"]`); if (!idInput || !nameInput || !wInput || !lInput || !hInput || !countInput) { console.error(`Inputs missing for ${entry.id}`); continue; } const id = idInput.value.trim(); const name = nameInput.value.trim(); const w = parseFloat(wInput.value); const l = parseFloat(lInput.value); const h = parseFloat(hInput.value); const count = parseInt(countInput.value); if (!id || !name || isNaN(w) || w <= 0 || isNaN(l) || l <= 0 || isNaN(h) || h <= 0 || isNaN(count) || count <= 0) { alert(`ข้อมูลสินค้า #${currentProductIndex} (ID: ${id || 'ว่าง'}) ไม่ถูกต้อง`); return; } products.push({ id, name, width: w, length: l, height: h, volume: w * l * h, totalCount: count, remainingCount: count, originalIndex: currentProductIndex }); }
    if (products.length === 0) { alert("กรุณาเพิ่มข้อมูลสินค้า"); return; }


    // --- 2. Read Box Data --- (Same as before)
    const boxes = [];
    // ... (code to read and validate boxes) ...
    const boxEntries = document.querySelectorAll('.box-entry'); let currentBoxIndex = 0;
    for (const entry of boxEntries) { currentBoxIndex++; const idMatch = entry.id.match(/box-(\d+)/); if (!idMatch) continue; const i = idMatch[1]; const idInput = entry.querySelector(`input[name="box_id_${i}"]`); const nameInput = entry.querySelector(`input[name="box_name_${i}"]`); const wInput = entry.querySelector(`input[name="box_w_${i}"]`); const lInput = entry.querySelector(`input[name="box_l_${i}"]`); const hInput = entry.querySelector(`input[name="box_h_${i}"]`); if (!idInput || !nameInput || !wInput || !lInput || !hInput) { console.error(`Inputs missing for ${entry.id}`); continue; } const id = idInput.value.trim(); const name = nameInput.value.trim(); const w = parseFloat(wInput.value); const l = parseFloat(lInput.value); const h = parseFloat(hInput.value); if (!id || !name || isNaN(w) || w <= 0 || isNaN(l) || l <= 0 || isNaN(h) || h <= 0) { alert(`ข้อมูลกล่อง #${currentBoxIndex} (ID: ${id || 'ว่าง'}) ไม่ถูกต้อง`); return; } boxes.push({ id, name, width: w, length: l, height: h, volume: w * l * h, originalIndex: currentBoxIndex }); }
    if (boxes.length === 0) { alert("กรุณาเพิ่มข้อมูลกล่อง"); return; }


    // --- 3. Packing Logic (MODIFIED) ---
    boxes.sort((a, b) => b.volume - a.volume);
    products.sort((a, b) => b.volume - a.volume);

    const packedBoxesResult = [];
    let boxInstanceCounter = 0;
    let totalItemsPackedOverall = 0;

    while (products.some(p => p.remainingCount > 0)) {
        let packedSomethingThisIteration = false;
        let bestFitFound = null;
        const productToPack = products.find(p => p.remainingCount > 0);
        if (!productToPack) break;

        // --- MODIFICATION START: Iterate boxes to find best fit ---
        for (const boxType of boxes) {
            // **NEW CHECK:** First, check if the item's dimensions *can* fit in the box dimensions (any orientation)
            const canDimensionsFit = checkDimensionFit(productToPack, boxType);

            if (canDimensionsFit && productToPack.volume <= boxType.volume && productToPack.volume > 0) {
                // If dimensions *could* fit AND volume fits: proceed with volume-based logic for quantity
                const itemsPerFullBox = Math.floor(boxType.volume / productToPack.volume);
                if (itemsPerFullBox <= 0) continue; // Should not happen if volume fits, but safety check

                const canMakeFullBox = productToPack.remainingCount >= itemsPerFullBox;

                if (canMakeFullBox) {
                    // Prioritize full box in largest possible container that fits dimensions
                    bestFitFound = { boxType, product: productToPack, itemsToPack: itemsPerFullBox, isFullBox: true };
                    break; // Found best option (full box)
                } else {
                    // Can only partially fill. Consider this as a potential fit.
                    if (!bestFitFound || boxType.volume > bestFitFound.boxType.volume) {
                         bestFitFound = { boxType, product: productToPack, itemsToPack: productToPack.remainingCount, isFullBox: false };
                    }
                    // Continue checking smaller boxes, they might be better for partial fills.
                }
            } else if (!canDimensionsFit && productToPack.remainingCount > 0) {
                 // **IMPORTANT:** If dimensions don't fit, log it but continue checking smaller boxes.
                 // console.log(`สินค้า ${productToPack.name} มีขนาดไม่พอดีกับกล่อง ${boxType.name} (ตามมิติ 3D)`);
            }
        } // --- End loop through box types ---
         // --- MODIFICATION END ---


        // --- Action based on finding a best fit ---
        if (bestFitFound) {
            boxInstanceCounter++;
            const currentBoxInstance = {
                boxTypeId: bestFitFound.boxType.id, boxTypeName: bestFitFound.boxType.name, boxVolume: bestFitFound.boxType.volume,
                instanceNumber: boxInstanceCounter, items: [], usedVolume: 0, remainingVolume: bestFitFound.boxType.volume
            };

            // Add the primary item(s)
            const qtyToAddPrimary = bestFitFound.itemsToPack;
            currentBoxInstance.items.push({ productId: bestFitFound.product.id, productName: bestFitFound.product.name, quantity: qtyToAddPrimary });
            const volumeAddedPrimary = qtyToAddPrimary * bestFitFound.product.volume;
            currentBoxInstance.usedVolume += volumeAddedPrimary;
            currentBoxInstance.remainingVolume = Math.max(0, currentBoxInstance.boxVolume - currentBoxInstance.usedVolume);
            bestFitFound.product.remainingCount -= qtyToAddPrimary;
            totalItemsPackedOverall += qtyToAddPrimary;
            packedSomethingThisIteration = true;

            // --- Attempt to fill remaining space (using VOLUME check primarily for simplicity) ---
            if (currentBoxInstance.remainingVolume > 0.01) {
                products.filter(p => p.id !== bestFitFound.product.id && p.remainingCount > 0 && p.volume > 0 && p.volume <= currentBoxInstance.remainingVolume)
                         // **Optional NEW CHECK:** Add dimension check here too? Could slow down significantly.
                         // .filter(p => checkDimensionFit(p, bestFitFound.boxType)) // <-- Uncomment to add stricter check
                        .sort((a, b) => b.volume - a.volume)
                        .forEach(otherProduct => {
                    // **Optional Check:** const canOtherFitDims = checkDimensionFit(otherProduct, bestFitFound.boxType);
                    // if (canOtherFitDims && currentBoxInstance.remainingVolume >= otherProduct.volume) { ... } else { proceed without dim check }
                    if (currentBoxInstance.remainingVolume >= otherProduct.volume) { // Primarily volume check here
                        const maxFitOther = Math.floor(currentBoxInstance.remainingVolume / otherProduct.volume);
                        const qtyToAddOther = Math.min(otherProduct.remainingCount, maxFitOther);
                        if (qtyToAddOther > 0) {
                            const existingItemEntry = currentBoxInstance.items.find(item => item.productId === otherProduct.id);
                            if (existingItemEntry) { existingItemEntry.quantity += qtyToAddOther; }
                            else { currentBoxInstance.items.push({ productId: otherProduct.id, productName: otherProduct.name, quantity: qtyToAddOther }); }
                            const volumeAddedOther = qtyToAddOther * otherProduct.volume;
                            currentBoxInstance.usedVolume += volumeAddedOther;
                            currentBoxInstance.remainingVolume = Math.max(0, currentBoxInstance.boxVolume - currentBoxInstance.usedVolume);
                            otherProduct.remainingCount -= qtyToAddOther;
                            totalItemsPackedOverall += qtyToAddOther;
                        }
                    }
                });
            }
            packedBoxesResult.push(currentBoxInstance);

        } else if (productToPack && productToPack.remainingCount > 0) {
            // If a product remains but NO box could fit it (either by volume or dimensions)
             console.error(`ไม่สามารถหาขนาดกล่องที่เหมาะสมสำหรับสินค้าที่เหลือ: ${productToPack.name} (ปริมาตร: ${productToPack.volume}, ขนาด: ${productToPack.width}x${productToPack.length}x${productToPack.height}) ได้`);
             packedSomethingThisIteration = false; // Ensure loop terminates
             break;
        }

        // Safety Break
        if (!packedSomethingThisIteration && products.some(p => p.remainingCount > 0)) {
            console.error("การคำนวณหยุดชะงัก ไม่สามารถบรรจุสินค้าที่เหลือได้");
            break;
        }
    } // --- End while loop ---

    // --- 4. Final Check and Display Results --- (Same as before)
    const remainingProducts = products.filter(p => p.remainingCount > 0);
    const errorOccurred = remainingProducts.length > 0;
    if (errorOccurred) { alert("ข้อผิดพลาด: ไม่สามารถบรรจุสินค้าบางรายการได้"); console.error("สินค้าที่บรรจุไม่หมด:", remainingProducts); }
    displayResults(packedBoxesResult, products, boxes, errorOccurred);
}


// --- Function: displayResults ---
// (ใช้โค้ดเดิมจากคำตอบก่อนหน้า ไม่มีการเปลี่ยนแปลง)
function displayResults(packedBoxesResult, productsInput, boxesInput, errorOccurred) {
    const resultsDiv = document.getElementById('results'); const summaryPre = document.getElementById('calculation-summary'); if (!resultsDiv || !summaryPre) return;
    let summary = ""; if (errorOccurred) { summary += "คำเตือน: ไม่สามารถบรรจุสินค้าทั้งหมดลงในกล่องตามที่กำหนดได้\n\n"; }
    summary += `--- สรุปผลการคำนวณการจัดสินค้า (Dynamic) ---\n\n`;
    summary += "1. จำนวนกล่องที่ต้องใช้:\n"; const boxCountsByType = {}; packedBoxesResult.forEach(box => { boxCountsByType[box.boxTypeName] = (boxCountsByType[box.boxTypeName] || 0) + 1; }); let totalBoxesUsed = 0; boxesInput.sort((a, b) => b.volume - a.volume).forEach(boxInfo => { const count = boxCountsByType[boxInfo.name] || 0; if (count > 0) { summary += `   - ${boxInfo.name} (${boxInfo.id}): ${count} กล่อง\n`; totalBoxesUsed += count; } }); for (const boxName in boxCountsByType) { if (!boxesInput.some(b => b.name === boxName)) { const boxInfoFromResult = packedBoxesResult.find(b => b.boxTypeName === boxName); summary += `   - ${boxName} (${boxInfoFromResult?.boxTypeId || 'N/A'}): ${boxCountsByType[boxName]} กล่อง (ชนิดนี้อาจไม่มีในรายการตั้งต้น)\n`; totalBoxesUsed += boxCountsByType[boxName]; } } summary += `   * รวมทั้งหมด: ${totalBoxesUsed} กล่อง\n\n`;
    summary += "2. การกระจายสินค้า:\n"; if (packedBoxesResult.length === 0) { summary += "   (ไม่มีกล่องที่ถูกใช้งาน)\n"; } else { packedBoxesResult.sort((a, b) => a.instanceNumber - b.instanceNumber); let i = 0; while (i < packedBoxesResult.length) { const firstBoxInGroup = packedBoxesResult[i]; let j = i; while ( j + 1 < packedBoxesResult.length && packedBoxesResult[j + 1].boxTypeId === firstBoxInGroup.boxTypeId && packedBoxesResult[j + 1].items.length === firstBoxInGroup.items.length && firstBoxInGroup.items.every((item, index) => { const nextItem = packedBoxesResult[j + 1].items[index]; return nextItem && item.productId === nextItem.productId && item.quantity === nextItem.quantity; }) ) { j++; } const lastBoxInGroup = packedBoxesResult[j]; const startInstance = firstBoxInGroup.instanceNumber; const endInstance = lastBoxInGroup.instanceNumber; const groupSize = endInstance - startInstance + 1; if (groupSize === 1) { summary += `   * กล่อง ${firstBoxInGroup.boxTypeName} ลำดับที่ ${startInstance}:\n`; } else { summary += `   * กล่อง ${firstBoxInGroup.boxTypeName} ลำดับที่ ${startInstance}-${endInstance} (${groupSize} กล่อง):\n`; } firstBoxInGroup.items.forEach(item => { summary += `     - บรรจุสินค้า ${item.productName} (${item.productId}) จำนวน ${item.quantity} ชิ้นต่อกล่อง\n`; }); summary += `     (ปริมาตรใช้ไป ~${firstBoxInGroup.usedVolume.toFixed(0)} / ${firstBoxInGroup.boxVolume.toFixed(0)} ต่อกล่อง, เหลือ ~${firstBoxInGroup.remainingVolume.toFixed(0)})\n`; i = j + 1; } } summary += "\n";
    summary += "3. จำนวนสินค้าทั้งหมดที่ถูกบรรจุ:\n"; let totalPackedCountOverallDisplay = 0; const packedCountsByProductId = {}; packedBoxesResult.forEach(box => { box.items.forEach(item => { packedCountsByProductId[item.productId] = (packedCountsByProductId[item.productId] || 0) + item.quantity; totalPackedCountOverallDisplay += item.quantity; }); }); productsInput.sort((a, b) => a.originalIndex - b.originalIndex); productsInput.forEach(prod => { const packedCount = packedCountsByProductId[prod.id] || 0; const neededCount = prod.totalCount; const remainingCount = Math.max(0, neededCount - packedCount); summary += `   - ${prod.name} (${prod.id}): บรรจุ ${packedCount} / ${neededCount} ชิ้น `; if (remainingCount <= 0) { summary += '(ครบ)\n'; } else { summary += `(ขาด ${remainingCount} ชิ้น)\n`; } }); summary += `   * รวมสินค้าที่บรรจุทั้งหมด: ${totalPackedCountOverallDisplay} ชิ้น\n\n`;
    summary += "4. ประสิทธิภาพการใช้พื้นที่:\n"; let totalBoxVolumeUsed = 0; let totalProductVolumePacked = 0; packedBoxesResult.forEach(box => { totalBoxVolumeUsed += box.boxVolume; totalProductVolumePacked += box.usedVolume; }); const totalRemainingVolumeOverall = totalBoxVolumeUsed - totalProductVolumePacked; const overallEfficiencyPercent = totalBoxVolumeUsed > 0 ? (totalProductVolumePacked / totalBoxVolumeUsed) * 100 : 0; summary += `   - ปริมาตรรวมของกล่องทั้งหมดที่ใช้: ${totalBoxVolumeUsed.toFixed(0)} ลบ.หน่วย\n`; summary += `   - ปริมาตรรวมของสินค้าที่บรรจุ: ${totalProductVolumePacked.toFixed(0)} ลบ.หน่วย\n`; summary += `   - ปริมาตรคงเหลือรวมในกล่องทั้งหมด: ${totalRemainingVolumeOverall.toFixed(0)} ลบ.หน่วย\n`; summary += `   * ประสิทธิภาพการใช้พื้นที่เฉลี่ย: ${overallEfficiencyPercent.toFixed(1)}%\n\n`;
    summary += "5. สถานะการบรรจุสินค้า:\n"; const unpackedItems = productsInput.filter(prod => { const packedCount = packedCountsByProductId[prod.id] || 0; return (prod.totalCount - packedCount) > 0; }); if (unpackedItems.length > 0) { summary += "   สินค้าที่ไม่สามารถบรรจุได้ (หรือบรรจุไม่ครบ):\n"; unpackedItems.forEach(prod => { const packedCount = packedCountsByProductId[prod.id] || 0; const remainingCount = prod.totalCount - packedCount; summary += `     - ${prod.name} (${prod.id}): เหลือ ${remainingCount} ชิ้น\n`; }); summary += "   **เหตุผลที่เป็นไปได้:** ข้อจำกัดขนาดกล่อง/มิติ, ปริมาตรสินค้าเหลือไม่พอดีช่องว่าง, หรือ Logic การจัดเรียง\n"; } else if (!errorOccurred) { summary += "   สินค้าทั้งหมดถูกบรรจุลงกล่องเรียบร้อยแล้ว\n"; } else { summary += "   (เกิดข้อผิดพลาดระหว่างการคำนวณ แต่ดูเหมือนสินค้าถูกบรรจุหมดแล้ว โปรดตรวจสอบ)\n"; }
    summaryPre.textContent = summary; resultsDiv.style.display = 'block'; resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}