import { Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { postCalWarehouse, getCalWarehouse } from "@/services/calwarehouse.services";
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

const getNextDocumentNumber = async () => {
    const currentDate = getFormattedDate();
    const prefix = `WH${currentDate}`;

    try {
        const response = await getCalWarehouse();
        if (response.success && response.responseObject) {
            // กรองเฉพาะเอกสารที่มีเลขที่ขึ้นต้นด้วย prefix เดียวกัน
            const todayDocuments = response.responseObject
                .filter((doc: any) => doc.document_warehouse_no.startsWith(prefix))
                .map((doc: any) => {
                    // แยกเอาเฉพาะตัวเลขท้าย
                    const numberPart = doc.document_warehouse_no.replace(prefix, '');
                    return parseInt(numberPart, 10);
                });

            // หาเลขที่มากที่สุด
            const maxNumber = todayDocuments.length > 0 ? Math.max(...todayDocuments) : 0;

            // สร้างเลขที่ใหม่โดยเพิ่มจากเลขที่มากที่สุด
            return `${prefix}${String(maxNumber + 1).padStart(4, "0")}`;
        }
    } catch (error) {
        console.error("Error getting next document number:", error);
    }

    // ถ้าเกิดข้อผิดพลาด ให้เริ่มที่ 1
    return `${prefix}0001`;
};

const DilogAddCalwarehouse = ({ getCalwarehouseData }: DialogCalwarehouseProps) => {
    const [document_warehouse_no, setDocumentWarehouseNo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const initializeDocumentNumber = async () => {
            try {
                const nextNumber = await getNextDocumentNumber();
                if (!controller.signal.aborted) {
                    setDocumentWarehouseNo(nextNumber);
                }
            } catch (error) {
                console.error("Error initializing document number:", error);
                if (!controller.signal.aborted) {
                    const currentDate = getFormattedDate();
                    setDocumentWarehouseNo(`WH${currentDate}0001`);
                }
            }
        };

        initializeDocumentNumber();

        return () => {
            controller.abort();
        };
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
                const nextNumber = await getNextDocumentNumber();
                setDocumentWarehouseNo(nextNumber);
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
            size="3"
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 rounded-lg shadow-md flex items-center transition-colors"
            onClick={handleCreateCalwarehouse}
            disabled={isLoading}
        >
            <Plus className="w-5 h-5 mr-2" />
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
