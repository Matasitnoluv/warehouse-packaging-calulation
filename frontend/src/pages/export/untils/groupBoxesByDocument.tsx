import { StoredBox, DocumentGroup } from "../types";

export const groupBoxesByDocument = (boxes: StoredBox[]): DocumentGroup[] => {
  const groups: Record<string, StoredBox[]> = {};

  boxes.forEach(box => {
    const docNo = box.document_product_no || 'Unknown';
    if (!groups[docNo]) {
      groups[docNo] = [];
    }
    groups[docNo].push(box);
  });

  // Convert to array of DocumentGroup
  return Object.entries(groups).map(([docNo, boxes]) => {
    // Use the first box for common information
    const firstBox = boxes[0];
    return {
      document_product_no: docNo,
      boxes: boxes,
      boxCount: boxes.length,
      warehouse: firstBox.master_warehouse_name,
      zone: firstBox.master_zone_name,
      rack: firstBox.master_rack_name,
      stored_date: firstBox.stored_date
    };
  });
};