import { useZoneQuery } from "@/services/queriesHook";
import { Layers } from "lucide-react";

export const SelectZoneSingle = ({
    selectedZone,
    setSelectedZone,
    className,
}: {
    className?: string;
    selectedZone: string;
    setSelectedZone: (zoneId: string) => void;
}) => {
    const { data: zones, status } = useZoneQuery();
    if (status === "pending") return "load";
    const zonesData = Array.isArray(zones?.responseObject) ? zones.responseObject : [];
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
                {zonesData.map(zone => (
                    <option key={zone.master_zone_id} value={zone.master_zone_id}>
                        {zone.master_zone_name}
                    </option>
                ))}
            </select>
        </div>
    );
}; 