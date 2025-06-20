import {  useDroppable } from "@dnd-kit/core";
import { BoxItem } from "./BoxItem";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ShelfZoneProps {
  cal_warehouse_id:string,
  shelf: {
    master_shelf_id: string;
    master_shelf_name: string;
    shelf_level: number;
    stored_boxes: TypeShelfBoxStorage[];
    remainingVolume: number;
    totalVolume:number
  };
}

export const ShelfZone = ({ shelf ,cal_warehouse_id}:ShelfZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: shelf.master_shelf_id,
  });

  return (
    <SortableContext
                          key={shelf.master_shelf_id}
                          items={shelf.stored_boxes.map((b) => b.cal_box_id)}
                          strategy={verticalListSortingStrategy}
                        > 
    <div
      ref={setNodeRef}
      className={`p-2 border rounded ${isOver ? "bg-green-100" : "bg-white"} `}
    >
      <div className="font-semibold mb-1">
        🗄 Shelf {shelf.shelf_level}: {shelf.master_shelf_name}
      </div>

      {shelf.stored_boxes.length > 0 ? (
        <ul className="ml-2 text-xs flex flex-col gap-2">
          {shelf.stored_boxes.map((box) => (
            <BoxItem key={box.cal_box_id} box={box} disabled={box.cal_warehouse_id !==cal_warehouse_id }/>
          ))}
        </ul>
      ) : (
        <div className="italic text-gray-400">(Empty)</div>
      )}

      <div className="mt-1 text-xs text-gray-500">
        Remaining: {shelf.remainingVolume}cm³ / <b>{shelf.totalVolume}cm³</b>
      </div>
    </div>
    </SortableContext>
  );
};
