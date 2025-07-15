import { Table, Card, AlertDialog, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCalWarehouse } from "@/services/calwarehouse.services";

import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import { AlertDialog as RemainingSpaceDialog } from "@radix-ui/themes";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf } from "@/services/msshelf.services";
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";
import CalEditButton from "./CalEditButton";
import { shelfBoxStorageService } from "@/services/shelfBoxStorage.services";
import AlrtdilogDeleteDocument from "./modals/alrtdilogDeleteDocument";
import DilogAddCalwarehouse from "./modals/dilogAddCalwarehouse";
import { DialogRemaining } from "./dialogRemaining";

const CalWarehouseTable = () => {
    const navigate = useNavigate();
    const [calculations, setCalculations] = useState<any[]>([]);
    const [openRemainingSpace, setOpenRemainingSpace] = useState(false);
    const [remainingSpaceData, setRemainingSpaceData] = useState<any>(null);
    const [warehouses, setWarehouses] = useState<TypeMswarehouse[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getCalWarehouseData = () => {
        getCalWarehouse().then((res) => {

            const sorted = res.responseObject.sort((a, b) =>
                a.document_warehouse_no.localeCompare(b.document_warehouse_no)
            );


            setCalculations(sorted);
        });
    };

    useEffect(() => {
        getCalWarehouseData();
    }, []);

    useEffect(() => {
        async function fetchWarehouses() {
            try {
                const res = await getMswarehouse();
                //console.log("Warehouse API Response:", res);
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


    const handleConfirm = async () => {
        //console.log('handleConfirm called', selectedWarehouseId);
        if (!selectedWarehouseId) {
            alert("Please select a warehouse");
            return;
        }
        setIsLoading(true);
        try {
            const data = await fetchRemainingSpaceData(selectedWarehouseId);
            //console.log('fetchRemainingSpaceData result', data);
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
            //console.log('fetchRemainingSpaceData called', warehouseId);
            // Fetch warehouse (ใช้ responseObject เหมือนหน้า Warehouse Management Details)
            const msWarehouseRes = await getMswarehouse();
            const msWarehouseList = msWarehouseRes.responseObject || [];
            const msWarehouse = (msWarehouseList as TypeMswarehouse[]).find((w) => w.master_warehouse_id === warehouseId);
            if (!msWarehouse) return null;

            // คำนวณ used space ของ warehouse
            const warehouseUsedSpaceRes = await shelfBoxStorageService.getWarehouseUsedSpace(warehouseId);
            const warehouseUsed = warehouseUsedSpaceRes.success ? warehouseUsedSpaceRes.responseObject.usedSpace : 0;
            const warehouseTotal = msWarehouse.cubic_centimeter_warehouse || 0;
            const warehouseRemaining = warehouseTotal - warehouseUsed;

            // Fetch zones
            const msZoneRes = await getMszone(msWarehouse.master_warehouse_id);
            const zones = msZoneRes.responseObject || [];
            const zoneSummaries: any[] = [];

            await Promise.all(zones.map(async (zone: any) => {
                // คำนวณ used space ของ zone
                const zoneUsedSpaceRes = await shelfBoxStorageService.getZoneUsedSpace(zone.master_zone_id);
                const zoneUsed = zoneUsedSpaceRes.success ? zoneUsedSpaceRes.responseObject.usedSpace : 0;
                const zoneTotal = zone.cubic_centimeter_zone || 0;
                const zoneRemaining = zoneTotal - zoneUsed;

                const msRackRes = await getMsrack(zone.master_zone_id);
                const racks = msRackRes.responseObject || [];
                const rackSummaries: any[] = [];

                await Promise.all(racks.map(async (rack: any) => {
                    // คำนวณ used space ของ rack
                    const rackUsedSpaceRes = await shelfBoxStorageService.getRackUsedSpace(rack.master_rack_id);
                    const rackUsed = rackUsedSpaceRes.success ? rackUsedSpaceRes.responseObject.usedSpace : 0;
                    const rackTotal = rack.cubic_centimeter_rack || 0;
                    const rackRemaining = rackTotal - rackUsed;

                    const msShelfRes = await getMsshelf(rack.master_rack_id);
                    const shelves = msShelfRes.responseObject || [];
                    const shelfSummaries: any[] = [];

                    await Promise.all(shelves.map(async (shelf: any) => {
                        // คำนวณ used space ของ shelf
                        const shelfUsedSpaceRes = await shelfBoxStorageService.getShelfUsedSpace(shelf.master_shelf_id);
                        const shelfUsed = shelfUsedSpaceRes.success ? shelfUsedSpaceRes.responseObject.usedSpace : 0;
                        const shelfTotal = shelf.cubic_centimeter_shelf || 0;
                        const shelfRemaining = shelfTotal - shelfUsed;

                        shelfSummaries.push({
                            ...shelf,
                            total: shelfTotal,
                            used: shelfUsed,
                            remaining: shelfRemaining,
                        });
                    }));

                    rackSummaries.push({
                        ...rack,
                        total: rackTotal,
                        used: rackUsed,
                        remaining: rackRemaining,
                        shelves: shelfSummaries,
                    });
                }));

                zoneSummaries.push({
                    ...zone,
                    total: zoneTotal,
                    used: zoneUsed,
                    remaining: zoneRemaining,
                    racks: rackSummaries,
                });
            }));

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
                                                    {<CalEditButton calWarehouse={cal_warehouse} />}


                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <AlrtdilogDeleteDocument
                                                        getCalWarehouseData={getCalWarehouseData}
                                                        cal_warehouse_id={cal_warehouse.cal_warehouse_id}
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
                                    <DialogRemaining
                                        master_warehouse_id={selectedWarehouseId}
                                        onClose={() => {
                                            setOpenRemainingSpace(false);
                                            setShowDetails(false);
                                        }}
                                    />
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