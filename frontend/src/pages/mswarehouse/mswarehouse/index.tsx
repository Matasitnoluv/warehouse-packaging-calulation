import { Table, Card, AlertDialog } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { TypeMswarehouseAll } from "@/types/response/reponse.mswarehouse";
import DialogAdd from "./components/dilogAddMswarehouse";
import DialogEdit from "./components/dilogEditMswarehouse";
import AlertDialogDelete from "./components/alertdilogDeleteMswarehouse";
import DialogViewWarehouse from "./components/DialogViewWarehouse";
import { Warehouse, Search } from "lucide-react";

export default function MsWarehousePage() {
    const [mswarehouse, setMswarehouse] = useState<TypeMswarehouseAll[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [master_warehouse, setFilteredWarehouses] = useState<TypeMswarehouseAll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getmswarehouseData = () => {
        setIsLoading(true);
        setError(null);
        getMswarehouse()
            .then((res) => {
                const data = res.responseObject || [];
                setMswarehouse(data);
                setFilteredWarehouses(data);
            })
            .catch((err) => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message);
                setMswarehouse([]);
                setFilteredWarehouses([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        getmswarehouseData();
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredWarehouses(mswarehouse);
        } else {
            setFilteredWarehouses(
                mswarehouse.filter((warehouse) =>
                    warehouse.master_warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {error && (
                        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            <span className="ml-2">กำลังโหลดข้อมูล...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            {/* Title */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Warehouse className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        Warehouse Management
                                    </h1>
                                    <p className="mt-1 text-gray-600">
                                        Manage and organize your warehouse inventory
                                    </p>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="flex-1 w-full lg:max-w-xl flex flex-col sm:flex-row gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        className="w-full h-10 pl-10 pr-4 text-base rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Add Warehouse Button */}
                            <div className="flex-shrink-0">
                                <AlertDialog.Root>
                                    <DialogAdd getMswarehouseData={getmswarehouseData} />
                                </AlertDialog.Root>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto">
                <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-50">
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Dimensions</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Volume (cc)</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-900">Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {master_warehouse && master_warehouse.length > 0 ? (
                                    master_warehouse.map((warehouse) => (
                                        <React.Fragment key={warehouse.master_warehouse_id}>
                                            <Table.Row
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <Table.Cell className="px-6 py-4 font-medium">
                                                    {warehouse.master_warehouse_name}
                                                </Table.Cell>
                                                <Table.Cell className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-green-700">
                                                        {warehouse.width} × {warehouse.length} × {warehouse.height}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell className="px-6 py-4 font-medium">
                                                    {(Number(warehouse.width) * Number(warehouse.length) * Number(warehouse.height)).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                                </Table.Cell>
                                                <Table.Cell className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <DialogViewWarehouse
                                                            warehouseId={warehouse.master_warehouse_id}
                                                            warehouseName={warehouse.master_warehouse_name}
                                                            warehouseVolume={warehouse.cubic_centimeter_warehouse ?? 0}
                                                            dimensions={{
                                                                width: Number(warehouse.width),
                                                                length: Number(warehouse.length),
                                                                height: Number(warehouse.height)
                                                            }}
                                                        />
                                                        <DialogEdit
                                                            {...warehouse}
                                                            cubic_centimeter_warehouse={warehouse.cubic_centimeter_warehouse ?? 0}
                                                            getMswarehouseData={getmswarehouseData}
                                                        />
                                                        <AlertDialogDelete
                                                            getMswarehouseData={getmswarehouseData}
                                                            master_warehouse_id={warehouse.master_warehouse_id}
                                                            master_warehouse_name={warehouse.master_warehouse_name}
                                                        />
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="rounded-full bg-gray-100 p-3">
                                                    <Warehouse className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div className="text-gray-500 text-lg font-medium">No warehouses found</div>
                                                <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </div>
                </Card>
            </div>
        </div>
    );
}
