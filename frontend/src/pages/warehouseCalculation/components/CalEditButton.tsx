// await shelfBoxStorageService.getStoredWareHouseDocumentNo(documentWarehouseNo);

import { Button } from "@radix-ui/themes";
import { TypeCalWarehouseAll } from "@/types/response/reponse.cal_warehouse";
import _ from "lodash";
import { useNavigate } from "react-router-dom";


const CalEditButton = ({ calWarehouse }: { calWarehouse: TypeCalWarehouseAll }) => {
    const navigate = useNavigate();

    return (
        <Button onClick={() => navigate(`/warehouse-calculation/${calWarehouse.document_warehouse_no}`)}>


            {calWarehouse?.master_warehouse_id ? "Edit" : "Calculation"}

        </Button>
    )
}
export default CalEditButton;