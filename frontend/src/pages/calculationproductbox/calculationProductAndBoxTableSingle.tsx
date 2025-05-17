import { Table, Card, AlertDialog } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { getCalMsproductByType } from "@/services/calmsproduct.services";
import { TypeCalMsproductAll } from "@/types/response/reponse.cal_msproduct";
import { useNavigate } from "react-router-dom";
import DialogAdd from "./components/dilogAddCalmsproduct";
import DialogEditCalmsproduct from "./components/dilogEditCalmsproduct";
import AlertDialogDelete from "./components/aletdilogDelteDocument";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";

const CalculationProductAndBoxTableSingle = () => {
    const navigate = useNavigate();
    const [calculations, setCalculations] = useState<TypeCalMsproductAll[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const getCalMsproductData = () => {
        getCalMsproductByType("single").then((res) => {
            console.log(res);
            setCalculations(res.responseObject);
        });
    };

    useEffect(() => {
        getCalMsproductData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Single Box Calculation Records</h2>
                            <p className="text-gray-600">Manage your single product and box calculations</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/calculationproductbox")}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200"
                            >
                                <ArrowLeft size={20} />
                                Back to Calculator
                            </button>
                            <AlertDialog.Root>
                                <DialogAdd getCalmsproductData={getCalMsproductData} calculationType="single" />
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
                                        Type
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
                                    calculations
                                        .map((cal_msproduct, index) => (
                                            <Table.Row
                                                key={cal_msproduct.document_product_no}
                                                className={`
                                                    border-b border-gray-100 
                                                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                    hover:bg-blue-50 transition-all duration-200
                                                `}
                                            >
                                                <Table.RowHeaderCell className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {cal_msproduct.document_product_no}
                                                    </div>
                                                </Table.RowHeaderCell>
                                                <Table.Cell className="px-6 py-4 text-center">
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                        Single
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <DialogEditCalmsproduct
                                                            documentProductNo={cal_msproduct.document_product_no}
                                                            calculationType="single"
                                                        />
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <AlertDialogDelete
                                                            getCalMsproductData={getCalMsproductData}
                                                            document_product_id={cal_msproduct.document_product_id}
                                                            document_product_no={cal_msproduct.document_product_no}
                                                        />
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={4} className="px-6 py-8 text-center">
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

            </div>
        </div>
    );
};

export default CalculationProductAndBoxTableSingle;