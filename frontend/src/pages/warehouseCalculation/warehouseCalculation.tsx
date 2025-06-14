import { useParams } from "react-router-dom";
import ZoneDocumentSelector from "./components/ZoneDocumentSelector";
import DialogCaulate from "./components/dialogCaulate";
import BoxShow from "./components/BoxShow";
import { CalculateProvider, useCalculateContext } from "./context/useCalculateCotext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@radix-ui/themes";
import { getCalWarehouseByDocumentWarehouseNo } from "@/services/calwarehouse.services";
import { getShelfBoxStorageByDocumentWarehouseNoAndZone } from "@/services/shelfBoxStorage.services";
import { useState } from "react";
// Update the calculateBoxPlacement function with proper types

const WarehouseCalculation = () => {
  const { warehouseId: documentWarehouseNo } = useParams<{ warehouseId: string }>();
  const [zone, setZone] = useState<string>("")
  const {
    data: calwarehouseData,

    status: calwarehouseStatus,
  } = useQuery({
    queryKey: ['calwarehouse', documentWarehouseNo],
    queryFn: () => getCalWarehouseByDocumentWarehouseNo(documentWarehouseNo!),
    enabled: !!documentWarehouseNo,

  });
  const calwarehouse = calwarehouseData?.responseObject[0];

  const {
    data: shelfBoxStorageData,
    status: shelfBoxStorageStatus,
  } = useQuery({
    queryKey: ['shelfBoxStorage', documentWarehouseNo, zone],
    queryFn: () => getShelfBoxStorageByDocumentWarehouseNoAndZone(documentWarehouseNo!, zone),
    enabled: !!documentWarehouseNo && !!zone,
    refetchOnMount: true,
  });
  const shelfBoxStorage_ = shelfBoxStorageData?.responseObject || []

  const shelfBoxStorage = shelfBoxStorage_
    .map(item => item.cal_box?.document_product_no)
    .filter(Boolean);


  if (calwarehouseStatus === 'pending') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  if (calwarehouseStatus === 'success' && calwarehouse && documentWarehouseNo) {
    return (
      <CalculateProvider warehouseNo={documentWarehouseNo} defaultDocument={calwarehouse?.cal_msproduct_id} defaultZone={calwarehouse?.master_zone_id} defaultWarehouse={calwarehouse?.master_warehouse_id} >
        <div className="p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Show selected warehouse name if available */}
            {<BoxShow label={"Selected Warehouse"} input={''} />}

            {/* Divider */}

            {/* Selected Document Warehouse No */}
            <BoxShow label={"Document Warehouse No"} input={documentWarehouseNo || <span className="text-gray-400">No document selected</span>} />
            {/* Zone & Document Selector Component */}
            <ZoneDocumentSelector setZone={setZone}
              disables={{ selectProduct: !!calwarehouse.master_warehouse_id }}
            />

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