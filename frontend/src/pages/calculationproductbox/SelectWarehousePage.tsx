import { useLocation } from "react-router-dom";
import DialogSelectWarehouse from "./components/dialogSelectWarehouse";

const SelectWarehousePage = () => {
    const location = useLocation();
    const documentWarehouseNo = location.state?.documentWarehouseNo;

    return (
        <div>
            <DialogSelectWarehouse documentWarehouseNo={documentWarehouseNo} />
        </div>
    );
};

export default SelectWarehousePage;