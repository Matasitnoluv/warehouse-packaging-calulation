import { TypeShelfExport } from "@/types/response/reponse.msproduct"
import { formatDate } from "@/utils/formatDate"
import { ExportButtonDialog } from "./ExportButtonDialog";
import { RestoreButtonDialog } from "./RestoreButtonDialog";
import { useEffect, useState } from "react";

export const TabsExportContent = ({ exportData, exportTabs = false, searchKeyword }: { exportData?: TypeShelfExport, exportTabs?: boolean, searchKeyword?: string }) => {
    const [search, setSearch] = useState("");

    // อัพเดท search state เมื่อ searchKeyword prop เปลี่ยน
    useEffect(() => {
        setSearch(searchKeyword || "");
    }, [searchKeyword]);

    if (!exportData) {
        return (
            <div className="text-center text-gray-500 py-4">
                กรุณาเลือกคลังและโซนเพื่อแสดงข้อมูลการส่งออก
            </div>
        );
    }

    const rack = exportData.racks.find(
        (r: any) => r.master_zone_id === exportData.zone.master_zone_id
    );

    // กรองข้อมูลตาม exportTabs
    let shelfBoxStorage = exportData.shelfBoxStorage.filter((doc) => doc.export === exportTabs);
    const totalItems = shelfBoxStorage.length;

    // กรองข้อมูลตาม searchKeyword
    if (search && search.trim()) {
        const keyword = search.toLowerCase().trim();
        shelfBoxStorage = shelfBoxStorage.filter((doc) => {
            const documentProductNo = doc?.cal_box?.document_product_no?.toLowerCase() || '';
            const codeBox = doc?.cal_box?.code_box?.toLowerCase() || '';
            const codeProduct = doc?.cal_box?.code_product?.toLowerCase() || '';

            return documentProductNo.includes(keyword) ||
                codeBox.includes(keyword) ||
                codeProduct.includes(keyword);
        });
    }

    const filteredItems = shelfBoxStorage.length;
    console.log(shelfBoxStorage.length, "exportData");

    return <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-semibold mb-1">กล่องที่พร้อมส่งออก</h2>
                <p className="text-gray-600">เลือกเอกสารเพื่อดูรายละเอียดหรือส่งออกกล่องทั้งหมดในเอกสาร</p>
            </div>
            {searchKeyword && (
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                    ค้นหา: "{searchKeyword}" - พบ {filteredItems} รายการจากทั้งหมด {totalItems} รายการ
                </div>
            )}
        </div>

        {shelfBoxStorage.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left font-semibold text-gray-900">เลขที่เอกสารโปรดัก</th>
                            <th className="p-3 text-left font-semibold text-gray-900">เลขที่เอกสาร</th>
                            <th className="p-3 text-left font-semibold text-gray-900">ชั้นวาง</th>
                            <th className="p-3 text-left font-semibold text-gray-900">เลขที่กล่อง</th>
                            <th className="p-3 text-left font-semibold text-gray-900">รหัสสินค้า</th>
                            <th className="p-3 text-left font-semibold text-gray-900">จำนวนสินค้า</th>
                            <th className="p-3 text-left font-semibold text-gray-900">{exportTabs ? "วันที่ส่งออก" : "วันที่จัดเก็บ"}</th>
                            <th className="p-3 text-left font-semibold text-gray-900">การจัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelfBoxStorage.map((doc) => (
                            <tr key={doc.cal_box_id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-3">{doc?.cal_box?.document_product_no}</td>
                                <td className="p-3">
                                    {doc?.cal_box?.code_box}
                                    {/* {doc.cal_box.count} */}
                                </td>

                                <td className="p-3">{rack?.master_rack_name}</td>
                                <td className="p-3">{doc?.cal_box?.box_no}</td>
                                <td className="p-3">{doc?.cal_box?.code_product}</td>
                                <td className="p-3">{doc?.cal_box?.count}</td>
                                <td className="p-3">{exportTabs ? formatDate(doc.export_date) : formatDate(doc.stored_date)}</td>
                                <td className="p-3 flex gap-2">
                                    {/* <button
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                                        onClick={() => handleDocumentSelect(doc)}
                                    >
                                        รายละเอียด
                                    </button> */}
                                    {exportTabs ? <RestoreButtonDialog storage_id={doc.storage_id} wareHouse={exportData.warehouse.master_warehouse_id} zone={exportData.zone.master_zone_id} /> :
                                        <ExportButtonDialog storage_id={doc.storage_id} wareHouse={exportData.warehouse.master_warehouse_id} zone={exportData.zone.master_zone_id} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                {searchKeyword ? (
                    <div>
                        <p className="text-lg font-medium mb-2">ไม่พบข้อมูลที่ค้นหา</p>
                        <p className="text-sm">คำค้นหา: "{searchKeyword}"</p>
                        <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกดคำ</p>
                    </div>
                ) : (
                    <p className="text-lg">ไม่มีกล่องที่พร้อมส่งออก</p>
                )}
            </div>
        )}
    </div>

}