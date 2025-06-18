import { useEffect, useState } from "react";
import { Dialog, Button, TextField } from "@radix-ui/themes";
import { updateMsshelf, getMsshelf } from "@/services/msshelf.services";
import { TypeMsshelfAll } from "@/types/response/reponse.msshelf";

interface DialogEditShelfProps {
    shelf: TypeMsshelfAll;
    rackVolume: number;
    onShelfUpdated: () => void;
}

const DialogEditShelf = ({ shelf, rackVolume, onShelfUpdated }: DialogEditShelfProps) => {
    const [shelfName, setShelfName] = useState(shelf.master_shelf_name);
    const [shelfLevel, setShelfLevel] = useState<number>(shelf.shelf_level);
    const [height, setHeight] = useState<number>(shelf.height);
    const [length, setLength] = useState<number>(shelf.length);
    const [width, setWidth] = useState<number>(shelf.width);
    const [description, setDescription] = useState(shelf.description || "");
    const [volume, setVolume] = useState<number>(shelf.cubic_centimeter_shelf);
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
                const response = await getMsshelf(shelf.master_rack_id);
                if (response.success) {
                    const shelves = response.responseObject || [];
                    setExistingShelves(shelves);
                    
                    // Calculate total used space excluding the current shelf
                    const otherShelves = shelves.filter((s: any) => s.master_shelf_id !== shelf.master_shelf_id);
                    const otherShelvesUsedSpace = otherShelves.reduce(
                        (total: any, s: any) => total + (s.cubic_centimeter_shelf || 0), 
                        0
                    );
                    
                    setUsedSpace(otherShelvesUsedSpace);
                    setRemainingSpace(rackVolume - otherShelvesUsedSpace);
                }
            } catch (error) {
                console.error("Error fetching shelves:", error);
            }
        };

        fetchShelves();
    }, [shelf.master_rack_id, rackVolume, shelf.master_shelf_id]);

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

        // Check if shelf level already exists (excluding this shelf)
        const levelExists = existingShelves.some(s => 
            s.shelf_level === shelfLevel && s.master_shelf_id !== shelf.master_shelf_id
        );
        
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
                master_shelf_id: shelf.master_shelf_id,
                master_shelf_name: shelfName,
                shelf_level: shelfLevel,
                height,
                length,
                width,
                cubic_centimeter_shelf: volume,
                description,
                master_rack_id: shelf.master_rack_id
            };

            const response = await updateMsshelf(shelfData);
            
            if (response.success) {
                // Notify parent component
                onShelfUpdated();
                
                // Close the dialog manually
                document.querySelector('.rt-DialogClose')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            } else {
                setError(response.message || "Failed to update shelf");
            }
        } catch (err) {
            console.error("Error updating shelf:", err);
            setError("An error occurred while updating the shelf");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button id={`btn-edit-shelf-${shelf.master_shelf_id}`} variant="soft" size="1" data-testid={`edit-shelf-btn-${shelf.master_shelf_id}`}>Edit</Button>
            </Dialog.Trigger>

            <Dialog.Content style={{ maxWidth: 560 }}>
                <Dialog.Title>Edit Shelf</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Update the shelf details. The shelf dimensions cannot exceed the available space in the rack.
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
                        <Button id="btn-cancel-shelf" variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button id="btn-update-shelf" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isSubmitting || volume > remainingSpace} onClick={(e) => handleSubmit(e)}>
                        {isSubmitting ? 'Updating...' : 'Update Shelf'}
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default DialogEditShelf;
