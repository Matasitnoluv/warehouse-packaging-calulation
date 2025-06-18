import { postBoxInShelfOnStorage } from "@/services/box_in_shelf_onstorage.services";
import { Dialog, Button } from "@radix-ui/themes";
import { ShelfWithFitBoxes, CalculateSummary, BoxPlacement } from "../type";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCalculateContext } from "../context/useCalculateCotext";

import { TypeMsshelfAll } from "@/types/response/reponse.msshelf";
import { TypeMsrack } from "@/types/response/reponse.msrack";
import { TypeCalBox } from "@/types/response/reponse.cal_box";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct";
import { useQueryClient } from "@tanstack/react-query";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf } from "@/services/msshelf.services";

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
        document_product_id: string;
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
                document_product_id: meta.document_product_id,
                fitBoxes: validBoxes.map((box) => ({
                    cal_box_id: box.cal_box_id,
                    master_warehouse_id: meta.master_warehouse_id,
                    master_zone_id: meta.master_zone_id,
                    document_product_no: box.document_product_no,
                    cubic_centimeter_box: box.cubic_centimeter_box,
                    stored_date: box.stored_date ?? new Date(),
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
    const { showCalculateDialog, setShowCalculateDialog, boxs, document, documentId, warehouseNo, warehouseId, selectedZones } = useCalculateContext();
    const [zoneResults, setZoneResults] = useState<any[]>([]); // [{zone, racks, shelves, placements, tempShelfData, saveStatus}]
    const [boxesLeft, setBoxesLeft] = useState<TypeCalBox[]>([]);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!selectedZones || selectedZones.length === 0 || !boxs || !document) return;
        let boxesLeft = [...boxs];
        let results: any[] = [];
        let loadZoneData = async () => {
            setLoading(true);
            for (let i = 0; i < selectedZones.length; i++) {
                const zone = selectedZones[i];
                // โหลด rack/shelf ของ zone นี้
                const rackRes = await getMsrack(zone.id);
                const racks = rackRes.responseObject || [];
                let shelves: TypeMsshelfAll[] = [];
                for (const rack of racks) {
                    const shelfRes = await getMsshelf(rack.master_rack_id);
                    if (shelfRes.responseObject) shelves = shelves.concat(shelfRes.responseObject);
                }
                // ดึงกล่องเดิมที่มีอยู่แล้วใน zone นี้ (ไม่ filter กล่องซ้ำออก)
                let existingBoxes: TypeCalBox[] = [];
                if (shelfBoxStorage) {
                    existingBoxes = shelfBoxStorage.filter(box => box.master_zone_id === zone.id)
                        .map(box => ({
                            cal_box_id: box.cal_box_id,
                            document_product_no: box.document_product_no ?? box.cal_box?.document_product_no ?? "",
                            box_no: box.box_no ?? box.cal_box?.box_no ?? 0,
                            cubic_centimeter_box: box.cubic_centimeter_box ?? box.cal_box?.cubic_centimeter_box ?? 0,
                            count: box.count ?? box.cal_box?.count ?? 1,
                            master_zone_id: box.master_zone_id,
                            stored_date: box.stored_date,
                            master_box_name: box.cal_box?.master_box_name ?? "",
                            code_box: box.cal_box?.code_box ?? "",
                            master_product_name: box.cal_box?.master_product_name ?? "",
                            code_product: box.cal_box?.code_product ?? "",
                        })) as TypeCalBox[];
                }
                // รวมกล่องเก่าก่อน แล้วต่อด้วยกล่องใหม่ที่ต้องจัดสรรในรอบนี้
                let boxesToPlace = [...existingBoxes, ...boxesLeft];
                // เก็บ cal_box_id ของ existingBoxes สำหรับใช้ใน UI
                const existingBoxIds = existingBoxes.map(b => b.cal_box_id);
                // วางกล่องใน zone นี้
                let usedShelfVolume: { [shelfId: string]: number } = {};
                let placements: BoxPlacement[] = [];
                let tempShelfData: ShelfWithFitBoxes[] = [];
                let rackIndex = 0;
                let shelfIndex = 0;
                const sortedRacks = [...racks];
                const sortedShelves = shelves.slice();
                let placedBoxIds: string[] = [];
                for (const box of boxesToPlace as TypeCalBox[]) {
                    let placed = false;
                    rackIndex = 0;
                    shelfIndex = 0;
                    while (rackIndex < sortedRacks.length && !placed) {
                        const rack = sortedRacks[rackIndex];
                        const shelvesInRack = sortedShelves.filter((s: TypeMsshelfAll) => s.master_rack_id === rack.master_rack_id);
                        while (shelfIndex < shelvesInRack.length && !placed) {
                            const shelf = shelvesInRack[shelfIndex];
                            const used = usedShelfVolume[shelf.master_shelf_id] || 0;
                            const boxVolume = box.cubic_centimeter_box;
                            if (used + boxVolume <= shelf.cubic_centimeter_shelf) {
                                placements.push({
                                    box: { ...box },
                                    suggestedShelf: shelf,
                                    suggestedRack: rack,
                                    volume: boxVolume,
                                    canFit: true,
                                });
                                usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
                                placed = true;
                                placedBoxIds.push(box.cal_box_id);
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
                            box: { ...box },
                            canFit: false,
                            volume: box.cubic_centimeter_box * (box.count || 1),
                        });
                    }
                }
                // เตรียม tempShelfData สำหรับ UI เฉพาะกล่องที่ถูกจัดสรรใน zone นี้เท่านั้น
                for (const rack of sortedRacks as TypeMsrack[]) {
                    const shelvesInRack = sortedShelves.filter((shelf: TypeMsshelfAll) => shelf.master_rack_id === rack.master_rack_id);
                    for (const shelf of shelvesInRack as TypeMsshelfAll[]) {
                        const fitBoxes = placements.filter((bp: BoxPlacement) => bp.canFit && bp.suggestedShelf?.master_shelf_id === shelf.master_shelf_id).map((bp: BoxPlacement) => ({
                            cal_box_id: bp.box.cal_box_id,
                            document_product_no: bp.box.document_product_no,
                            box_no: bp.box.box_no,
                            cubic_centimeter_box: bp.box.cubic_centimeter_box,
                            count: bp.box.count || 1,
                            master_zone_id: zone.id,
                        }));
                        if (fitBoxes.length > 0) {
                            tempShelfData.push({
                                shelf_id: shelf.master_shelf_id,
                                shelf_name: shelf.master_shelf_name,
                                master_rack_id: shelf.master_rack_id,
                                fitBoxes: fitBoxes as TypeCalBox[],
                            });
                        }
                    }
                }
                // อัปเดต boxesLeft ให้เหลือเฉพาะกล่องใหม่ที่ยังไม่ถูกจัดสรร (canFit: false และไม่ใช่ existing)
                boxesLeft = placements.filter((bp: BoxPlacement) => !bp.canFit && boxs.some(nb => nb.cal_box_id === bp.box.cal_box_id)).map((bp: BoxPlacement) => bp.box);
                results.push({
                    zone,
                    racks: sortedRacks,
                    shelves: sortedShelves,
                    placements,
                    tempShelfData, // tempShelfData นี้จะ save เฉพาะกล่องของ zone นี้
                    saveStatus: placements.every(bp => bp.canFit),
                });
            }
            setZoneResults(results);
            setBoxesLeft(boxesLeft);
            setLoading(false);
        };
        loadZoneData();
    }, [selectedZones, boxs, document, shelfBoxStorage]);

    const handleSave = async () => {
        if (!document || !warehouseId || !warehouseNo) {
            alert("Missing required data!");
            return;
        }
        let allSuccess = true;
        for (const result of zoneResults) {
            const response = await saveShelfPayload(result.tempShelfData, {
                document_warehouse_no: warehouseNo,
                master_zone_id: result.zone.id,
                master_warehouse_id: warehouseId,
                document_product_id: documentId,
            });
            if (!response.success) allSuccess = false;
        }
        if (allSuccess) {
            alert("Successfully saved all shelf data!");
            await queryClient.invalidateQueries({ queryKey: ["cal_msproducts"] });
            setShowCalculateDialog(false);
            window.location.href = '/calwarehouseTable';
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
                {boxesLeft.length > 0 && (
                    <div className="mb-4">
                        <p className="text-red-500 font-bold">Some boxes cannot fit in the shelf</p>
                        <p className="text-red-500">Number of boxes exceeding capacity: {boxesLeft.length} Box</p>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {loading && <div className="text-center text-gray-500">Loading...</div>}
                {!loading && zoneResults.map((result, idx) => (
                    <div key={result.zone.id} className="mb-8 border-b pb-6">
                        <div className="mb-4">
                            <strong>Zone {idx + 1}:</strong> {result.zone.name}
                            <br />
                            <strong>Document:</strong> {document}
                            {!result.saveStatus && (
                                <div className="mt-2">
                                    <p className="text-red-500 font-bold">Some boxes cannot fit in the shelf</p>
                                    <p className="text-red-500">
                                        Number of boxes exceeding capacity: {result.placements.filter((box: { canFit: any; }) => !box.canFit).length} Box
                                    </p>
                                </div>
                            )}
                        </div>
                        {result.tempShelfData.map((shelf: ShelfWithFitBoxes) => (
                            <div key={shelf.shelf_id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="font-bold text-blue-800 mb-2">
                                    Rack: {result.racks.find((rack: TypeMsrack) => rack.master_rack_id === shelf.master_rack_id)?.master_rack_name}
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
                                            {shelf.fitBoxes.map((box: TypeCalBox, i: number) => {
                                                // เช็กว่าเป็นกล่องใหม่หรือกล่องเดิม
                                                const isNewBox = Array.isArray(boxs) && boxs.some((b: TypeCalBox) => b.cal_box_id === box.cal_box_id);
                                                return (
                                                    <li key={i} className={isNewBox ? 'bg-yellow-100 p-1 rounded' : ''}>
                                                        Doc: {box.document_product_no}, Box No: {box.box_no} Volume: {box.cubic_centimeter_box}
                                                        {isNewBox && <span className="ml-2 text-yellow-700">(New)</span>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex-none mt-6 flex justify-end gap-4 border-t pt-4">
                <Button
                    disabled={boxesLeft.length > 0}
                    onClick={handleSave}
                    color='green'
                >
                    {boxesLeft.length === 0 ? 'Save' : 'Not Save'}
                </Button>
                <Button
                    onClick={() => setShowCalculateDialog(false)}
                    color='gray'
                >
                    Close
                </Button>
            </div>
        </Dialog.Content>
    </Dialog.Root>
}


export default DialogCaulate;