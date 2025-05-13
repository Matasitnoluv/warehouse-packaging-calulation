import { Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { PenSquare } from "lucide-react";

type DialogEditCalmsproductProps = {
    documentProductNo: string;
    calculationType?: "single" | "mixed";
};

const DialogEditCalmsproduct = ({ documentProductNo, calculationType = "mixed" }: DialogEditCalmsproductProps) => {
    const navigate = useNavigate();

    const handleEditCalmsbox = () => {
        navigate("/selectProductandBoxPage", { state: { documentProductNo, calculationType } });
        console.log(documentProductNo);
    };

    return (
        <Button
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            onClick={handleEditCalmsbox}
        >
            <PenSquare size={16} />
            Edit
        </Button>
    );
};

export default DialogEditCalmsproduct;