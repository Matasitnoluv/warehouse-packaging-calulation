import { useZoneQuery } from "@/services/queriesHook";
import { Layers } from "lucide-react";
import { useEffect, useMemo } from "react";

export const SelectZoneSingle = ({
    selectedZone,
    setSelectedZone,
    className,
    master_warehouse_id,
    setMasterWarehouseId
}: {
    className?: string;
    selectedZone: string;
    master_warehouse_id?:string;
    setSelectedZone: React.Dispatch<React.SetStateAction<string>>;
    setMasterWarehouseId?: React.Dispatch<React.SetStateAction<string>>
}) => {
    const { data: zones, status } = useZoneQuery();
        const zonesData = useMemo(()=>Array.isArray(zones?.responseObject) ? zones.responseObject : [],[zones?.responseObject]);
    
    useEffect(()=>{

        if(setMasterWarehouseId && selectedZone){
          const master_warehouse_id =  zonesData.find((z)=>z.master_zone_id === selectedZone)?.master_warehouse_id
          if(master_warehouse_id) setMasterWarehouseId(master_warehouse_id);
        }
    },[setMasterWarehouseId, selectedZone, zonesData])
    if (status === "pending") return "load";

    return (
        <div className={className}>
            <label className="flex w-full text-xl font-bold text-gray-800 mb-2 items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> เลือก Zone
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
            >
                <option value="">-- เลือก Zone --</option>
           {(master_warehouse_id
  ? zonesData.filter(z => z.master_warehouse_id === master_warehouse_id)
  : zonesData
).map(zone => (
  <option key={zone.master_zone_id} value={zone.master_zone_id}>
    {zone.master_zone_name}
  </option>
))}
            </select>
        </div>
    );
}; 