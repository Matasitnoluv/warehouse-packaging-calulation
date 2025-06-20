import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface SortableBoxProps {
  box: TypeShelfBoxStorage;
  disabled?:boolean
}

export const BoxItem = ({ box,disabled }: SortableBoxProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: box.cal_box_id,
    disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,

     touchAction: "none",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${disabled ? 'cursor-not-allowed':'cursor-grab'} p-2 border rounded  ${disabled ?'bg-slate-300/30 text-gray-900/40': !box.storage_id ? 'bg-orange-400':box.modified ? 'bg-purple-400' : 'bg-blue-300'} `}
    >
      {box.modified && box.storage_id  && <small className="absolute -translate-x-5 text-[1]  -rotate-90 font-bold text-purple-400">M</small>}
      {!box.storage_id && <small className="absolute -translate-x-6 text-[1]  -rotate-90">New</small>}
       <div className="flex gap-3">
      <div className="font-semibold">{box.cal_box?.document_product_no}</div>
  <div className="font-semibold">{box.cal_box?.box_no}</div>
        <div>{box.cubic_centimeter_box} cm³</div>
   {/* <div>{box.master_product_name}</div> */}
   <div>{box.document_warehouse_no}</div>
        </div>
    </li>
  );
};


