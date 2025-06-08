import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { getMswarehouse, getMswarehouseById, getMswarehouseUsage } from "@/services/mswarehouse.services";
import ZoneDocumentSelector from "./components/ZoneDocumentSelector";
import DialogCaulate from "./components/dialogCaulate";
import BoxShow from "./components/BoxShow";
import { CalculateProvider, useCalculateContext } from "./context/useCalculateCotext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@radix-ui/themes";
import { getCalWarehouse, getCalWarehouseByDocumentWarehouseNo, getCalWarehouseByMasterWarehouseId } from "@/services/calwarehouse.services";
import { getShelfBoxStorage, getShelfBoxStorageByDocumentWarehouseNo } from "@/services/shelfBoxStorage.services";
// Update the calculateBoxPlacement function with proper types

const WarehouseCalculation = () => {
  const { warehouseId: documentWarehouseNo } = useParams<{ warehouseId: string }>();

  const {
    data: calwarehouseData,
    isLoading: isCalLoading,
    isError: isCalError,
    status: calwarehouseStatus,
  } = useQuery({
    queryKey: ['calwarehouse', documentWarehouseNo],
    queryFn: () => getCalWarehouseByDocumentWarehouseNo(documentWarehouseNo!),
    enabled: !!documentWarehouseNo,

  });
  const calwarehouse = calwarehouseData?.responseObject[0];

  const {
    data: shelfBoxStorageData,
    status: statusShelf,
    isLoading: isShelfLoading,
    isError: isShelfError,
  } = useQuery({
    queryKey: ['shelfBoxStorage', documentWarehouseNo],
    queryFn: () => getShelfBoxStorageByDocumentWarehouseNo(documentWarehouseNo!),
    enabled: !!documentWarehouseNo,
    refetchOnMount: true,
  });
  const shelfBoxStorage_ = shelfBoxStorageData?.responseObject || []

  const shelfBoxStorage = shelfBoxStorage_
    .map(item => item.cal_box?.document_product_no)
    .filter(Boolean); // ตัดค่า null/undefined ออก


  if (calwarehouseStatus === 'pending') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  if (calwarehouseStatus === 'success' && calwarehouse && documentWarehouseNo) {
    return (
      <CalculateProvider warehouseNo={documentWarehouseNo} defaultDocument={shelfBoxStorage?.[shelfBoxStorage.length - 1]} defaultZone={calwarehouse?.master_zone_id} defaultWarehouse={calwarehouse?.master_warehouse_id} >
        <div className="p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Show selected warehouse name if available */}
            {<BoxShow label={"Selected Warehouse"} input={
              ''
            }
            />}
            {/* Divider */}

            {/* Selected Document Warehouse No */}
            <BoxShow label={"Document Warehouse No"} input={documentWarehouseNo || <span className="text-gray-400">No document selected</span>} />
            {/* Zone & Document Selector Component */}
            <ZoneDocumentSelector />



            {<DialogCaulate shelfBoxStorage={shelfBoxStorageData?.responseObject!} />}


          </div>


        </div>
      </CalculateProvider>
    );
  };

}

export const ButtonCalculate = ({ disabled }: { disabled?: boolean }) => {
  const { setShowCalculateDialog } = useCalculateContext();
  return (
    <Button onClick={() => setShowCalculateDialog(prev => !prev)} disabled={disabled}>
      Calculate
    </Button>
  )
}
export default WarehouseCalculation;