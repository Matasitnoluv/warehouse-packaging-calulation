// await shelfBoxStorageService.getStoredWareHouseDocumentNo(documentWarehouseNo);

import { Button } from "@radix-ui/themes";
import { TypeCalWarehouseAll } from "@/types/response/reponse.cal_warehouse";
import _ from "lodash";
import { useNavigate } from "react-router-dom";


const EditButton = ({ calWarehouse }: { calWarehouse: TypeCalWarehouseAll }) => {
    const navigate = useNavigate();
    if (!calWarehouse?.master_warehouse_id) return null
    return (
        <Button onClick={() => navigate(`/warehouse-calculation/${calWarehouse.master_warehouse_id}`)}>
            Edit
        </Button>
    )
}
export default EditButton;