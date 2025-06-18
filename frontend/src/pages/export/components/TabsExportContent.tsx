import { TypeShelfExport } from "@/types/response/reponse.msproduct"
import { formatDate } from "@/utils/formatDate"
import { ExportButtonDialog } from "./ExportButtonDialog";
import { RestoreButtonDialog } from "./RestoreButtonDialog";

export const TabsExportContent = ({ exportData, exportTabs = false }: { exportData?: TypeShelfExport, exportTabs?: boolean }) => {
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
    const shelfBoxStorage = exportData.shelfBoxStorage.filter((doc) => doc.export === exportTabs)
    console.log(shelfBoxStorage.length, "exportData");
    return <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">กล่องที่พร้อมส่งออก</h2>

        <p className="text-gray-600 mb-4">เลือกเอกสารเพื่อดูรายละเอียดหรือส่งออกกล่องทั้งหมดในเอกสาร</p>
        {shelfBoxStorage.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left font-semibold text-gray-900">เลขที่เอกสารโปรดัก</th>
                            <th className="p-3 text-left font-semibold text-gray-900">เลขที่เอกสาร</th>
                            {/* <th className="p-3 text-left font-semibold text-gray-900">จำนวนกล่อง</th> */}
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
                                <td className="p-3">{doc.document_product_no}</td>
                                <td className="p-3">
                                    {doc.document_warehouse_no}
                                    {/* {doc.cal_box.count} */}
                                </td>
                                {/* <td className="p-3">{doc.boxCount}</td> */}

                                <td className="p-3">{rack?.master_rack_name}</td>
                                <td className="p-3">{doc.cal_box.box_no}</td>
                                <td className="p-3">{doc.cal_box.code_product}</td>
                                <td className="p-3">{doc.cal_box.count}</td>
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
            <div className="text-center p-4 text-gray-500">
                ไม่มีกล่องที่พร้อมส่งออก
            </div>
        )}
    </div>

}