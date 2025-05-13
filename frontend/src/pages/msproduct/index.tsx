import { Table, Card, AlertDialog } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getMsproduct } from "@/services/msproduct.services";
import { TypeMsproductAll } from "@/types/response/reponse.msproduct";
import DialogAdd from "./components/dilogAddMsproduct";
import DialogEdit from "./components/dilogEditMsproduct";
import AlertDialogDelete from "./components/alertdilogDeleteMsproduct";

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
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        {/* Title */}
                        <div className="flex-1 flex items-center gap-4">
                            <div className="bg-green-50 p-3 rounded-xl">
                                <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 4l-8 4m8-4l-8-4m8-4v12M4 7v12l8-4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Product Management
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Manage and organize your product inventory
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 w-full lg:max-w-md">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name or code..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        className="w-full h-12 pl-5 pr-12 text-base rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none shadow-sm"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex-shrink-0">
                            <AlertDialog.Root>
                                <DialogAdd getMsproductData={() => getMsproduct()} />
                            </AlertDialog.Root>
                        </div>
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
                                                <div className="flex items-center gap-2">
                                                    <DialogEdit {...product} getMsproductData={() => getMsproduct()} onEditSuccess={handleEditSuccess} />
                                                    <AlertDialogDelete
                                                        getMsproductData={() => getMsproduct()}
                                                        master_product_id={product.master_product_id}
                                                        master_product_name={product.master_product_name}
                                                        onDeleteSuccess={handleDeleteSuccess}
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
