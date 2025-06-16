import { Table, Card, AlertDialog } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getMsbox } from "@/services/msbox.services";
import { TypeMsbox, TypeMsboxAll } from "@/types/response/reponse.msbox";
import DialogAdd from "./components/dilogAddMsbox";
import DialogEdit from "./components/dilogEditMsbox";
import AlertDialogDelete from "./components/alertdilogDeleteMsbox";
import { Package, Search, Plus } from "lucide-react";

export default function MsboxFeature() {
    const [msbox, setMsbox] = useState<TypeMsbox[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBoxes, setFilteredBoxes] = useState<TypeMsbox[]>([]);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditAlert, setShowEditAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMsboxData();
    }, []);

    const loadMsboxData = () => {
        setIsLoading(true);
        setError(null);
        getMsbox()
            .then((res) => {
                const boxes = res?.responseObject || [];
                setMsbox(boxes);
                setFilteredBoxes(boxes);
            })
            .catch((err) => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + (err.message || "Unknown error"));
                setMsbox([]);
                setFilteredBoxes([]);
            })
            .finally(() => setIsLoading(false));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredBoxes(msbox);
        } else {
            setFilteredBoxes(
                msbox.filter((box) =>
                    box.master_box_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    box.code_box.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleDeleteSuccess = () => {
        setShowDeleteAlert(true);
        setTimeout(() => {
            setShowDeleteAlert(false);
            setTimeout(() => {
                loadMsboxData();
            }, 500);
        }, 800);
    };

    const handleEditSuccess = () => {
        setShowEditAlert(true);
        setTimeout(() => {
            setShowEditAlert(false);
            setTimeout(() => {
                loadMsboxData();
            }, 500);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Global Error Message Display */}
            {error && !isLoading && ( // Show error if loading is finished and an error exists
                <div className="max-w-7xl mx-auto mb-4">
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 border border-gray-200">
                    {/* Icon + Title + Description */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="bg-green-100 p-3 rounded-xl flex items-center justify-center shadow-sm">
                            <Package className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-extrabold text-gray-900 truncate tracking-tight">Box Management</h1>
                            <p className="mt-1 text-gray-500 truncate text-base">Manage and organize your box inventory</p>
                        </div>
                    </div>
                    {/* Search + Create Button */}
                    <div className="flex w-full lg:w-auto gap-3 items-center mt-4 lg:mt-0">
                        {/* Search Box with Button */}
                        <form className="flex items-center w-full lg:w-72 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <Search className="w-4 h-4 text-green-500 ml-3" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                className="outline-none flex-1 bg-transparent text-gray-700 placeholder-gray-400 px-2 py-2"
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-lg w-8 h-8 flex items-center justify-center mx-1 shadow-md focus:outline-none transition-colors"
                            >
                                <Search className="w-4 h-4 text-white" />
                            </button>
                        </form>
                        {/* Create Button (Dialog) */}
                        <DialogAdd getMsboxData={loadMsboxData} buttonId="create-box" />
                    </div>
                </div>
            </div>

            {/* Table View */}
            {/* Render table structure even if there was an initial error, but content will be guided by isLoading/error states */}
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-50">
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Code</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Dimensions</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Volume (cc)</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Image</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {isLoading ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                                <span>กำลังโหลดข้อมูล...</span>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ) : filteredBoxes.length > 0 ? (
                                    filteredBoxes.map((box) => (
                                        <Table.Row key={box.master_box_id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <Table.RowHeaderCell className="px-6 py-4 font-mono text-sm">
                                                {box.code_box}
                                            </Table.RowHeaderCell>
                                            <Table.Cell className="px-6 py-4 font-medium">
                                                {box.master_box_name}
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-green-700">
                                                    {box.width} × {box.height} × {box.length}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4 font-medium">
                                                {(box.width * box.height * box.length).toLocaleString("th-TH", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-green-100">
                                                    <img
                                                        src={
                                                            box.image_path
                                                                ? `${import.meta.env.VITE_API_URL}/uploads/${box.image_path.replace(/^\/uploads\//, "")}`
                                                                : "/placeholder.svg"
                                                        }
                                                        alt={box.master_box_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.onerror = null;
                                                            target.src = "/placeholder.svg";
                                                        }}
                                                    />
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <DialogEdit
                                                        {...box}
                                                        getMsboxData={loadMsboxData}
                                                        onEditSuccess={handleEditSuccess}
                                                        buttonId="edit-box"
                                                    />
                                                    <AlertDialogDelete
                                                        getMsboxData={loadMsboxData}
                                                        master_box_id={box.master_box_id}
                                                        master_box_name={box.master_box_name}
                                                        onDeleteSuccess={handleDeleteSuccess}
                                                        buttonId="delete-box"
                                                    />
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="rounded-full bg-green-50 p-4">
                                                    {/* Using Package icon, similar style to msproduct's no-data SVG */}
                                                    <Package className="w-8 h-8 text-green-500" />
                                                </div>
                                                <div className="text-gray-700 text-lg font-medium">No boxes found</div>
                                                <div className="text-gray-500 text-sm">Try adjusting your search criteria or add a new box</div>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </div>
                </Card>
            </div>

            {/* Success Toasts */}
            <div>
                {showEditAlert && (
                    <div className="fixed bottom-4 right-4 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl z-50 shadow-lg animate-fade-in-down">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Box updated successfully.</span>
                    </div>
                )}
                {showDeleteAlert && (
                    <div className="fixed bottom-4 right-4 flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 shadow-lg animate-fade-in-down">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"> {/* Using same success icon for consistency */}
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Box deleted successfully.</span>
                    </div>
                )}
            </div>
        </div>
    );
}