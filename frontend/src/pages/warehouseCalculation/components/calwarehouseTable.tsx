import { Table, Card, AlertDialog, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCalWarehouse } from "@/services/calwarehouse.services";

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
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";
import EditButton from "./CalEditButton";
import CalEditButton from "./CalEditButton";

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
            //console.log(res);
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

            // Fetch zones
            const msZoneRes = await getMszone(msWarehouse.master_warehouse_id);
            const zones = msZoneRes.responseObject || [];

            // Fetch racks and shelves nested
            let allShelvesRemaining: number = 0;
            let zoneSummaries: any[] = [];
            await Promise.all(zones.map(async (zone: any) => {
                const msRackRes = await getMsrack(zone.master_zone_id);
                const racks = msRackRes.responseObject || [];
                let zoneShelvesRemaining: number = 0;
                let rackSummaries: any[] = [];
                await Promise.all(racks.map(async (rack: any) => {
                    const msShelfRes = await getMsshelf(rack.master_rack_id);
                    const shelves = msShelfRes.responseObject || [];
                    // Shelves remaining sum
                    const rackShelvesRemaining = shelves.reduce((sum: number, s: any) => sum + (s.cubic_centimeter_shelf || 0), 0);
                    zoneShelvesRemaining += rackShelvesRemaining;
                    allShelvesRemaining += rackShelvesRemaining;
                    rackSummaries.push({
                        ...rack,
                        used: shelves.reduce((sum: number, s: any) => sum + (s.cubic_centimeter_shelf || 0), 0),
                        remaining: rackShelvesRemaining,
                        shelves: shelves.map((shelf: any) => ({
                            ...shelf,
                            used: 0, // If you have box storage, sum used here
                            remaining: shelf.cubic_centimeter_shelf // - used
                        }))
                    });
                }));
                zoneSummaries.push({
                    ...zone,
                    used: rackSummaries.reduce((sum: number, r: any) => sum + (r.used || 0), 0),
                    remaining: zoneShelvesRemaining,
                    racks: rackSummaries
                });
            }));

            // Warehouse summary
            const warehouseUsed = zoneSummaries.reduce((sum: number, z: any) => sum + (z.used || 0), 0);
            const warehouseRemaining = allShelvesRemaining;

            return {
                warehouse: {
                    total: msWarehouse.cubic_centimeter_warehouse,
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
                                                <div className="text-right text-sm text-gray-500 mt-2">
                                                    <span className="text-gray-600">Used: {remainingSpaceData.warehouse.used.toLocaleString()} cm³</span>
                                                    <span className="ml-2 text-blue-600">
                                                        (Remaining: {remainingSpaceData.warehouse.remaining.toLocaleString()} cm³)
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Zones with nested Racks and Shelves */}
                                            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                                <h4 className="font-bold text-xl mb-4 text-green-700">Zones</h4>
                                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                    {remainingSpaceData.zones.map((zone: any) => (
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
                                                            <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                                                                <span>Used: {zone.used.toLocaleString()} cm³</span>
                                                                <span className="text-green-600">
                                                                    (Remaining: {zone.remaining.toLocaleString()} cm³)
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
                                                                            <div className="flex justify-between text-xs text-gray-500 mt-1 mb-1">
                                                                                <span>Used: {rack.used.toLocaleString()} cm³</span>
                                                                                <span className="text-yellow-600">
                                                                                    (Remaining: {rack.remaining.toLocaleString()} cm³)
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
                                                                                                    style={{ width: `${shelf.cubic_centimeter_shelf ? (shelf.used / shelf.cubic_centimeter_shelf) * 100 : 0}%` }}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                                                                <span>Used: {shelf.used.toLocaleString()} cm³</span>
                                                                                                <span className="text-purple-600">
                                                                                                    (Remaining: {shelf.remaining.toLocaleString()} cm³)
                                                                                                </span>
                                                                                            </div>
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