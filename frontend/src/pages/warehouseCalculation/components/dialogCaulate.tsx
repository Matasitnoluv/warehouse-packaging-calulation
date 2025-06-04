import { postBoxInShelfOnStorage } from "@/services/box_in_shelf_onstorage.services";
import { Dialog, Button } from "@radix-ui/themes";
import { ShelfWithFitBoxes, CalculateSummary, ZoneType } from "../type";
import { useRef } from "react";
import { patchCalWarehouse } from "@/services/calwarehouse.services";
import { useParams } from "react-router-dom";

const DialogCaulate = ({ documentWarehouseNo, showCalculateDialog, setShowCalculateDialog, calculateSummary, zones }:
    { documentWarehouseNo: string, showCalculateDialog: boolean, setShowCalculateDialog: (value: boolean) => void, calculateSummary: CalculateSummary | null, zones: ZoneType[] }) => {
    const tempShelfDataRef = useRef<ShelfWithFitBoxes[]>([]);
    const { warehouseId: master_warehouse_id } = useParams<{ warehouseId: string }>();

    const savePayload = async () => {
        try {
            if (!documentWarehouseNo) {
                alert("Please select a warehouse document first!");
                return;
            }

            // Transform tempShelfData to match the expected payload format
            const payload = tempShelfDataRef.current.map(shelf => {
                // Filter out any boxes without cal_box_id
                const validBoxes = shelf.fitBoxes.filter(box => box.cal_box_id && box.cal_box_id !== "");
                if (validBoxes.length === 0) {
                    console.log(`Shelf ${shelf.shelf_id} has no valid boxes`);
                    return null; // Skip shelves with no valid boxes
                }

                const shelfPayload = {
                    master_shelf_id: shelf.shelf_id,
                    document_warehouse_no: documentWarehouseNo,
                    master_warehouse_id: master_warehouse_id,
                    fitBoxes: validBoxes.map(box => ({
                        cal_box_id: box.cal_box_id,
                        document_product_no: box.document_product_no,
                        cubic_centimeter_box: box.cubic_centimeter_box,
                        count: box.count || 1,
                        total_volume: box.cubic_centimeter_box * (box.count || 1)
                    }))
                };

                // console.log(`Shelf ${shelf.shelf_id} payload:`, shelfPayload);
                return shelfPayload;
            }).filter(Boolean); // Remove null entries

            // console.log("Final payload:", payload);
            if (payload.length === 0) {
                alert("No valid boxes to save! Please check if boxes have valid cal_box_id.");
                return;
            }
            // Send each shelf's data to the backend
            const results = await Promise.all(
                payload.map(async (shelfData) => {
                    if (!shelfData) return null;
                    try {
                        const response = await postBoxInShelfOnStorage(shelfData);
                        return response;
                    } catch (error) {
                        console.error(`Error saving shelf ${shelfData.master_shelf_id}:`, error);
                        return null;
                    }
                })
            );

            // Check if all requests were successful
            const allSuccessful = results.every(result => result && result.success);
            if (allSuccessful) {
                // Show success message

                alert("Successfully saved all shelf data!");
                // Close the dialog
                setShowCalculateDialog(false);
            } else {
                // Show error message
                alert("Some shelves failed to save. Please check the console for details.");
            }
        } catch (error) {
            console.error("Error saving shelf data:", error);
            alert("Failed to save shelf data. Please check the console for details.");
        }
    };




    return <Dialog.Root open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <Dialog.Content className="max-w-4xl max-h-[80vh] flex flex-col">

            <div className="flex-none">
                <Dialog.Title className="text-xl font-bold mb-4">
                    Calculation Summary
                </Dialog.Title>
                {calculateSummary && (
                    <div className="mb-4">
                        <strong>Zone:</strong> {zones.find(z => z.master_zone_id === calculateSummary.zone)?.master_zone_name || calculateSummary.zone}
                        <br />
                        <strong>Document:</strong> {calculateSummary.document}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {calculateSummary && (
                    <div>
                        <div>
                            {calculateSummary?.racks.map((rack) => (
                                <div key={rack.master_rack_id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="font-bold text-blue-800 mb-2">
                                        Rack: {rack.master_rack_name}
                                    </div>

                                    {(calculateSummary.shelves || [])
                                        .filter((shelf) => shelf.master_rack_id === rack.master_rack_id)
                                        .map((shelf) => {
                                            const fitBoxes = (calculateSummary.boxPlacements || [])
                                                .filter(
                                                    (bp) =>
                                                        bp.canFit &&
                                                        bp.suggestedShelf?.master_shelf_id === shelf.master_shelf_id
                                                )
                                                .map((bp) => {
                                                    return {
                                                        cal_box_id: bp.box.cal_box_id,
                                                        document_product_no: bp.box.document_product_no,
                                                        box_no: bp.box.box_no,
                                                        cubic_centimeter_box: bp.box.cubic_centimeter_box,
                                                        count: bp.box.count || 1
                                                    };
                                                })
                                            // .sort((a, b) => Number(a.box_no) - Number(b.box_no));

                                            if (fitBoxes.length > 0) {
                                                const existingShelfIndex = tempShelfDataRef.current.findIndex(
                                                    s => s.shelf_id === shelf.master_shelf_id
                                                );

                                                if (existingShelfIndex === -1) {
                                                    tempShelfDataRef.current.push({
                                                        shelf_id: shelf.master_shelf_id,
                                                        shelf_name: shelf.master_shelf_name,
                                                        master_rack_id: shelf.master_rack_id,
                                                        fitBoxes,
                                                    });
                                                } else {
                                                    tempShelfDataRef.current[existingShelfIndex].fitBoxes = [
                                                        ...tempShelfDataRef.current[existingShelfIndex].fitBoxes,
                                                        ...fitBoxes
                                                    ];
                                                }
                                            }

                                            return (
                                                <div key={shelf.master_shelf_id} className="ml-4 mb-4">
                                                    <div className="font-semibold text-gray-700">
                                                        Shelf: {shelf.master_shelf_name} Volume:{" "}
                                                        {shelf.cubic_centimeter_shelf}
                                                    </div>

                                                    {fitBoxes.length > 0 && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-md text-sm text-green-900">
                                                            <div className="font-semibold mb-1">
                                                                ✅ กล่องที่สามารถใส่ได้ใน{" "}
                                                                <span className="underline">{shelf.master_shelf_name}</span>:
                                                            </div>
                                                            <ul className="list-disc ml-5">
                                                                {fitBoxes.map((box, i) => (
                                                                    <li key={i}>
                                                                        Doc: {box.document_product_no}, Box No: {box.box_no} Volume: {box.cubic_centimeter_box}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-none mt-6 flex justify-end gap-4 border-t pt-4">
                <Button
                    onClick={() => savePayload()}
                    className="bg-green-500 hover:bg-green-600 text-white"
                >
                    Save
                </Button>

                <Button
                    onClick={() => setShowCalculateDialog(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                    Close
                </Button>
            </div>
        </Dialog.Content>
    </Dialog.Root>
}


export default DialogCaulate;