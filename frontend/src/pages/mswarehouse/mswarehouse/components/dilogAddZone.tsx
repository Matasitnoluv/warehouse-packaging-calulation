import { useEffect, useState } from "react";
import { Dialog, Button, TextField } from "@radix-ui/themes";
import { createMszone, getMszone } from "@/services/mszone.services";
import { getMswarehouse } from "@/services/mswarehouse.services";

// Simple UUID generator function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

interface DialogAddZoneProps {
    warehouseId: string;
    warehouseName: string;
    warehouseVolume: number;
    onZoneAdded: () => void;
}

const DialogAddZone = ({ warehouseId, warehouseName, warehouseVolume, onZoneAdded }: DialogAddZoneProps) => {
    const [zoneName, setZoneName] = useState("");
    const [height, setHeight] = useState<number>(0);
    const [length, setLength] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [volume, setVolume] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remainingSpace, setRemainingSpace] = useState<number>(warehouseVolume);
    const [usedSpace, setUsedSpace] = useState<number>(0);

    // Calculate volume when dimensions change
    useEffect(() => {
        setVolume(height * length * width);
    }, [height, length, width]);

    // Calculate remaining space in warehouse
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await getMszone(warehouseId);
                if (response.success) {
                    const zones = response.responseObject || [];
                    const totalUsedSpace = zones.reduce((total, zone) => total + (zone.cubic_centimeter_zone || 0), 0);
                    setUsedSpace(totalUsedSpace);
                    setRemainingSpace(warehouseVolume - totalUsedSpace);
                }
            } catch (error) {
                console.error("Error fetching zones:", error);
            }
        };

        fetchZones();
    }, [warehouseId, warehouseVolume]);

    const handleSubmit = async (e?: React.MouseEvent) => {
        // Prevent default behavior if event is provided
        if (e) {
            e.preventDefault();
        }

        if (!zoneName) {
            setError("Zone name is required");
            return;
        }

        if (height <= 0 || length <= 0 || width <= 0) {
            setError("Dimensions must be greater than zero");
            return;
        }

        // Check if zone exceeds remaining warehouse space
        if (volume > remainingSpace) {
            setError(`Zone volume (${volume.toLocaleString()} cm³) exceeds remaining warehouse space (${remainingSpace.toLocaleString()} cm³)`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const zoneData = {
                master_zone_id: generateUUID(),
                master_zone_name: zoneName,
                height,
                length,
                width,
                cubic_centimeter_zone: volume,
                description,
                master_warehouse_id: warehouseId
            };

            const response = await createMszone(zoneData);
            
            if (response.success) {
                // Reset form
                setZoneName("");
                setHeight(0);
                setLength(0);
                setWidth(0);
                setDescription("");
                setVolume(0);
                
                // Notify parent component
                onZoneAdded();
                
                // Close the dialog manually
                document.querySelector('.rt-DialogClose')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            } else {
                setError(response.message || "Failed to create zone");
            }
        } catch (err) {
            setError("An error occurred while creating the zone");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button id="btn-add-zone" size="2" className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-lg flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Zone
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-md">
                <Dialog.Title className="text-xl font-bold mb-4">Add New Zone to {warehouseName}</Dialog.Title>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Warehouse space information */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-1">Warehouse Space</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600">Total:</span> {warehouseVolume.toLocaleString()} cm³
                            </div>
                            <div>
                                <span className="text-gray-600">Used:</span> {usedSpace.toLocaleString()} cm³
                            </div>
                            <div>
                                <span className="text-gray-600">Remaining:</span> {remainingSpace.toLocaleString()} cm³
                            </div>
                            <div>
                                <span className="text-gray-600">Usage:</span> {warehouseVolume > 0 ? ((usedSpace / warehouseVolume) * 100).toFixed(2) : 0}%
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                        <TextField.Root
                            value={zoneName}
                            onChange={(e) => setZoneName(e.target.value)}
                            placeholder="Enter zone name"
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                            <TextField.Root
                                type="number"
                                value={width === 0 ? "" : width.toString()}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                placeholder="Width"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                            <TextField.Root
                                type="number"
                                value={length === 0 ? "" : length.toString()}
                                onChange={(e) => setLength(Number(e.target.value))}
                                placeholder="Length"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <TextField.Root
                                type="number"
                                value={height === 0 ? "" : height.toString()}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                placeholder="Height"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume (cm³)</label>
                        <div className="flex items-center">
                            <TextField.Root
                                value={volume.toLocaleString()}
                                readOnly
                                className="w-full bg-gray-50"
                            />
                            {volume > 0 && (
                                <div className={`ml-2 text-xs font-medium ${volume > remainingSpace ? 'text-red-600' : 'text-green-600'}`}>
                                    {volume > remainingSpace ? 'Exceeds available space' : `${((volume / remainingSpace) * 100).toFixed(2)}% of available`}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <TextField.Root
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description (optional)"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button 
                        id="btn-create-zone"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isSubmitting || volume > remainingSpace}
                        onClick={(e) => handleSubmit(e)}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Zone'}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogAddZone;