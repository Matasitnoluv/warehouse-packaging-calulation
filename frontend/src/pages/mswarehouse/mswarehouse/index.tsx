import { Table, Card, AlertDialog } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { TypeMswarehouseAll } from "@/types/response/reponse.mswarehouse";
import DialogAdd from "./components/dilogAddMswarehouse";
import DialogEdit from "./components/dilogEditMswarehouse";
import AlertDialogDelete from "./components/alertdilogDeleteMswarehouse";
import DialogViewWarehouse from "./components/DialogViewWarehouse";
import { Warehouse, Search, Plus } from "lucide-react";

export default function MsWarehousePage() {
    const [mswarehouse, setMswarehouse] = useState<TypeMswarehouseAll[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [master_warehouse, setFilteredWarehouses] = useState<TypeMswarehouseAll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

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
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 border border-gray-200">
                    {/* Icon + Title + Description */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="bg-green-100 p-3 rounded-xl flex items-center justify-center shadow-sm">
                            <Warehouse className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-extrabold text-gray-900 truncate tracking-tight">Warehouse Management</h1>
                            <p className="mt-1 text-gray-500 truncate text-base">Manage and organize your warehouse inventory</p>
                        </div>
                    </div>
                    {/* Search + Create Button */}
                    <div className="flex w-full lg:w-auto gap-3 items-center mt-4 lg:mt-0">
                        {/* Search Box with Button */}
                        <form className="flex items-center w-full lg:w-72 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <Search className="w-4 h-4 text-green-500 ml-3" />
                            <input
                                type="text"
                                placeholder="Search by name..."
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
                        {/* Create Button */}
                        <AlertDialog.Root>
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-6 py-2 shadow-md flex items-center transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Warehouse
                            </button>
                        </AlertDialog.Root>
                    </div>
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
