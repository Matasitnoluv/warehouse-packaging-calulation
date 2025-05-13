// dilogEditZone.tsx
import { useEffect, useState } from "react";
import { Dialog, Button, TextField } from "@radix-ui/themes";
import { updateMszone } from "@/services/mszone.services";
import { TypeMszoneAll } from "@/types/response/reponse.mszone";

interface DialogEditZoneProps {
    zone: TypeMszoneAll;
    onZoneUpdated: () => void;
}

const DialogEditZone = ({ zone, onZoneUpdated }: DialogEditZoneProps) => {
    const [zoneName, setZoneName] = useState(zone.master_zone_name);
    const [height, setHeight] = useState<number>(zone.height);
    const [length, setLength] = useState<number>(zone.length);
    const [width, setWidth] = useState<number>(zone.width);
    const [description, setDescription] = useState(zone.description);
    const [volume, setVolume] = useState<number>(zone.cubic_centimeter_zone);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate volume when dimensions change
    useEffect(() => {
        setVolume(height * length * width);
    }, [height, length, width]);

    const handleSubmit = async () => {
        if (!zoneName) {
            setError("Zone name is required");
            return;
        }

        if (height <= 0 || length <= 0 || width <= 0) {
            setError("Dimensions must be greater than zero");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const zoneData = {
                master_zone_id: zone.master_zone_id,
                master_zone_name: zoneName,
                height,
                length,
                width,
                cubic_centimeter_zone: volume,
                description,
                master_warehouse_id: zone.master_warehouse_id
            };

            const response = await updateMszone(zoneData);
            
            if (response.success) {
                // Notify parent component
                onZoneUpdated();
            } else {
                setError(response.message || "Failed to update zone");
            }
        } catch (err) {
            setError("An error occurred while updating the zone");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="1" color="blue" variant="soft">
                    Edit
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-md">
                <Dialog.Title className="text-xl font-bold mb-4">Edit Zone</Dialog.Title>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
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
                                value={width.toString()}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                placeholder="Width"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                            <TextField.Root
                                type="number"
                                value={length.toString()}
                                onChange={(e) => setLength(Number(e.target.value))}
                                placeholder="Length"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <TextField.Root
                                type="number"
                                value={height.toString()}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                placeholder="Height"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume (cm³)</label>
                        <TextField.Root
                            value={volume.toLocaleString()}
                            readOnly
                            className="w-full bg-gray-50"
                        />
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
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Zone'}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogEditZone;