// await shelfBoxStorageService.getStoredWareHouseDocumentNo(documentWarehouseNo);

import { Button } from "@radix-ui/themes";
import { TypeCalWarehouse } from "@/types/response/reponse.cal_warehouse";
import _ from "lodash";
import { useNavigate } from "react-router-dom";


const CalEditButton = ({ calWarehouse }: { calWarehouse: TypeCalWarehouse }) => {
    const navigate = useNavigate();
    const pathClick = !calWarehouse?.master_warehouse_id ? calWarehouse.document_warehouse_no : `${calWarehouse.cal_warehouse_id}/edit`
    return (
        <Button onClick={() => navigate(`/warehouse-calculation/${pathClick}`)}>


            {calWarehouse?.master_warehouse_id ? "Edit" : "Calculation"}

        </Button>
    )
}
export default CalEditButton;