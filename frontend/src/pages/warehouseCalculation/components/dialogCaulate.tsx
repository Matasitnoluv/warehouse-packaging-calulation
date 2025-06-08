import { postBoxInShelfOnStorage } from "@/services/box_in_shelf_onstorage.services";
import { Dialog, Button } from "@radix-ui/themes";
import { ShelfWithFitBoxes, CalculateSummary, BoxPlacement } from "../type";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useCalculateContext } from "../context/useCalculateCotext";

import { TypeMsshelfAll, TypeMsshelfResponse } from "@/types/response/reponse.msshelf";
import { TypeMsrack } from "@/types/response/reponse.msrack";
import { TypeCalBox } from "@/types/response/reponse.cal_box";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct copy";
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
                            box_no: box.box_no,
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
                    box_no: box.box_no,
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



export async function saveShelfPayload(
    shelfDataList: ShelfWithFitBoxes[],
    meta: {
        document_warehouse_no: string;
        master_zone_id: string;
        master_warehouse_id: string;
    }
) {

    const payload = shelfDataList
        .map((shelf) => {
            const validBoxes = shelf.fitBoxes.filter(
                (box) => box.cal_box_id && box.cal_box_id !== ""
            );
            if (validBoxes.length === 0) return null;

            return {
                master_shelf_id: shelf.shelf_id,
                master_zone_id: meta.master_zone_id,
                document_warehouse_no: meta.document_warehouse_no,
                master_warehouse_id: meta.master_warehouse_id,
                fitBoxes: validBoxes.map((box) => ({
                    cal_box_id: box.cal_box_id,
                    master_warehouse_id: meta.master_warehouse_id,
                    master_zone_id: meta.master_zone_id,
                    document_product_no: box.document_product_no,
                    cubic_centimeter_box: box.cubic_centimeter_box,
                    count: box.count || 1,
                    total_volume: box.cubic_centimeter_box * (box.count || 1),
                })),
            };
        })
        .filter(Boolean);

    if (payload.length === 0) {
        return { success: false, results: [] };
    }
    console.log("payload", payload);
    const results = await Promise.all(
        payload.map(async (shelfData) => {
            try {
                if (!shelfData) return null;
                const response = await postBoxInShelfOnStorage(shelfData);
                return response;
            } catch (error) {
                console.error(`Error saving shelf ${shelfData?.master_shelf_id}:`, error);
                return null;
            }
        })
    );

    const allSuccessful = results.every((r) => r && r.success);
    return { success: allSuccessful, results };
}




const DialogCaulate = ({ shelfBoxStorage }: { shelfBoxStorage?: TypeShelfBoxStorage[] | undefined }) => {
    const { showCalculateDialog, setShowCalculateDialog, rack, shelf, boxs, zone, document, warehouseNo, warehouse, zoneName } = useCalculateContext();
    const [tempShelfData, setTempShelfData] = useState<ShelfWithFitBoxes[]>([]);
    const calculateSummary: CalculateSummary | undefined = useMemo(() => {
        if (boxs && rack && shelf && zone && document && shelfBoxStorage) {
            const storedCalBoxIds = shelfBoxStorage.map((box: TypeShelfBoxStorage) => box.cal_box.cal_box_id);
            const newBoxes = boxs.filter((box) => !storedCalBoxIds.includes(box.cal_box_id));
            const normalizedStoredBoxes = shelfBoxStorage
                .sort((a: TypeShelfBoxStorage, b: TypeShelfBoxStorage) => new Date(a.stored_date ?? new Date()).getTime() - new Date(b.stored_date ?? new Date()).getTime())
                .map((box: TypeShelfBoxStorage) => ({
                    cal_box_id: box.cal_box_id,
                    cal_box: box,
                    count: box.count,
                    cubic_centimeter_box: box.cal_box.cubic_centimeter_box,
                    document_product_no: box.cal_box.document_product_no,
                    box_no: box.cal_box.box_no,
                    master_warehouse_id: warehouse,
                    master_zone_id: zone
                }));
            console.log("normalizedStoredBoxes", normalizedStoredBoxes);
            // Calculate placements
            const formattedNewBoxes = newBoxes.map((box) => ({
                cal_box_id: box.cal_box_id,
                cal_box: box,
                count: box.count,
                cubic_centimeter_box: box.cubic_centimeter_box,
                document_product_no: box.document_product_no,
                box_no: box.box_no,
                master_warehouse_id: warehouse,
                master_zone_id: zone
            })).sort((a, b) => Number(a.box_no) - Number(b.box_no));;

            const allBoxesToCalculate = Array.from(
                new Map(
                    [...normalizedStoredBoxes, ...formattedNewBoxes].map((box) => [box.cal_box_id, box])
                ).values()
            );
            console.log("allBoxesToCalculate", allBoxesToCalculate);
            return {
                boxPlacements: calculateBoxPlacement(allBoxesToCalculate as unknown as TypeCalBox[], rack, shelf),
                racks: rack,
                shelves: shelf,
                zone,
                document
            };
        }
        return undefined;
    }, [boxs, rack, shelf, zone, document, shelfBoxStorage]);

    useEffect(() => {
        if (!calculateSummary) return;

        const newShelfData: ShelfWithFitBoxes[] = [];

        for (const rack of calculateSummary.racks) {
            const shelvesInRack = calculateSummary.shelves.filter(
                (shelf) => shelf.master_rack_id === rack.master_rack_id
            );

            for (const shelf of shelvesInRack) {
                const fitBoxes = (calculateSummary.boxPlacements || [])
                    .filter(
                        (bp) =>
                            bp.canFit &&
                            bp.suggestedShelf?.master_shelf_id === shelf.master_shelf_id
                    )
                    .map((bp) => ({
                        cal_box_id: bp.box.cal_box_id,
                        document_product_no: bp.box.document_product_no,
                        box_no: bp.box.box_no,
                        cubic_centimeter_box: bp.box.cubic_centimeter_box,
                        count: bp.box.count || 1,
                    }));

                if (fitBoxes.length > 0) {
                    newShelfData.push({
                        shelf_id: shelf.master_shelf_id,
                        shelf_name: shelf.master_shelf_name,
                        master_rack_id: shelf.master_rack_id,
                        fitBoxes: fitBoxes as TypeCalBox[],
                    });
                }
            }
        }

        setTempShelfData(newShelfData);
    }, [calculateSummary]);

    const handleSave = async () => {
        if (!document || !zone || !warehouse || !warehouseNo) {
            alert("Missing required data!");
            return;
        }

        console.log("tempShelfData", tempShelfData);
        const response = await saveShelfPayload(tempShelfData, {
            document_warehouse_no: warehouseNo,
            master_zone_id: zone,
            master_warehouse_id: warehouse,
        });

        if (response) {
            alert("Successfully saved all shelf data!");
            setShowCalculateDialog(false);
        } else {
            alert("Some shelves failed to save. Please check the console for details.");
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
                        <strong>Zone:</strong> {zoneName}
                        <br />
                        <strong>Document:</strong> {calculateSummary.document}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {tempShelfData.map((shelf) => {
                    return (
                        <div key={shelf.shelf_id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="font-bold text-blue-800 mb-2">
                                Rack: {shelf.master_rack_id}
                            </div>

                            <div className="ml-4 mb-4">
                                <div className="font-semibold text-gray-700">
                                    Shelf: {shelf.shelf_name}
                                </div>

                                <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-md text-sm text-green-900">
                                    <div className="font-semibold mb-1">
                                        ✅ กล่องที่สามารถใส่ได้ใน{" "}
                                        <span className="underline">{shelf.shelf_name}</span>:
                                    </div>
                                    <ul className="list-disc ml-5">
                                        {shelf.fitBoxes.map((box, i) => (
                                            <li key={i}>
                                                Doc: {box.document_product_no}, Box No: {box.box_no} Volume: {box.cubic_centimeter_box}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            <div className="flex-none mt-6 flex justify-end gap-4 border-t pt-4">
                <Button
                    onClick={handleSave}
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