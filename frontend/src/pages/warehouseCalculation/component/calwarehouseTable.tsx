import { Table, Card, AlertDialog, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCalWarehouse } from "@/services/calwarehouse.services";
import { TypeCalWarehouseAll } from "@/types/response/reponse.cal_warehouse";
import { useNavigate } from "react-router-dom";
import DilogAddCalwarehouse from "./dilogAddCalwarehouse";
import DilogEditCalwarehouse from "./dilogEditCalwarehouse";
import AlrtdilogDeleteDocument from "./alrtdilogDeleteDocument";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import DialogSelectWarehouse from "@/pages/calculationproductbox/components/dialogSelectWarehouse";

const CalWarehouseTable = () => {
    const navigate = useNavigate();
    const [calculations, setCalculations] = useState<TypeCalWarehouseAll[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
    const [selectedDocumentNo, setSelectedDocumentNo] = useState<string | null>(null);

    const getCalWarehouseData = () => {
        getCalWarehouse().then((res) => {
            console.log(res);
            setCalculations(res.responseObject);
        });
    };

    useEffect(() => {
        getCalWarehouseData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Calculation Records</h2>
                            <p className="text-gray-600">Manage your warehouse and box calculations</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/calculationproductbox")}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2 rounded-md shadow-md transition-colors text-sm"
                            >
                                <ArrowLeft size={18} />
                                Back to Calculator
                            </button>
                            <AlertDialog.Root>
                                <DilogAddCalwarehouse getCalwarehouseData={getCalWarehouseData} buttonClassName="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md px-6 py-2 shadow-md flex items-center transition-colors" />
                            </AlertDialog.Root>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table.Root className="w-full">
                            <Table.Header>
                                <Table.Row className="bg-gray-50 border-b border-gray-200">
                                    <Table.ColumnHeaderCell className="px-6 py-4 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FileSpreadsheet size={18} className="text-gray-500" />
                                            Document No.
                                        </div>
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 text-center font-semibold text-gray-700 w-32">
                                        Actions
                                    </Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell className="px-6 py-4 text-center font-semibold text-gray-700 w-32">
                                        Delete
                                    </Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {calculations.length > 0 ? (
                                    calculations.map((cal_warehouse, index) => (
                                        <Table.Row
                                            key={cal_warehouse.document_warehouse_no}
                                            className={`
                                                border-b border-gray-100 
                                                ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                hover:bg-blue-50 transition-all duration-200
                                            `}
                                        >
                                            <Table.RowHeaderCell className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {cal_warehouse.document_warehouse_no}
                                                </div>
                                            </Table.RowHeaderCell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <DialogSelectWarehouse
                                                        documentWarehouseNo={cal_warehouse.document_warehouse_no}
                                                        triggerButtonText="Calculation"
                                                        buttonClassName="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-md shadow-md transition-colors text-sm"
                                                    />
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <AlrtdilogDeleteDocument
                                                        getCalWarehouseData={getCalWarehouseData}
                                                        document_warehouse_id={cal_warehouse.document_warehouse_id}
                                                        document_warehouse_no={cal_warehouse.document_warehouse_no}
                                                        buttonClassName="bg-red-400 hover:bg-red-500 text-white font-bold rounded-md px-6 py-2 shadow-md flex items-center transition-colors"
                                                    />
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={3} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <FileSpreadsheet size={24} />
                                                <p className="text-lg font-medium">No calculations found</p>
                                                <p className="text-sm">Create a new calculation to get started</p>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </div>
                </Card>

                {/* DialogSelectWarehouse Popup */}
                {showWarehouseDialog && (
                    <DialogSelectWarehouse
                        triggerButtonText={null}
                        documentWarehouseNo={selectedDocumentNo ?? undefined}
                    />
                )}
            </div>
        </div>
    );
}

export default CalWarehouseTable; 