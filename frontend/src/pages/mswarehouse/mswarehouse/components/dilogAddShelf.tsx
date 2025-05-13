import { useEffect, useState } from "react";
import { Dialog, Button, TextField } from "@radix-ui/themes";
import { createMsshelf, getMsshelf } from "@/services/msshelf.services";

// Simple UUID generator function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

interface DialogAddShelfProps {
    rackId: string;
    rackName: string;
    rackVolume: number;
    onShelfAdded: () => void;
}

const DialogAddShelf = ({ rackId, rackName, rackVolume, onShelfAdded }: DialogAddShelfProps) => {
    const [shelfName, setShelfName] = useState("");
    const [shelfLevel, setShelfLevel] = useState<number>(1);
    const [height, setHeight] = useState<number>(0);
    const [length, setLength] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [description, setDescription] = useState("");
    const [volume, setVolume] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remainingSpace, setRemainingSpace] = useState<number>(rackVolume);
    const [usedSpace, setUsedSpace] = useState<number>(0);
    const [existingShelves, setExistingShelves] = useState<any[]>([]);

    // Calculate volume when dimensions change
    useEffect(() => {
        setVolume(height * length * width);
    }, [height, length, width]);

    // Calculate remaining space in rack and get existing shelf levels
    useEffect(() => {
        const fetchShelves = async () => {
            try {
                const response = await getMsshelf(rackId);
                if (response.success) {
                    const shelves = response.responseObject || [];
                    setExistingShelves(shelves);
                    const totalUsedSpace = shelves.reduce((total: number, shelf: any) => total + (shelf.cubic_centimeter_shelf || 0), 0);
                    setUsedSpace(totalUsedSpace);
                    setRemainingSpace(rackVolume - totalUsedSpace);
                    
                    // Set default shelf level to one higher than the highest existing level
                    if (shelves.length > 0) {
                        const highestLevel = Math.max(...shelves.map((shelf: any) => shelf.shelf_level));
                        setShelfLevel(highestLevel + 1);
                    } else {
                        setShelfLevel(1);
                    }
                }
            } catch (error) {
                console.error("Error fetching shelves:", error);
            }
        };

        fetchShelves();
    }, [rackId, rackVolume]);

    const handleSubmit = async (e?: React.MouseEvent) => {
        // Prevent default behavior if event is provided
        if (e) {
            e.preventDefault();
        }

        if (!shelfName) {
            setError("Shelf name is required");
            return;
        }

        if (height <= 0 || length <= 0 || width <= 0) {
            setError("Dimensions must be greater than zero");
            return;
        }

        // Check if shelf level already exists
        const levelExists = existingShelves.some(shelf => shelf.shelf_level === shelfLevel);
        if (levelExists) {
            setError(`Shelf level ${shelfLevel} already exists. Please choose a different level.`);
            return;
        }

        // Check if shelf exceeds remaining rack space
        if (volume > remainingSpace) {
            setError(`Shelf volume (${volume.toLocaleString()} cm³) exceeds remaining rack space (${remainingSpace.toLocaleString()} cm³)`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const shelfData = {
                master_shelf_id: generateUUID(),
                master_shelf_name: shelfName,
                shelf_level: shelfLevel,
                height,
                length,
                width,
                cubic_centimeter_shelf: volume,
                description,
                master_rack_id: rackId
            };

            const response = await createMsshelf(shelfData);
            
            if (response.success) {
                // Reset form
                setShelfName("");
                setShelfLevel(shelfLevel + 1);
                setHeight(0);
                setLength(0);
                setWidth(0);
                setDescription("");
                setVolume(0);
                
                // Notify parent component
                onShelfAdded();
                
                // Close the dialog manually
                document.querySelector('.rt-DialogClose')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            } else {
                setError(response.message || "Failed to create shelf");
            }
        } catch (err) {
            console.error("Error creating shelf:", err);
            setError("An error occurred while creating the shelf");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Add Shelf
                </Button>
            </Dialog.Trigger>

            <Dialog.Content style={{ maxWidth: 560 }}>
                <Dialog.Title>Add New Shelf to {rackName}</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Add a new shelf level to this rack. The shelf dimensions cannot exceed the available space in the rack.
                </Dialog.Description>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Name</label>
                        <TextField.Root
                            value={shelfName}
                            onChange={(e) => setShelfName(e.target.value)}
                            placeholder="Enter shelf name"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Level</label>
                        <TextField.Root
                            type="number"
                            value={shelfLevel}
                            onChange={(e) => setShelfLevel(Number(e.target.value))}
                            placeholder="Shelf level (1, 2, 3, etc.)"
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Level number determines the position of the shelf within the rack (from bottom to top)</p>
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
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={isSubmitting || volume > remainingSpace}
                        onClick={(e) => handleSubmit(e)}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Shelf'}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogAddShelf;
