import { useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import { getMsrack, deleteMsrack } from "@/services/msrack.services";
import { TypeMsrackAll } from "@/types/response/reponse.msrack";
import DialogAddRack from "./dilogAddRack";
import DialogEditRack from "./dilogEditRack";
import ShelfList from "./ShelfList";

interface RackListProps {
    zoneId: string;
    zoneName: string;
    zoneVolume: number;
}

const RackList = ({ zoneId, zoneName, zoneVolume }: RackListProps) => {
    const [racks, setRacks] = useState<TypeMsrackAll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usedSpace, setUsedSpace] = useState<number>(0);

    const fetchRacks = async () => {
        setLoading(true);
        try {
            const response = await getMsrack(zoneId);
            if (response.success) {
                const rackData = response.responseObject || [];
                setRacks(rackData);
                
                // Calculate used space
                const totalUsedSpace = rackData.reduce((total: number, rack: any) => total + (rack.cubic_centimeter_rack || 0), 0);
                setUsedSpace(totalUsedSpace);
            } else {
                setError(response.message || "Failed to fetch racks");
            }
        } catch (err) {
            console.error("Error fetching racks:", err);
            setError("Failed to fetch racks. The backend API may not be available yet.");
            setRacks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRacks();
    }, [zoneId, zoneVolume]);

    const handleDeleteRack = async (rackId: string) => {
        if (!confirm("Are you sure you want to delete this rack?")) {
            return;
        }

        try {
            const response = await deleteMsrack(rackId);
            if (response.success) {
                fetchRacks(); // Refresh the list
            } else {
                alert(response.message || "Failed to delete rack");
            }
        } catch (err) {
            alert("An error occurred while deleting the rack");
            console.error(err);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading racks...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with usage stats and add button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                        Racks in {zoneName}
                    </h3>
                    <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">
                            Space Usage: {usedSpace.toLocaleString()} / {zoneVolume.toLocaleString()} cm³
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="h-2 rounded-full transition-all duration-500" 
                                style={{ 
                                    width: `${Math.min(zoneVolume > 0 ? (usedSpace / zoneVolume) * 100 : 0, 100)}%`,
                                    backgroundColor: zoneVolume > 0 ? 
                                        (usedSpace / zoneVolume) * 100 < 40 ? '#818cf8' : 
                                        (usedSpace / zoneVolume) * 100 < 70 ? '#f97316' : '#ef4444'
                                        : '#818cf8'
                                }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {zoneVolume > 0 ? ((usedSpace / zoneVolume) * 100).toFixed(2) : 0}% used
                        </div>
                    </div>
                </div>
                <DialogAddRack 
                    zoneId={zoneId} 
                    zoneName={zoneName}
                    zoneVolume={zoneVolume}
                    onRackAdded={fetchRacks} 
                />
            </div>

            {racks.length > 0 ? (
                <div className="space-y-4">
                    {racks.map((rack) => (
                        <div key={rack.master_rack_id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-100">
                                <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {rack.master_rack_name}
                                </h4>
                                <div className="flex gap-2">
                                    <DialogEditRack 
                                        rack={rack} 
                                        zoneVolume={zoneVolume}
                                        onRackUpdated={fetchRacks} 
                                    />
                                    <Button 
                                        color="red" 
                                        variant="soft" 
                                        size="1"
                                        onClick={() => handleDeleteRack(rack.master_rack_id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex gap-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-center px-3">
                                            <div className="text-xs text-gray-500 mb-1">Height</div>
                                            <div className="text-lg font-bold text-gray-800">{rack.height}</div>
                                            <div className="text-xs text-gray-500">cm</div>
                                        </div>
                                        <div className="text-center px-3">
                                            <div className="text-xs text-gray-500 mb-1">Width</div>
                                            <div className="text-lg font-bold text-gray-800">{rack.width}</div>
                                            <div className="text-xs text-gray-500">cm</div>
                                        </div>
                                        <div className="text-center px-3">
                                            <div className="text-xs text-gray-500 mb-1">Length</div>
                                            <div className="text-lg font-bold text-gray-800">{rack.length}</div>
                                            <div className="text-xs text-gray-500">cm</div>
                                        </div>
                                        <div className="text-center px-3 border-l border-gray-200 pl-4">
                                            <div className="text-xs text-gray-500 mb-1">Volume</div>
                                            <div className="text-lg font-bold text-gray-800">{rack.cubic_centimeter_rack.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">cm³</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <details className="w-full border border-indigo-100 rounded-lg overflow-hidden" open>
                                    <summary className="bg-indigo-50 px-4 py-3 cursor-pointer flex items-center justify-between font-medium text-indigo-800">
                                        <span className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                                <line x1="3" y1="15" x2="21" y2="15"></line>
                                            </svg>
                                            Manage Shelves
                                        </span>
                                    </summary>
                                    <div className="p-4 bg-white">
                                        <ShelfList
                                            rackId={rack.master_rack_id}
                                            rackName={rack.master_rack_name}
                                            rackVolume={rack.cubic_centimeter_rack}
                                        />
                                    </div>
                                </details>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50 text-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="3" y1="15" x2="21" y2="15"></line>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Racks Available</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">This zone doesn't have any racks yet. Add racks to organize your storage space and start storing boxes.</p>
                        
                        <div className="flex justify-center">
                            <div className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg border border-indigo-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span className="font-medium">Click the "Add Rack" button above to create your first rack</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50 px-8 py-4 border-t border-indigo-100">
                        <h4 className="font-medium text-indigo-800 mb-2">Why add racks?</h4>
                        <ul className="text-sm text-indigo-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Organize your warehouse space efficiently</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Store boxes in specific locations</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Track storage capacity and usage</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RackList;