# สรุปการแก้ไขปัญหา Used Space ใน Remaining Space Summary

## ปัญหาที่พบ
- การแสดงผล Used Space ใน Remaining Space Summary ไม่ทำงาน
- หลอด progress bar แสดง 0% เสมอ
- ข้อมูล Used, Remaining ไม่ถูกต้อง

## สาเหตุของปัญหา
1. **การดึงข้อมูลไม่ถูกต้อง**: โค้ดเดิมพยายามดึงข้อมูลจาก `boxes.responseObject[0]._sum.cubic_centimeter_box` ซึ่งไม่มีโครงสร้างข้อมูลนี้
2. **การคำนวณผิดพลาด**: ไม่มีการคำนวณ used space ที่ถูกต้องจากฐานข้อมูล
3. **โครงสร้างข้อมูลไม่สอดคล้อง**: ข้อมูลที่ดึงมาไม่ตรงกับที่ใช้แสดงผล

## การแก้ไขที่ทำ

### 1. Backend Services (shelfBoxStorageServices.ts)
เพิ่มฟังก์ชันใหม่สำหรับคำนวณ used space:

- `getShelfUsedSpaceAsync()` - คำนวณ used space ของ shelf
- `getRackUsedSpaceAsync()` - คำนวณ used space ของ rack
- `getZoneUsedSpaceAsync()` - คำนวณ used space ของ zone  
- `getWarehouseUsedSpaceAsync()` - คำนวณ used space ของ warehouse
- `shelfboxremain()` - ฟังก์ชันใหม่ที่ใช้ `calculateCapacitiesFromStoredBoxes`

### 2. Backend Router (shelfBoxStorageRouter.ts)
เพิ่ม endpoints ใหม่:
- `GET /used-space/shelf/:shelfId`
- `GET /used-space/rack/:rackId`
- `GET /used-space/zone/:zoneId`
- `GET /used-space/warehouse/:warehouseId`
- `GET /shelfboxremain/:id` - endpoint ใหม่สำหรับใช้ฟังก์ชัน calculateCapacitiesFromStoredBoxes

### 3. Frontend Services (shelfBoxStorage.services.ts)
เพิ่มฟังก์ชันใหม่:
- `getShelfUsedSpace()`
- `getRackUsedSpace()`
- `getZoneUsedSpace()`
- `getWarehouseUsedSpace()`
- `getRemaining()` - ฟังก์ชันใหม่สำหรับเรียกใช้ shelfboxremain endpoint

### 4. Frontend Component (calwarehouseTable.tsx)
แก้ไขฟังก์ชัน `fetchRemainingSpaceData()`:
- ใช้ฟังก์ชันใหม่ที่คำนวณ used space ได้อย่างถูกต้อง
- ลบโค้ดเดิมที่ดึงข้อมูลผิดพลาด
- แก้ไขการแสดงผลใน UI ให้ใช้ข้อมูลที่ถูกต้อง
- แยก UI ออกเป็น component แยก `DialogRemaining`

### 5. Frontend Component (dialogRemaining.tsx) - ใหม่
สร้าง component ใหม่สำหรับแสดงผล Remaining Space:
- ใช้ `useQuery` จาก React Query สำหรับดึงข้อมูล
- ใช้ข้อมูลจาก `data.responseObject.responseObject` ที่ถูกต้อง
- แสดงผล warehouse, zones, racks, shelves ตามโครงสร้างข้อมูลใหม่
- รองรับ loading และ error states
- ใช้ props `onClose` สำหรับปิด dialog

### 6. Backend Utils (calculatecapacities.ts)
ฟังก์ชัน `calculateCapacitiesFromStoredBoxes()`:
- คำนวณ used space จาก `stored_boxes` ในแต่ละ shelf
- รวมข้อมูลแบบ hierarchical: shelf → rack → zone → warehouse
- ส่งคืนข้อมูลในรูปแบบที่ถูกต้องสำหรับ frontend

## โครงสร้างข้อมูลใหม่
```json
{
  "warehouse": {
    "warehouseId": "string",
    "used": number,
    "total": number,
    "remain": number,
    "overUsed": boolean
  },
  "zones": [
    {
      "zoneId": "string",
      "used": number,
      "total": number,
      "remain": number,
      "overUsed": boolean,
      "racks": [...]
    }
  ]
}
```

## ผลลัพธ์ที่ได้
- Used Space จะแสดงค่าที่ถูกต้องตามข้อมูลจริงในฐานข้อมูล
- Progress bar จะแสดงเปอร์เซ็นต์การใช้งานที่ถูกต้อง
- ข้อมูล Used และ Remaining จะสอดคล้องกัน
- UI แยกเป็น component ที่จัดการได้ง่ายขึ้น

## การทดสอบ
1. รัน backend server: `cd backend && npm run dev`
2. รัน frontend server: `cd frontend && npm run dev`
3. ไปที่หน้า Remaining Space Summary
4. เลือก warehouse และกด Confirm
5. ตรวจสอบว่า Used Space แสดงค่าที่ถูกต้อง

## หมายเหตุ
- ฟังก์ชันใหม่จะคำนวณ used space จาก `shelf_box_storage` table โดยรวม `cubic_centimeter_box`
- การคำนวณจะทำแบบ hierarchical จาก shelf → rack → zone → warehouse
- ใช้ React Query สำหรับ state management และ caching
- แยก UI เป็น component ที่ reusable และ maintainable 