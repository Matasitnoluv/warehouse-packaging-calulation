import { postBoxInShelfOnStorage } from "@/services/box_in_shelf_onstorage.services";
import { Dialog, Button } from "@radix-ui/themes";
import { ShelfWithFitBoxes, CalculateSummary, BoxPlacement, BoxType } from "../type";
import { useMemo, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useCalculateContext } from "../context/useCalculateCotext";
import { useQueries } from "@tanstack/react-query";
import { getRackBoxStorageByRack } from "@/services/rackBoxStorage.services";
import { TypeMsshelfAll, TypeMsshelfResponse } from "@/types/response/reponse.msshelf";
import { TypeMsrack } from "@/types/response/reponse.msrack";
import { TypeMsbox } from "@/types/response/reponse.msbox";
import { Partial } from "lodash";
import { TypeCalMsproduct } from "@/types/response/reponse.cal_msproduct";
import { TypeCalBox } from "@/types/response/reponse.cal_box";
import { TypeMswarehouse } from "@/types/response/reponse.mswarehouse";
const calculateBoxPlacement = (
    boxes: TypeCalBox[],
    racks: TypeMsrack[],
    shelves: TypeMsshelfAll[]
): BoxPlacement[] => {
    const placements: BoxPlacement[] = [];

    let rackIndex = 0;
    let shelfIndex = 0;
    let usedShelfVolume: { [shelfId: string]: number } = {};

    // Sort shelves by level
    const sortedRacks = [...racks];
    const sortedShelves = shelves
        .slice()

    for (const box of boxes) {
        let placed = false;

        while (rackIndex < sortedRacks.length && !placed) {
            const rack = sortedRacks[rackIndex];
            const shelvesInRack = sortedShelves.filter((s: TypeMsshelfAll) => s.master_rack_id === rack.master_rack_id);

            while (shelfIndex < shelvesInRack.length && !placed) {
                const shelf = shelvesInRack[shelfIndex];
                const used = usedShelfVolume[shelf.master_shelf_id] || 0;
                const boxVolume = box.cubic_centimeter_box;

                if (used + boxVolume <= shelf.cubic_centimeter_shelf) {
                    placements.push({
                        box: {
                            ...box,
                            cal_box_id: box.cal_box_id,
                            document_product_no: box.document_product_no,
                            cubic_centimeter_box: box.cubic_centimeter_box,
                            count: box.count,
                            box_no: 0,
                            master_product_name: "",
                            code_product: ""
                        },
                        suggestedShelf: shelf,
                        suggestedRack: rack,
                        volume: boxVolume,
                        canFit: true,
                    });
                    usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
                    placed = true;
                } else {
                    shelfIndex++;
                }
            }

            if (!placed) {
                rackIndex++;
                shelfIndex = 0;
            }
        }

        if (!placed) {
            placements.push({
                box: {
                    ...box,
                    cal_box_id: box.cal_box_id,
                    document_product_no: box.document_product_no,
                    cubic_centimeter_box: box.cubic_centimeter_box,
                    count: box.count,
                    box_no: 0,
                    master_product_name: "",
                    code_product: ""
                },
                canFit: false,
                volume: box.cubic_centimeter_box * box.count,
            });
        }
    }
    return placements;
}
const DialogCaulate = () => {
    const tempShelfDataRef = useRef<ShelfWithFitBoxes[]>([]);

    const { showCalculateDialog, setShowCalculateDialog, rack, shelf, boxs, zone, document, warehouseNo, warehouse } = useCalculateContext();
    const savePayload = async () => {
        try {
            if (!document) {
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
                    document_warehouse_no: warehouseNo,
                    master_warehouse_id: warehouse,
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
            console.log(results)

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


    const calculateSummary: CalculateSummary | undefined = useMemo(() => {
        if (boxs && rack && shelf && zone && document) {
            return {
                boxPlacements: calculateBoxPlacement(boxs, rack, shelf),
                racks: rack,
                shelves: shelf,
                zone,
                document
            };
        }
        return undefined;
    }, [boxs, rack, shelf, zone, document]);
    return <Dialog.Root open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <Dialog.Content className="max-w-4xl max-h-[80vh] flex flex-col">


            {warehouseNo}

            <div className="flex-none">
                <Dialog.Title className="text-xl font-bold mb-4">
                    Calculation Summary
                </Dialog.Title>
                {calculateSummary && (
                    <div className="mb-4">
                        <strong>Zone:</strong> {zone}
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