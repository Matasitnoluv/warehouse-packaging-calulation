import { getRemaining } from "@/services/shelfBoxStorage.services";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@radix-ui/themes";
import { ZoneData, RackData, ShelfData } from "@/types/response/response.remainingSpace";

interface DialogRemainingProps {
    master_warehouse_id: string;
    onClose: () => void;
}

export const DialogRemaining = ({ master_warehouse_id, onClose }: DialogRemainingProps) => {
    const {
        data,
        status
    } = useQuery({
        queryKey: ['Remaining', master_warehouse_id],
        queryFn: () => getRemaining(master_warehouse_id!),
        enabled: !!master_warehouse_id,
    });
    // console.log(data)
    // ดึงข้อมูลจาก responseObject ที่ถูกต้อง
    const remainingData = data?.responseObject;
    const warehouse = remainingData?.warehouse;
    const zones = remainingData?.zones || [];

    if (status === 'pending') {
        return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
    }

    if (status === 'error' || !remainingData) {
        return <div className="text-center py-8 text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;
    }

    return (
        <>
            <div className="space-y-8">
                {/* Warehouse Summary */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-xl text-blue-700">Warehouse Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Total Space</div>
                            <div className="text-xl font-bold text-blue-800">{warehouse?.total.toLocaleString()} cm³</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Used Space</div>
                            <div className="text-xl font-bold text-blue-800">{warehouse?.used.toLocaleString()} cm³</div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                        <div
                            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${warehouse?.total ? (warehouse?.used / warehouse.total) * 100 : 0}%` }}
                        />
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-2">
                        <span className="text-gray-600">Used: {warehouse?.used.toLocaleString()} cm³</span>
                        <span className="ml-2 text-blue-600">
                            (Remaining: {warehouse?.remain.toLocaleString()} cm³)
                        </span>
                    </div>
                </div>

                {/* Zones with nested Racks and Shelves */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <h4 className="font-bold text-xl mb-4 text-green-700">Zones</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {zones.map((zone: ZoneData) => (
                            <div key={zone.zoneId} className="bg-green-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-green-800">{zone.name}</span>
                                    <span className="text-sm text-green-600">{zone.total.toLocaleString()} cm³</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${zone.total ? (zone.used / zone.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                                    <span>Used: {zone.used.toLocaleString()} cm³</span>
                                    <span className="text-green-600">
                                        (Remaining: {zone.remain.toLocaleString()} cm³)
                                    </span>
                                </div>

                                {/* Racks in Zone */}
                                {zone.racks && zone.racks.length > 0 && (
                                    <div className="ml-4 mt-2 space-y-2">
                                        <div className="font-semibold text-yellow-700 mb-1">Racks</div>
                                        {zone.racks.map((rack: RackData) => (
                                            <div key={rack.rackId} className="bg-yellow-50 rounded-lg p-3 mb-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-yellow-800">{rack.name}</span>
                                                    <span className="text-sm text-yellow-600">{rack.total.toLocaleString()} cm³</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${rack.total ? (rack.used / rack.total) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 mt-1 mb-1">
                                                    <span>Used: {rack.used.toLocaleString()} cm³</span>
                                                    <span className="text-yellow-600">
                                                        (Remaining: {rack.remain.toLocaleString()} cm³)
                                                    </span>
                                                </div>

                                                {/* Shelves in Rack */}
                                                {rack.shelves && rack.shelves.length > 0 && (
                                                    <div className="ml-4 mt-1 space-y-1">
                                                        <div className="font-semibold text-purple-700 mb-1">Shelves</div>
                                                        {rack.shelves.map((shelf: ShelfData) => (
                                                            <div key={shelf.shelfId} className="bg-purple-50 rounded p-2 mb-1">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-semibold text-purple-800">{shelf.name}</span>
                                                                    <span className="text-xs text-purple-600">{shelf.total.toLocaleString()} cm³</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                                                        style={{ width: `${shelf.total ? (shelf.used / shelf.total) * 100 : 0}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                                    <span>Used: {shelf.used.toLocaleString()} cm³</span>
                                                                    <span className="text-purple-600">
                                                                        (Remaining: {shelf.remain.toLocaleString()} cm³)
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
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Close
                </Button>
            </div>
        </>
    );
};
