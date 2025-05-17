import { Table, Card, AlertDialog } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getMsproduct } from "@/services/msproduct.services";
import { TypeMsproductAll } from "@/types/response/reponse.msproduct";
import DialogAdd from "./components/dilogAddMsproduct";
import DialogEdit from "./components/dilogEditMsproduct";
import AlertDialogDelete from "./components/alertdilogDeleteMsproduct";
import { Plus } from "lucide-react";

export default function MsproductFeature() {
    const [msproduct, setMsproduct] = useState<TypeMsproductAll[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<TypeMsproductAll[]>([]);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditAlert, setShowEditAlert] = useState(false);

    useEffect(() => {
        getMsproduct().then((res) => {
            setMsproduct(res.responseObject);
            setFilteredProducts(res.responseObject);
        });
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredProducts(msproduct);
        } else {
            setFilteredProducts(
                msproduct.filter(product =>
                    product.master_product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.code_product.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleDeleteSuccess = () => {
        setShowDeleteAlert(true);
        setTimeout(() => {
            setShowDeleteAlert(false);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }, 800);
    };

    const handleEditSuccess = () => {
        setShowEditAlert(true);
        setTimeout(() => {
            setShowEditAlert(false);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 border border-gray-200">
                    {/* Icon + Title + Description */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="bg-green-100 p-3 rounded-xl flex items-center justify-center shadow-sm">
                            <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 4l-8 4m8-4l-8-4m8-4v12M4 7v12l8-4" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-extrabold text-gray-900 truncate tracking-tight">Product Management</h1>
                            <p className="mt-1 text-gray-500 truncate text-base">Manage and organize your product inventory</p>
                        </div>
                    </div>
                    {/* Search + Create Button */}
                    <div className="flex w-full lg:w-auto gap-3 items-center mt-4 lg:mt-0">
                        {/* Search Box with Button */}
                        <form className="flex items-center w-full lg:w-72 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <svg className="w-4 h-4 text-green-500 ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
                                <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                        </form>
                        {/* Create Button */}
                        <AlertDialog.Root>
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-6 py-2 shadow-md flex items-center transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Product
                            </button>
                        </AlertDialog.Root>
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-50">
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Code</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Scale</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Volume (cc)</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Image</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <Table.Row key={product.master_product_id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <Table.RowHeaderCell className="px-6 py-4 font-mono text-sm">
                                                {product.code_product}
                                            </Table.RowHeaderCell>
                                            <Table.Cell className="px-6 py-4 font-medium">
                                                {product.master_product_name}
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-green-700">
                                                    {product.width} × {product.height} × {product.length}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4 font-medium">
                                                {(product.cubic_centimeter_product).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-green-100">
                                                    <img
                                                        src={product.image_path ? `${import.meta.env.VITE_API_URL}/uploads/${product.image_path.replace(/^\/uploads\//, '')}` : "/placeholder.svg"}
                                                        alt={product.master_product_name}
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
                                                <div className="flex items-center gap-2 justify-center">
                                                    <DialogEdit
                                                        {...product}
                                                        getMsproductData={() => getMsproduct()}
                                                        onEditSuccess={handleEditSuccess}
                                                        buttonClassName="bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors"
                                                    />
                                                    <AlertDialogDelete
                                                        getMsproductData={() => getMsproduct()}
                                                        master_product_id={product.master_product_id}
                                                        master_product_name={product.master_product_name}
                                                        onDeleteSuccess={handleDeleteSuccess}
                                                        buttonClassName="bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl shadow-md px-6 py-2 focus:outline-none transition-colors"
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
                                                    <svg className="w-8 h-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                </div>
                                                <div className="text-gray-700 text-lg font-medium">No products found</div>
                                                <div className="text-gray-500 text-sm">Try adjusting your search criteria or add a new product</div>
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
                        <span className="font-medium">Product updated successfully.</span>
                    </div>
                )}
                {showDeleteAlert && (
                    <div className="fixed bottom-4 right-4 flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 shadow-lg animate-fade-in-down">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Product deleted successfully.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
