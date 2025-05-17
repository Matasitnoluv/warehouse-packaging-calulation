import { Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { postCalWarehouse } from "@/services/calwarehouse.service";
import { useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import { Plus } from "lucide-react";

type DialogCalwarehouseProps = {
    getCalwarehouseData: () => void;
};

const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
};

const getNextDocumentNumber = () => {
    const currentDate = getFormattedDate();
    const lastNumberKey = 'last_warehouse_doc_number';
    const lastDateKey = 'last_warehouse_doc_date';

    const lastNumber = localStorage.getItem(lastDateKey) === currentDate
        ? Number(localStorage.getItem(lastNumberKey) || 0) + 1
        : 1;

    localStorage.setItem(lastDateKey, currentDate);
    localStorage.setItem(lastNumberKey, lastNumber.toString());

    return `WH${currentDate}${String(lastNumber).padStart(4, "0")}`;
};

const DilogAddCalwarehouse = ({ getCalwarehouseData }: DialogCalwarehouseProps) => {
    const [document_warehouse_no, setDocumentWarehouseNo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setDocumentWarehouseNo(getNextDocumentNumber());
    }, []);

    const handleCreateCalwarehouse = async () => {
        setIsLoading(true);
        try {
            const response = await postCalWarehouse({
                document_warehouse_no,
                status: true,
                sort_by: 1,
            });

            if (response.statusCode === 200) {
                setDocumentWarehouseNo(getNextDocumentNumber());
                navigate("/calwarehouseTable");
                setShowSuccessAlert(true);
                setTimeout(() => {
                    setShowSuccessAlert(false);
                }, 2000);
                getCalwarehouseData();

            } else {
                alert(response.message || "Unexpected error");
            }
        } catch (error) {
            console.error("Error submitting warehouse document:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className={`
                inline-flex items-center gap-2 px-4 py-2.5 
                bg-blue-500 hover:bg-blue-600 
                text-white font-semibold rounded-lg 
                shadow-md transition-all duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={handleCreateCalwarehouse}
            disabled={isLoading}
        >
            <Plus size={18} />
            {isLoading ? "Creating..." : "Create New"}

            {
                showSuccessAlert && (
                    <div className="fixed bottom-4 right-4 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 transform transition-all duration-500 ease-in-out animate-fade-in-down">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p>Doucument created successfully</p>
                    </div>
                )
            }
        </Button>
    );
};

export default DilogAddCalwarehouse;
