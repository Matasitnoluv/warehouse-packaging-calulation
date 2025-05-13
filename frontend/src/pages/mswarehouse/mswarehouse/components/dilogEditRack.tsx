import { useEffect, useState } from "react";
import { Dialog, Button, TextField } from "@radix-ui/themes";
import { updateMsrack } from "@/services/msrack.services";
import { TypeMsrackAll } from "@/types/response/reponse.msrack";

interface DialogEditRackProps {
    rack: TypeMsrackAll;
    zoneVolume: number;
    onRackUpdated: () => void;
}

const DialogEditRack = ({ rack, zoneVolume, onRackUpdated }: DialogEditRackProps) => {
    // This component renders both the trigger button and the dialog content
    const [rackName, setRackName] = useState(rack.master_rack_name);
    const [height, setHeight] = useState<number>(rack.height);
    const [length, setLength] = useState<number>(rack.length);
    const [width, setWidth] = useState<number>(rack.width);
    const [description, setDescription] = useState(rack.description);
    const [volume, setVolume] = useState<number>(rack.cubic_centimeter_rack);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [originalVolume, setOriginalVolume] = useState<number>(rack.cubic_centimeter_rack);
    const [remainingZoneSpace, setRemainingZoneSpace] = useState<number>(zoneVolume - rack.cubic_centimeter_rack);

    // Calculate volume when dimensions change
    useEffect(() => {
        setVolume(height * length * width);
    }, [height, length, width]);

    // Calculate available space in the zone
    useEffect(() => {
        // We add the original rack volume to the remaining space because we're replacing it
        const availableSpace = zoneVolume - (rack.cubic_centimeter_rack - originalVolume);
        setRemainingZoneSpace(availableSpace);
    }, [zoneVolume, rack.cubic_centimeter_rack, originalVolume]);

    const handleSubmit = async () => {
        if (!rackName) {
            setError("Rack name is required");
            return;
        }

        if (height <= 0 || length <= 0 || width <= 0) {
            setError("Dimensions must be greater than zero");
            return;
        }

        // Check if the new volume exceeds the available space in the zone
        const volumeDifference = volume - originalVolume;
        if (volumeDifference > remainingZoneSpace) {
            setError(`New rack volume exceeds available space in the zone. Maximum allowed increase: ${remainingZoneSpace.toLocaleString()} cm³`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const rackData = {
                master_rack_id: rack.master_rack_id,
                master_rack_name: rackName,
                height,
                length,
                width,
                cubic_centimeter_rack: volume,
                description,
                master_zone_id: rack.master_zone_id
            };

            const response = await updateMsrack(rackData);
            
            if (response.success) {
                // Notify parent component
                onRackUpdated();
                
                // Close the dialog manually
                document.querySelector('.rt-DialogClose')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            } else {
                setError(response.message || "Failed to update rack");
            }
        } catch (err) {
            setError("An error occurred while updating the rack");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button 
                    variant="soft" 
                    size="1"
                >
                    Edit
                </Button>
            </Dialog.Trigger>

            <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-md">
                <Dialog.Title className="text-xl font-bold mb-4">Edit Rack</Dialog.Title>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rack Name</label>
                        <TextField.Root
                            value={rackName}
                            onChange={(e) => setRackName(e.target.value)}
                            placeholder="Enter rack name"
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
                            {volume !== originalVolume && (
                                <div className={`ml-2 text-xs font-medium ${volume - originalVolume > remainingZoneSpace ? 'text-red-600' : 'text-green-600'}`}>
                                    {volume > originalVolume ? `+${(volume - originalVolume).toLocaleString()}` : `${(volume - originalVolume).toLocaleString()}`} cm³
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
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isSubmitting || (volume - originalVolume > remainingZoneSpace)}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Rack'}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogEditRack;