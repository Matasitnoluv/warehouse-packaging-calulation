import { useEffect, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { getMszone, deleteMszone } from '@/services/mszone.services';
import { TypeMszoneAll } from '@/types/response/reponse.mszone';
import RackList from './RackList';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DialogAddZone from "./dilogAddZone";
import DialogEditZone from "./dilogEditZone";

// Function to determine color based on usage percentage
const getUsageColor = (percentage: number): string => {
    if (percentage < 50) return '#22c55e'; // green-500
    if (percentage < 75) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
};

interface ZoneListProps {
    warehouseId: string;
    warehouseName: string;
    warehouseVolume: number;
}

const ZoneList = ({ warehouseId, warehouseName, warehouseVolume }: ZoneListProps) => {
    const [zones, setZones] = useState<TypeMszoneAll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usedSpace, setUsedSpace] = useState<number>(0);
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

    const fetchZones = async () => {
        setLoading(true);
        try {
            const response = await getMszone(warehouseId);
            if (response.success) {
                const zoneData = response.responseObject || [];
                setZones(zoneData);

                // Calculate used space
                const totalUsedSpace = zoneData.reduce((total: number, zone: any) => total + (zone.cubic_centimeter_zone || 0), 0);
                setUsedSpace(totalUsedSpace);
            } else {
                setError(response.message || "Failed to fetch zones");
            }
        } catch (err) {
            setError("An error occurred while fetching zones");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchZones();
        // Reset expanded zones when warehouse changes
        setExpandedZones(new Set());
    }, [warehouseId]);

    const toggleZoneExpand = (zoneId: string) => {
        const newExpandedZones = new Set(expandedZones);
        if (newExpandedZones.has(zoneId)) {
            newExpandedZones.delete(zoneId);
        } else {
            newExpandedZones.add(zoneId);
        }
        setExpandedZones(newExpandedZones);
    };

    const handleDeleteZone = async (zoneId: string) => {
        if (!confirm("Are you sure you want to delete this zone?")) {
            return;
        }

        try {
            const response = await deleteMszone(zoneId);
            if (response.success) {
                fetchZones(); // Refresh the list
            } else {
                alert(response.message || "Failed to delete zone");
            }
        } catch (err) {
            alert("An error occurred while deleting the zone");
            console.error(err);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading zones...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with usage stats and add button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                        Zones in {warehouseName}
                    </h3>
                    <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">
                            Space Usage: {usedSpace.toLocaleString()} / {warehouseVolume.toLocaleString()} cm³
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(warehouseVolume > 0 ? (usedSpace / warehouseVolume) * 100 : 0, 100)}%`,
                                    backgroundColor: warehouseVolume > 0 ?
                                        (usedSpace / warehouseVolume) * 100 < 40 ? '#22c55e' :
                                            (usedSpace / warehouseVolume) * 100 < 70 ? '#f97316' : '#ef4444'
                                        : '#22c55e'
                                }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {warehouseVolume > 0 ? ((usedSpace / warehouseVolume) * 100).toFixed(2) : 0}% used
                        </div>
                    </div>
                </div>
                <DialogAddZone
                    warehouseId={warehouseId}
                    warehouseName={warehouseName}
                    warehouseVolume={warehouseVolume}
                    onZoneAdded={fetchZones}
                />
            </div>

            {zones.length > 0 ? (
                <div className="space-y-3">
                    {zones.map((zone) => (
                        <div
                            key={zone.master_zone_id}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            {/* Zone Header - Always visible */}
                            <div
                                className="p-4 cursor-pointer flex justify-between items-center"
                                onClick={() => toggleZoneExpand(zone.master_zone_id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                            {zone.master_zone_name}
                                            {expandedZones.has(zone.master_zone_id) ? (
                                                <ChevronDown className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{zone.width} × {zone.length} × {zone.height} cm</span>
                                            <span>{zone.cubic_centimeter_zone.toLocaleString()} cm³</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Space usage indicator */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(warehouseVolume > 0 ? (zone.cubic_centimeter_zone / warehouseVolume) * 100 : 0, 100)}%`,
                                                    backgroundColor: getUsageColor((zone.cubic_centimeter_zone / warehouseVolume) * 100)
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: getUsageColor((zone.cubic_centimeter_zone / warehouseVolume) * 100) }}>
                                            {warehouseVolume > 0 ? ((zone.cubic_centimeter_zone / warehouseVolume) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1">
                                        <DialogEditZone
                                            zone={zone}
                                            onZoneUpdated={fetchZones}
                                        />
                                        <Button
                                            size="1"
                                            color="red"
                                            variant="soft"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteZone(zone.master_zone_id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Zone Details - Only visible when expanded */}
                            {expandedZones.has(zone.master_zone_id) && (
                                <div className="border-t border-gray-100 bg-gray-50 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 mb-1">Dimensions (W×L×H)</div>
                                            <div className="font-medium text-gray-700 text-lg">{zone.width}×{zone.length}×{zone.height}</div>
                                            <div className="text-xs text-gray-400 mt-1">centimeters</div>
                                        </div>

                                        <div className="text-center p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 mb-1">Volume</div>
                                            <div className="font-medium text-gray-700 text-lg">{zone.cubic_centimeter_zone.toLocaleString()}</div>
                                            <div className="text-xs text-gray-400 mt-1">cubic centimeters</div>
                                        </div>
                                    </div>

                                    {/* Space Usage */}
                                    <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-sm font-medium text-gray-700">Space Usage</div>
                                            <div className="text-sm font-medium" style={{ color: getUsageColor((zone.cubic_centimeter_zone / warehouseVolume) * 100) }}>
                                                {warehouseVolume > 0 ? ((zone.cubic_centimeter_zone / warehouseVolume) * 100).toFixed(1) : 0}%
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(warehouseVolume > 0 ? (zone.cubic_centimeter_zone / warehouseVolume) * 100 : 0, 100)}%`,
                                                    backgroundColor: getUsageColor((zone.cubic_centimeter_zone / warehouseVolume) * 100)
                                                }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{zone.cubic_centimeter_zone.toLocaleString()} cm³ used</span>
                                            <span>of {warehouseVolume.toLocaleString()} cm³ warehouse capacity</span>
                                        </div>
                                    </div>

                                    {/* Rack list */}
                                    <div className="p-4">
                                        <RackList
                                            zoneId={zone.master_zone_id}
                                            zoneName={zone.master_zone_name}
                                            zoneVolume={zone.cubic_centimeter_zone}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700">No zones found for this warehouse.</p>
                    <p className="text-gray-500 mt-1">Click the "Add Zone" button to create one.</p>
                </div>
            )}
        </div>
    );
};

export default ZoneList;