import { Table, Card, AlertDialog, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCalWarehouse } from "@/services/calwarehouse.service";
import { TypeCalWarehouseAll } from "@/types/response/reponse.cal_warehouse";
import { useNavigate } from "react-router-dom";
import DilogAddCalwarehouse from "./dilogAddCalwarehouse";
import DilogEditCalwarehouse from "./dilogEditCalwarehouse";
import AlrtdilogDeleteDocument from "./alrtdilogDeleteDocument";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import DialogSelectWarehouse from "@/pages/calculationproductbox/components/dialogSelectWarehouse";
import { AlertDialog as RemainingSpaceDialog } from "@radix-ui/themes";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf } from "@/services/msshelf.services";
import { shelfBoxStorageService } from "@/services/shelfBoxStorage.services";

const CalWarehouseTable = () => {
    const navigate = useNavigate();
    const [calculations, setCalculations] = useState<TypeCalWarehouseAll[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
    const [selectedDocumentNo, setSelectedDocumentNo] = useState<string | null>(null);
    const [openRemainingSpace, setOpenRemainingSpace] = useState(false);
    const [remainingSpaceData, setRemainingSpaceData] = useState<any>(null);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getCalWarehouseData = () => {
        getCalWarehouse().then((res) => {
            console.log(res);
            setCalculations(res.responseObject);
        });
    };

    useEffect(() => {
        getCalWarehouseData();
    }, []);

    useEffect(() => {
        async function fetchWarehouses() {
            try {
                const res = await getMswarehouse();
                console.log("Warehouse API Response:", res);
                if (res && res.responseObject) {
                    const warehouseData = Array.isArray(res.responseObject) ? res.responseObject : [res.responseObject];
                    setWarehouses(warehouseData);
                    if (warehouseData.length > 0) {
                        setSelectedWarehouseId(warehouseData[0].master_warehouse_id);
                    }
                } else {
                    console.error("No warehouse data found in response");
                    setWarehouses([]);
                }
            } catch (e) {
                console.error("Error fetching warehouses:", e);
                setWarehouses([]);
            }
        }
        fetchWarehouses();
    }, []);

    const handleRemainingSpace = async (warehouseId: string) => {
        try {
            const data = await fetchRemainingSpaceData(warehouseId);
            console.log("Remaining Space Data:", data);
            if (!data) {
                alert("ไม่พบข้อมูล warehouse นี้ หรือข้อมูลไม่สมบูรณ์");
                return;
            }
            setRemainingSpaceData(data);
            setOpenRemainingSpace(true);
        } catch (e) {
            console.error("Error in handleRemainingSpace:", e);
            alert("เกิดข้อผิดพลาดในการดึงข้อมูล Remaining space");
        }
    };

    const handleConfirm = async () => {
        console.log('handleConfirm called', selectedWarehouseId);
        if (!selectedWarehouseId) {
            alert("Please select a warehouse");
            return;
        }
        setIsLoading(true);
        try {
            const data = await fetchRemainingSpaceData(selectedWarehouseId);
            console.log('fetchRemainingSpaceData result', data);
            if (!data) {
                alert("No data found for this warehouse or data is incomplete");
                return;
            }
            setRemainingSpaceData(data);
            setShowDetails(true);
        } catch (e) {
            console.error("Error in handleConfirm:", e);
            alert("An error occurred while fetching data");
        } finally {
            setIsLoading(false);
        }
    };

    async function fetchRemainingSpaceData(warehouseId: string) {
        try {
            console.log('fetchRemainingSpaceData called', warehouseId);
            // Fetch warehouse
            const msWarehouseRes = await getMswarehouse();
            const msWarehouseList = msWarehouseRes.responseObject || [];
            const msWarehouse = msWarehouseList.find((w: any) => w.master_warehouse_id === warehouseId);
            if (!msWarehouse) return null;

            // Fetch zones
            const msZoneRes = await getMszone(msWarehouse.master_warehouse_id);
            const zones = msZoneRes.responseObject || [];
            let warehouseTotal = msWarehouse.cubic_centimeter_warehouse || 0;
            let warehouseUsed = 0;
            let warehouseRemaining = 0;
            let zoneSummaries: any[] = [];

            await Promise.all(zones.map(async (zone: any) => {
                const msRackRes = await getMsrack(zone.master_zone_id);
                const racks = msRackRes.responseObject || [];
                // console.log('racks:', racks);
                // console.log('shelves use', racks.shelves.)
                let zoneTotal = racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'total'), 0);
                let zoneUsed = racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'used'), 0);
                let zoneRemaining = racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'remaining'), 0);
                let rackSummaries: any[] = [];
                await Promise.all(racks.map(async (rack: any) => {
                    const msShelfRes = await getMsshelf(rack.master_rack_id);
                    const shelves = msShelfRes.responseObject || [];
                    rack.shelves = shelves;
                    let rackTotal = rack.cubic_centimeter_rack || 0;
                    let rackUsed = 0;
                    let rackRemaining = 0;
                    let shelfSummaries: any[] = [];
                    await Promise.all(shelves.map(async (shelf: any) => {
                        // ดึงกล่องที่ถูกจัดเก็บใน shelf นี้
                        let used = 0;
                        let boxes = [];
                        try {
                            const boxRes = await shelfBoxStorageService.getStoredBoxesByShelfId(shelf.master_shelf_id);
                            console.log('shelf:', shelf);
                            console.log('boxRes:', boxRes);
                            boxes = boxRes.success ? boxRes.responseObject : [];
                            console.log('boxes:',);
                            
                            used = boxes.responseObject[0]._sum.cubic_centimeter_box;
                        } catch (e) {
                            used = 0;
                            boxes = [];
                        }
                        console.log('used:', used);
                        const total = shelf.cubic_centimeter_shelf || 0;
                        const remaining = total - used;
                        rackUsed += used;
                        rackTotal += total;
                        rackRemaining += remaining;
                        shelfSummaries.push({
                            ...shelf,
                            total,
                            used,
                            remaining,
                            boxes,
                        });
                    }));
                    zoneUsed += rackUsed;
                    zoneTotal += rackTotal;
                    zoneRemaining += rackRemaining;
                    rackSummaries.push({
                        ...rack,
                        total: rackTotal,
                        used: rackUsed,
                        remaining: rackTotal - rackUsed,
                        shelves: shelfSummaries,
                    });
                }));
                warehouseUsed += zoneUsed;
                warehouseTotal += zoneTotal;
                warehouseRemaining += zoneRemaining;
                zoneSummaries.push({
                    ...zone,
                    total: zoneTotal,
                    used: zoneUsed,
                    remaining: zoneTotal - zoneUsed,
                    racks: rackSummaries,
                });
            }));

            warehouseRemaining = warehouseTotal - warehouseUsed;

            return {
                warehouse: {
                    total: warehouseTotal,
                    used: warehouseUsed,
                    remaining: warehouseRemaining,
                    name: msWarehouse.master_warehouse_name,
                    dimensions: {
                        width: msWarehouse.width,
                        length: msWarehouse.length,
                        height: msWarehouse.height
                    }
                },
                zones: zoneSummaries,
            };
        } catch (e) {
            console.error("Error in fetchRemainingSpaceData:", e);
            return null;
        }
    }

    // ฟังก์ชันช่วยคำนวณรวมจาก shelves จริง
    function sumShelf(shelves: any[], key: string): number {
        if (!Array.isArray(shelves)) return 0;
        return shelves.reduce((sum: number, shelf: any) => sum + (shelf[key] || 0), 0);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Calculation Records</h2>
                            <p className="text-gray-600">Manage your warehouse and box calculations</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() => navigate("/calculationproductbox")}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-md shadow-md transition-colors text-sm"
                            >
                                <ArrowLeft size={18} />
                                Back to Calculator
                            </button>
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-md shadow-md flex items-center transition-colors text-base"
                                style={{ minHeight: '40px', fontWeight: 'bold', borderRadius: '6px', padding: '8px 24px' }}
                                onClick={() => setOpenRemainingSpace(true)}
                            >
                                Remaining space
                            </Button>
                            <AlertDialog.Root>
                                <DilogAddCalwarehouse getCalwarehouseData={getCalWarehouseData} />
                            </AlertDialog.Root>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-50 border-b border-gray-200">
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FileSpreadsheet size={18} className="text-gray-500" />
                                            Document No.
                                        </div>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 text-center font-semibold text-gray-700 w-32">
                                        Actions
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 text-center font-semibold text-gray-700 w-32">
                                        Delete
                                    </Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {calculations.length > 0 ? (
                                    calculations.map((cal_warehouse, index) => (
                                        <Table.Row
                                            key={cal_warehouse.document_warehouse_no}
                                            className={`
                                                border-b border-gray-100 
                                                ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                hover:bg-blue-50 transition-all duration-200
                                            `}
                                        >
                                            <Table.RowHeaderCell className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {cal_warehouse.document_warehouse_no}
                                                </div>
                                            </Table.RowHeaderCell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <DialogSelectWarehouse
                                                        documentWarehouseNo={cal_warehouse.document_warehouse_no}
                                                        triggerButtonText="Calculation"
                                                        buttonClassName="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-md shadow-md transition-colors text-sm"
                                                    />
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <AlrtdilogDeleteDocument
                                                        getCalWarehouseData={getCalWarehouseData}
                                                        document_warehouse_id={cal_warehouse.document_warehouse_id}
                                                        document_warehouse_no={cal_warehouse.document_warehouse_no}
                                                    />
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={3} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <FileSpreadsheet size={24} />
                                                <p className="text-lg font-medium">No calculations found</p>
                                                <p className="text-sm">Create a new calculation to get started</p>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </div>
                </Card>

                {/* DialogSelectWarehouse Popup */}
                {showWarehouseDialog && (
                    <DialogSelectWarehouse
                        triggerButtonText={null}
                        documentWarehouseNo={selectedDocumentNo ?? undefined}
                    />
                )}

                {openRemainingSpace && (
                    <RemainingSpaceDialog.Root open={openRemainingSpace} onOpenChange={setOpenRemainingSpace}>
                        <RemainingSpaceDialog.Content className="max-w-3xl">
                            <RemainingSpaceDialog.Title className="text-2xl font-bold text-gray-800 mb-4">Remaining Space Summary</RemainingSpaceDialog.Title>
                            <RemainingSpaceDialog.Description>
                                {!showDetails ? (
                                    <div className="mb-6">
                                        <label className="block mb-2 font-semibold text-gray-700">Select Warehouse</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            value={selectedWarehouseId}
                                            onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                        >
                                            <option value="">-- Select Warehouse --</option>
                                            {warehouses.map(w => (
                                                <option key={w.master_warehouse_id} value={w.master_warehouse_id}>
                                                    {w.master_warehouse_name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-4 flex justify-end gap-2">
                                            <Button
                                                onClick={handleConfirm}
                                                disabled={isLoading || !selectedWarehouseId}
                                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? "Loading..." : "Confirm"}
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setOpenRemainingSpace(false);
                                                    setShowDetails(false);
                                                }}
                                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                    <div className="space-y-8">
                                        {/* Warehouse Summary */}
                                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-xl text-blue-700">Warehouse: {remainingSpaceData.warehouse.name}</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="text-sm text-blue-600 font-medium">Total Space</div>
                                                    <div className="text-xl font-bold text-blue-800">{remainingSpaceData.warehouse.total.toLocaleString()} cm³</div>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="text-sm text-blue-600 font-medium">Dimensions</div>
                                                    <div className="text-xl font-bold text-blue-800">
                                                        {remainingSpaceData.warehouse.dimensions.width} × {remainingSpaceData.warehouse.dimensions.length} × {remainingSpaceData.warehouse.dimensions.height} cm
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                                                <div
                                                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                                                    style={{ width: `${remainingSpaceData.warehouse.total ? (remainingSpaceData.warehouse.used / remainingSpaceData.warehouse.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 text-xs font-medium mt-1 mb-2">
                                                {(() => {
                                                    // รวม shelves ของทุก rack ทุก zone
                                                    const allShelves = remainingSpaceData.zones
                                                        .flatMap((zone: any) => zone.racks)
                                                        .flatMap((rack: any) => rack.shelves);
                                                    const warehouseTotalFromShelves = allShelves.reduce((sum: number, shelf: any) => sum + (shelf.total || 0), 0);
                                                    const warehouseUsedFromShelves = allShelves.reduce((sum: number, shelf: any) => sum + (shelf.used || 0), 0);
                                                    const warehouseRemainingFromShelves = warehouseTotalFromShelves - warehouseUsedFromShelves;
                                                    return <>
                                                <span className="text-left text-blue-700">
                                                            Total: <span className="text-blue-800">{warehouseTotalFromShelves.toLocaleString()} cm³</span>
                                                </span>
                                                <span className="text-center text-blue-700">
                                                            Used: <span className="text-blue-800">{warehouseUsedFromShelves.toLocaleString()} cm³</span>
                                                </span>
                                                <span className="text-right text-blue-700">
                                                            Remaining: <span className="text-blue-800">{warehouseRemainingFromShelves.toLocaleString()} cm³</span>
                                                </span>
                                                    </>;
                                                })()}
                                            </div>
                                        </div>

                                        {/* Zones with nested Racks and Shelves */}
                                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                            <h4 className="font-bold text-xl mb-4 text-green-700">Zones</h4>
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                {remainingSpaceData.zones.map((zone: any) => {
                                                    const zoneTotal = zone.racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'total'), 0);
                                                    const zoneUsed = zone.racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'used'), 0);
                                                    const zoneRemaining = zone.racks.reduce((sum: number, rack: any) => sum + sumShelf(rack.shelves, 'remaining'), 0);
                                                    return (
                                                        <div key={zone.master_zone_id} className="bg-green-50 rounded-lg p-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="font-semibold text-green-800">{zone.master_zone_name}</span>
                                                                <span className="text-sm text-green-600">{zone.cubic_centimeter_zone.toLocaleString()} cm³</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                                <div
                                                                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                                    style={{ width: `${zone.cubic_centimeter_zone ? (zone.used / zone.cubic_centimeter_zone) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-3 text-xs font-medium mt-1 mb-2">
                                                                <span className="text-left text-green-700">
                                                                    Total: <span className="text-green-800">{zoneTotal.toLocaleString()} cm³</span>
                                                                </span>
                                                                <span className="text-center text-green-700">
                                                                    Used: <span className="text-green-800">{zoneUsed.toLocaleString()} cm³</span>
                                                                </span>
                                                                <span className="text-right text-green-700">
                                                                    Remaining: <span className="text-green-800">{(zoneTotal - zoneUsed).toLocaleString()} cm³</span>
                                                                </span>
                                                            </div>
                                                            {/* Racks in Zone */}
                                                            {zone.racks.length > 0 && (
                                                                <div className="ml-4 mt-2 space-y-2">
                                                                    <div className="font-semibold text-yellow-700 mb-1">Racks</div>
                                                                    {zone.racks.map((rack: any) => (
                                                                        <div key={rack.master_rack_id} className="bg-yellow-50 rounded-lg p-3 mb-1">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className="font-semibold text-yellow-800">{rack.master_rack_name}</span>
                                                                                <span className="text-sm text-yellow-600">{rack.cubic_centimeter_rack.toLocaleString()} cm³</span>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                <div
                                                                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                                                                    style={{ width: `${rack.cubic_centimeter_rack ? (rack.used / rack.cubic_centimeter_rack) * 100 : 0}%` }}
                                                                                />
                                                                            </div>
                                                                            <div className="grid grid-cols-3 text-xs font-medium mt-1 mb-2">
                                                                                <span className="text-left text-yellow-700">
                                                                                    Total: <span className="text-yellow-800">{sumShelf(rack.shelves, 'total').toLocaleString()} cm³</span>
                                                                                </span>
                                                                                <span className="text-center text-yellow-700">
                                                                                    Used: <span className="text-yellow-800">{sumShelf(rack.shelves, 'used').toLocaleString()} cm³</span>
                                                                                </span>
                                                                                <span className="text-right text-yellow-700">
                                                                                    Remaining: <span className="text-yellow-800">{(sumShelf(rack.shelves, 'total') - sumShelf(rack.shelves, 'used')).toLocaleString()} cm³</span>
                                                                                </span>
                                                                            </div>
                                                                            {/* Shelves in Rack */}
                                                                            {rack.shelves.length > 0 && (
                                                                                <div className="ml-4 mt-1 space-y-1">
                                                                                    <div className="font-semibold text-purple-700 mb-1">Shelves</div>
                                                                                    {rack.shelves.map((shelf: any) => (
                                                                                        <div key={shelf.master_shelf_id} className="bg-purple-50 rounded p-2 mb-1">
                                                                                            <div className="flex justify-between items-center mb-1">
                                                                                                <span className="font-semibold text-purple-800">{shelf.master_shelf_name}</span>
                                                                                                <span className="text-xs text-purple-600">{shelf.cubic_centimeter_shelf.toLocaleString()} cm³</span>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                                <div
                                                                                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                                                                                    style={{ width: `${shelf.total ? (shelf.used / shelf.total) * 100 : 0}%` }}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="grid grid-cols-3 text-xs font-medium mt-1">
                                                                                                <span className="text-left text-purple-700">
                                                                                                    Total: <span className="text-purple-800">{shelf.total.toLocaleString()} cm³</span>
                                                                                                </span>
                                                                                                <span className="text-center text-purple-700">
                                                                                                    Used: <span className="text-purple-800">{shelf.used.toLocaleString()} cm³</span>
                                                                                                </span>
                                                                                                <span className="text-right text-purple-700">
                                                                                                    Remaining: <span className="text-purple-800">{(shelf.total - shelf.used).toLocaleString()} cm³</span>
                                                                                                </span>
                                                                                            </div>
                                                                                            {/* เพิ่มแสดงกล่องใน shelf */}
                                                                                            {shelf.boxes && shelf.boxes.length > 0 && (
                                                                                                <div className="mt-2 ml-2">
                                                                                                    <div className="font-semibold text-pink-700 mb-1">Boxes</div>
                                                                                                    {shelf.boxes.map((box: any, idx: number) => (
                                                                                                        <div key={box.cal_box_id || idx} className="text-xs text-pink-800">
                                                                                                            Box ID: {box.cal_box_id} | Qty: {box.count} | Volume: {box.cubic_centimeter_box}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <Button 
                                            onClick={() => {
                                                setOpenRemainingSpace(false);
                                                setShowDetails(false);
                                            }} 
                                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                    </>
                                )}
                            </RemainingSpaceDialog.Description>
                        </RemainingSpaceDialog.Content>
                    </RemainingSpaceDialog.Root>
                )}
            </div>
        </div>
    );
}

export default CalWarehouseTable; 