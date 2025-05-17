import { useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import { getMsshelf, deleteMsshelf } from "../../../../services/msshelf.services";
import { TypeMsshelfAll } from "../../../../types/response/reponse.msshelf";
import DialogAddShelf from "./dilogAddShelf";
import DialogEditShelf from "./dilogEditShelf";

interface ShelfListProps {
    rackId: string;
    rackName: string;
    rackVolume: number;
}

const ShelfList = ({ rackId, rackName, rackVolume }: ShelfListProps) => {
    const [shelves, setShelves] = useState<TypeMsshelfAll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usedSpace, setUsedSpace] = useState<number>(0);

    const fetchShelves = async () => {
        setLoading(true);
        try {
            const response = await getMsshelf(rackId);
            if (response.success) {
                const shelfData = response.responseObject || [];
                setShelves(shelfData);

                // Calculate used space
                const totalUsedSpace = shelfData.reduce((total: number, shelf: any) => total + (shelf.cubic_centimeter_shelf || 0), 0);
                setUsedSpace(totalUsedSpace);
            } else {
                setError(response.message || "Failed to fetch shelves");
            }
        } catch (err) {
            console.error("Error fetching shelves:", err);
            setError("Failed to fetch shelves. The backend API may not be available yet.");
            setShelves([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShelves();
    }, [rackId, rackVolume]);

    const handleDeleteShelf = async (shelfId: string) => {
        if (!confirm("Are you sure you want to delete this shelf?")) {
            return;
        }

        try {
            const response = await deleteMsshelf(shelfId);
            if (response.success) {
                fetchShelves(); // Refresh the list
            } else {
                alert(response.message || "Failed to delete shelf");
            }
        } catch (err) {
            alert("An error occurred while deleting the shelf");
            console.error(err);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading shelves...</div>;
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
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                        Shelves in {rackName}
                    </h3>
                    <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">
                            Space Usage: {usedSpace.toLocaleString()} / {rackVolume.toLocaleString()} cm³
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(rackVolume > 0 ? (usedSpace / rackVolume) * 100 : 0, 100)}%`,
                                    backgroundColor: rackVolume > 0 ?
                                        (usedSpace / rackVolume) * 100 < 40 ? '#10b981' :
                                            (usedSpace / rackVolume) * 100 < 70 ? '#f97316' : '#ef4444'
                                        : '#10b981'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <DialogAddShelf
                    rackId={rackId}
                    rackName={rackName}
                    rackVolume={rackVolume}
                    onShelfAdded={fetchShelves}
                />
            </div>

            {/* Shelves list */}
            {shelves.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
                    {shelves.map((shelf) => (
                        <div key={shelf.master_shelf_id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
                                <div className="w-2 h-10 bg-green-500 rounded-full"></div>
                                <div className="flex-grow">
                                    <h4 className="text-base font-medium text-gray-800">{shelf.master_shelf_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                                            Level {shelf.shelf_level}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <DialogEditShelf
                                        shelf={shelf}
                                        rackVolume={rackVolume}
                                        onShelfUpdated={fetchShelves}
                                    />
                                    <Button
                                        color="red"
                                        variant="soft"
                                        size="1"
                                        onClick={() => handleDeleteShelf(shelf.master_shelf_id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Dimensions</div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-center px-3">
                                                <div className="text-xs text-gray-500 mb-1">Width</div>
                                                <div className="text-lg font-bold text-gray-800">{shelf.width}</div>
                                                <div className="text-xs text-gray-500">cm</div>
                                            </div>
                                            <div className="text-gray-300">×</div>
                                            <div className="text-center px-3">
                                                <div className="text-xs text-gray-500 mb-1">Length</div>
                                                <div className="text-lg font-bold text-gray-800">{shelf.length}</div>
                                                <div className="text-xs text-gray-500">cm</div>
                                            </div>
                                            <div className="text-gray-300">×</div>
                                            <div className="text-center px-3">
                                                <div className="text-xs text-gray-500 mb-1">Height</div>
                                                <div className="text-lg font-bold text-gray-800">{shelf.height}</div>
                                                <div className="text-xs text-gray-500">cm</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-blue-700 mb-1">Volume</div>
                                                <div className="text-lg font-bold text-blue-800">{shelf.cubic_centimeter_shelf.toLocaleString()} cm³</div>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {shelf.description && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                                            <div className="text-sm text-gray-600">{shelf.description}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-50 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="3" y1="15" x2="21" y2="15"></line>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shelves Available</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">This rack doesn't have any shelves yet. Add shelves to organize your storage space and start storing boxes on different levels.</p>

                        <div className="flex justify-center">
                            <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                <span className="font-medium">Click the "Add Shelf" button above to create your first shelf</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 px-8 py-4 border-t border-green-100">
                        <h4 className="font-medium text-green-800 mb-2">Why add shelves?</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Maximize vertical storage space</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Organize boxes on different levels</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Improve warehouse efficiency</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShelfList;
