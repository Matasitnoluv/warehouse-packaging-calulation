import { useCallback, useEffect, useRef, useState } from "react";
import _ from "lodash";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
  rectIntersection,
} from "@dnd-kit/core";
import { ShelfZone } from "./ShelfZone";
import { TypeWarehouseCompile } from "@/types/response/reponse.mswarehouse";
import { TypeCalBox } from "@/types/response/reponse.cal_box";
import { CalculateManageProps, ShelfMap } from "../type";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct";

const FormateCalBoxToShelfBoxStrorage = ({
  box,
  warehouseId,
  master_rack_id,
  master_shelf_id,
  master_zone_id, cal_warehouse_id
}: {
  box: TypeCalBox;
  warehouseId: string;
  cal_warehouse_id: string;
  master_rack_id: string;
  master_shelf_id: string;
  master_zone_id: string;
}): TypeShelfBoxStorage => {
  return {
    storage_id: '', // ปล่อยให้ backend สร้าง หรือใส่ uuid()
    master_shelf_id: master_shelf_id,
    cal_box_id: box.cal_box_id,
    stored_date: new Date(),
    stored_by: null,
    total_volume: 0,
    status: 'stored',
    position: null,
    cal_box: { ...box },
    cal_warehouse_id,
    cubic_centimeter_box: box.cubic_centimeter_box ?? null,
    count: box.count ?? null,
    box_no: box.box_no ?? null,
    master_warehouse_id: warehouseId,
    master_zone_id: master_zone_id,
    master_rack_id: master_rack_id,
    export: false,
    export_date: undefined,
  };
};




export const CalculateManage = ({
  storage,
  boxs,
  master_warehouse_id,
  cal_warehouse_id,
  onCompiles
}: CalculateManageProps) => {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(MouseSensor)
  );

  const [shelfMap, setShelfMap] = useState<ShelfMap>({});
  const initialShelfMap = useRef<ShelfMap>({}); // ✅ เก็บค่าเริ่มต้นเพื่อใช้เปรียบเทียบ

  const StorageCompile = useCallback(() => {
    if (!storage) return {};
    const map: ShelfMap = {};

    storage.masterzone?.forEach((zone) => {
      zone.racks?.forEach((rack) => {
        rack.shelves?.forEach((shelf) => {
          const existingBoxes = (shelf.stored_boxes || []).slice();
          const sortedBoxes = existingBoxes
            .filter((b) => !b.export) // ✅ กรองกล่องที่ exported แล้ว
            .sort((a, b) => {
              if (a.position == null) return 1;
              if (b.position == null) return -1;
              return a.position - b.position;
            });

          map[shelf.master_shelf_id] = {
            ...shelf,
            stored_boxes: sortedBoxes,
            remainingVolume:
              shelf.cubic_centimeter_shelf - _.sumBy(sortedBoxes, (b) => b.cubic_centimeter_box || 0),
            totalVolume: shelf.cubic_centimeter_shelf,
            zoneId: zone.master_zone_id,
            rackId: rack.master_rack_id,
          };
        });
      });
    });

    return map;
  }, [storage]);

  const distributeBoxes = useCallback(
    (boxes: TypeCalBox[], shelfMap: ShelfMap): ShelfMap => {
      const newMap: ShelfMap = { ...shelfMap };

      for (const box of boxes) {
        if (!master_warehouse_id || !cal_warehouse_id) continue;

        const alreadyPlaced = Object.values(newMap).some((shelf) =>
          shelf.stored_boxes.some((b) => b.cal_box_id === box.cal_box_id)
        );
        if (alreadyPlaced) continue;

        for (const shelfId in newMap) {
          const shelf = newMap[shelfId];
          const shelfBoxStorage = FormateCalBoxToShelfBoxStrorage({
            box,
            warehouseId: master_warehouse_id,
            master_rack_id: shelf.rackId,
            master_shelf_id: shelf.master_shelf_id,
            master_zone_id: shelf.zoneId,
            cal_warehouse_id,
          });

          if (shelf.remainingVolume >= (box.cubic_centimeter_box || 0)) {
            newMap[shelfId] = {
              ...shelf,
              stored_boxes: [...shelf.stored_boxes, shelfBoxStorage],
              remainingVolume: shelf.remainingVolume - (box.cubic_centimeter_box || 0),
            };
            break;
          }
        }
      }

      return newMap;
    },
    [master_warehouse_id, cal_warehouse_id]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    let sourceShelfId: string | null = null;
    let sourceIndex: number | null = null;
    let movedBox: TypeShelfBoxStorage | null = null;

    // หา shelf ต้นทางของกล่อง
    for (const shelfId in shelfMap) {
      const shelf = shelfMap[shelfId];
      const index = shelf.stored_boxes.findIndex((b) => b.cal_box_id === active.id);
      if (index !== -1) {
        sourceShelfId = shelfId;
        sourceIndex = index;
        movedBox = shelf.stored_boxes[index];
        break;
      }
    }

    if (!sourceShelfId || sourceIndex === null || !movedBox) return;

    let targetShelfId: string | null = null;
    let targetIndex: number | null = null;

    // หาว่า over.id เป็น cal_box_id ของกล่องอื่นไหม
    for (const shelfId in shelfMap) {
      const shelf = shelfMap[shelfId];
      const index = shelf.stored_boxes.findIndex((b) => b.cal_box_id === over.id);
      if (index !== -1) {
        targetShelfId = shelfId;
        targetIndex = index;
        break;
      }
    }

    // ถ้า over.id เป็น shelf id
    if (!targetShelfId) {
      if (shelfMap[over.id]) {
        targetShelfId = String(over.id);
        targetIndex = shelfMap[over.id].stored_boxes.length;
      } else {
        return;
      }
    }

    setShelfMap((prev) => {
      const newMap = { ...prev };

      // หา shelf และตำแหน่ง index เดิมของกล่องนี้ใน initialShelfMap
      const initialShelfEntry = Object.entries(initialShelfMap.current).find(
        ([, shelf]) => shelf.stored_boxes.some((b) => b.cal_box_id === movedBox.cal_box_id)
      );

      let isModified = true; // default true ถ้าไม่เจอ shelf เดิมถือว่า modified

      if (initialShelfEntry) {
        const [initialShelfId, initialShelf] = initialShelfEntry;
        const initialIndex = initialShelf.stored_boxes.findIndex((b) => b.cal_box_id === movedBox.cal_box_id);

        const targetShelf = newMap[targetShelfId!];

        // เช็คว่า zone/rack/shelf เปลี่ยนไหม
        const locationChanged =
          initialShelf.zoneId !== targetShelf.zoneId ||
          initialShelf.rackId !== targetShelf.rackId ||
          initialShelf.master_shelf_id !== targetShelf.master_shelf_id;

        // ถ้าย้าย shelf หรือ zone หรือ rack ก็ modified
        if (initialShelfId !== targetShelfId || locationChanged) {
          isModified = true;
        } else {
          // ถ้าอยู่ shelf เดิม แต่ตำแหน่ง index เปลี่ยนก็ modified
          isModified = initialIndex !== targetIndex;
        }
      }

      // ✅ กรณีย้ายตำแหน่งภายใน shelf เดิม
      if (sourceShelfId === targetShelfId) {
        const shelf = newMap[sourceShelfId];
        const newStoredBoxes = [...shelf.stored_boxes];

        // ลบกล่องเดิม
        newStoredBoxes.splice(sourceIndex, 1);
        // ปรับตำแหน่งใหม่
        newStoredBoxes.splice(targetIndex!, 0, {
          ...movedBox,
          modified: isModified,
        });

        newMap[sourceShelfId] = {
          ...shelf,
          stored_boxes: newStoredBoxes,
        };
      } else {
        // ✅ ย้ายข้าม shelf
        const sourceShelf = newMap[sourceShelfId];
        const targetShelf = newMap[targetShelfId!];

        if (targetShelf.remainingVolume >= (movedBox.cubic_centimeter_box ?? 0)) {
          // ลบจากต้นทาง
          const newSourceBoxes = [...sourceShelf.stored_boxes];
          newSourceBoxes.splice(sourceIndex!, 1);

          // เพิ่มเข้าเป้าหมายที่ตำแหน่ง targetIndex
          const newTargetBoxes = [...targetShelf.stored_boxes];
          newTargetBoxes.splice(targetIndex!, 0, {
            ...movedBox,
            modified: isModified,
            master_shelf_id: targetShelf.master_shelf_id,
            master_rack_id: targetShelf.rackId,
            master_zone_id: targetShelf.zoneId,
          });

          newMap[sourceShelfId] = {
            ...sourceShelf,
            stored_boxes: newSourceBoxes,
            remainingVolume: sourceShelf.remainingVolume + (movedBox.cubic_centimeter_box ?? 0),
          };

          newMap[targetShelfId] = {
            ...targetShelf,
            stored_boxes: newTargetBoxes,
            remainingVolume: targetShelf.remainingVolume - (movedBox.cubic_centimeter_box ?? 0),
          };
        } else {
          alert("❗ พื้นที่ shelf ไม่พอสำหรับกล่องนี้!");
        }
      }

      return newMap;
    });
  }, [shelfMap]);

  // ✅ ใช้ครั้งแรก โหลดและเซฟค่าเริ่มต้นไว้ใน initialShelfMap
  useEffect(() => {
    const initialMap = StorageCompile();
    setShelfMap(initialMap);
    initialShelfMap.current = initialMap;
  }, [StorageCompile]);

  // ✅ หากมี box ใหม่ ให้จัดเรียง
  useEffect(() => {
    if (!storage || !boxs) return;
    const emptyMap = StorageCompile();
    const filledMap = distributeBoxes(boxs, emptyMap);
    setShelfMap(filledMap);
    initialShelfMap.current = filledMap; // อัปเดต initial หากเป็นครั้งแรก
  }, [storage, boxs, StorageCompile, distributeBoxes]);

  // ✅ แจ้ง callback ว่าจัดเรียงแล้ว
  useEffect(() => {
    const allShelfBoxes: TypeShelfBoxStorage[] = Object.values(shelfMap).flatMap((shelf) => shelf.stored_boxes);
    onCompiles?.(allShelfBoxes);
  }, [onCompiles, shelfMap]);

  return (
    <div id="scroll-root" className="absolute inset-0 overflow-auto w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={() => {
          const scrollRoot = document.getElementById("scroll-root");
          if (scrollRoot) scrollRoot.style.overflow = "hidden";
        }}
        onDragEnd={(event) => {
          const scrollRoot = document.getElementById("scroll-root");
          if (scrollRoot) scrollRoot.style.overflow = "auto";
          handleDragEnd(event);
        }}
        onDragCancel={() => {
          const scrollRoot = document.getElementById("scroll-root");
          if (scrollRoot) scrollRoot.style.overflow = "auto";
        }}
      >
        <StorageRebder storage={storage} shelfMap={shelfMap} cal_warehouse_id={cal_warehouse_id!} />
      </DndContext>
    </div>
  );
};

const generateColor = (index: number) => {
  const hue = (index * 137.5) % 360; // แจก hue ให้กระจาย
  return `hsl(${hue}, 70%, 60%)`; // ปรับ saturation + lightness
};
export const StorageRebder = ({ storage, shelfMap, cal_warehouse_id }: { cal_warehouse_id: string, shelfMap: ShelfMap; storage: TypeWarehouseCompile }) => {
  return (
    <div className="lg:p-4 space-y-6">
      <h2 className="text-xl font-bold">{`Warehouse: ${storage.master_warehouse_name}`}</h2>
      {storage.masterzone?.map((zone, zoneIndex) => (
        <div key={zone.master_zone_id} className="border rounded p-4" style={{ border: `2px solid ${generateColor(zoneIndex)}` }}>
          <h3 className="text-lg font-semibold mb-2 max-sm:my-2 max-sm:mx-4">
            {`Zone ${zoneIndex + 1}: ${zone.master_zone_name}`}
          </h3>
          <div className="flex gap-3 flex-wrap">
            {_.isEmpty(zone.racks) ? (
              <span className="text-yellow-700">No racks in zone</span>
            ) : (
              zone.racks?.map((rack) => (
                <div key={rack.master_rack_id} className="border p-3 rounded shadow">
                  <h4 className="font-bold">Rack : {rack.master_rack_name}</h4>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {_.isEmpty(rack.shelves) ? (
                      <span className="text-yellow-700">No shelves in rack</span>
                    ) : (
                      rack.shelves?.map((shelf) => {
                        if (!shelf) return null;
                        const shelfWithBoxes = shelfMap[shelf.master_shelf_id];
                        return shelfWithBoxes ? (
                          <ShelfZone shelf={shelfWithBoxes} cal_warehouse_id={cal_warehouse_id} />
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
