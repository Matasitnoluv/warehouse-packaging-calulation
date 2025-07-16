import { Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { postCalMsproduct } from "@/services/calmsproduct.services";
import { useNavigate } from "react-router-dom"; // เพิ่ม useNavigate
import { Plus } from "lucide-react";

type DialogCalmsproductProps = {
    getCalmsproductData: () => void;
    calculationType?: "single" | "mixed";
};

const getFormattedDate = () => {
    const now = new Date(); //ดึงวันที่ปัจจุบันจาก
    const year = now.getFullYear(); //แปลง ปี, เดือน, วัน ให้อยู่ในรูปแบบ YYYYMMDD
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`; //คืนค่าเป็นสตริง เช่น 20240306
};

const getNextDocumentNumber = (calculationType: "single" | "mixed") => { //ใช้ getFormattedDate() เพื่อดึงวันที่ปัจจุบัน
    const currentDate = getFormattedDate();
    const prefix = calculationType === "single" ? "S" : "M"; // เพิ่มตัวอักษรนำหน้าตามประเภท
    const lastNumberKey = `last_doc_number_${calculationType}`; // แยก key ตามประเภท
    const lastDateKey = `last_doc_number_date_${calculationType}`; // แยก key วันที่ตามประเภท

    //ตรวจสอบว่าเลขล่าสุดที่ถูกเก็บใน localStorage อยู่ในวันเดียวกันหรือไม่
    //ถ้าเป็นวันเดิม → นำเลขล่าสุดมา +1
    //ถ้าเป็นวันใหม่ → เริ่มใหม่ที่ 1
    const lastNumber = localStorage.getItem(lastDateKey) === currentDate
        ? Number(localStorage.getItem(lastNumberKey) || 0) + 1
        : 1;

    localStorage.setItem(lastDateKey, currentDate);
    localStorage.setItem(lastNumberKey, lastNumber.toString());

    return `(${prefix}Box${currentDate}${String(lastNumber).padStart(4, "0")})`;
};

const DialogAdd = ({ getCalmsproductData, calculationType = "mixed" }: DialogCalmsproductProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [document_product_no, setDocument_product_no] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setDocument_product_no(getNextDocumentNumber(calculationType));
    }, [calculationType]);

    const handleCreateCalmsbox = async () => {
        setIsLoading(true);
        try {
            const response = await postCalMsproduct({
                document_product_no,
                sort_by: 0,
                status: false,
                document_product_id: "",
                calculation_type: calculationType
            });

            if (response.statusCode === 200) {
                setDocument_product_no(getNextDocumentNumber(calculationType));

                navigate("/selectProductandBoxPage", { state: { documentProductNo: document_product_no, calculationType: calculationType } }); // ส่งค่าไปหน้าใหม่พร้อมประเภทการคำนวณ
                setShowSuccessAlert(true);

                setTimeout(() => {
                    setShowSuccessAlert(false);
                    setTimeout(() => {
                        window.location.reload();
                    }, 500); // รออีกครึ่งวิให้ Alert จางหายไปก่อนรีหน้า
                }, 800);

                getCalmsproductData();
            } else {
                alert(response.message || "Unexpected error");
            }
        } catch (error) {
            console.error("Error creating product", error instanceof Error ? error.message : String(error));
            alert("Failed to create product. Please try again.");
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
            onClick={handleCreateCalmsbox}
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

export default DialogAdd;
