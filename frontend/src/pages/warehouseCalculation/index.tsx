import { useParams } from "react-router-dom";
import ZoneDocumentSelector from "./components/ZoneDocumentSelector";
import BoxShow from "./components/BoxShow";
import { CalculateProvider } from "./context/useCalculateCotext";
import { useQuery } from "@tanstack/react-query";
import { getCalWarehouseByDocumentWarehouseNo } from "@/services/calwarehouse.services";
import CaulateSection from "./components/CaulateSection";

const WarehouseCalculation = () => {
  const { warehouseId: documentWarehouseNo } = useParams<{ warehouseId: string }>();
  const {
    data: calwarehouseData,
    status: calwarehouseStatus,
  } = useQuery({
    queryKey: ['calwarehouse', documentWarehouseNo],
    queryFn: () => getCalWarehouseByDocumentWarehouseNo(documentWarehouseNo!),
    enabled: !!documentWarehouseNo,

  });
  const calwarehouse = calwarehouseData?.responseObject[0];
  if (calwarehouseStatus === 'pending') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full size-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (calwarehouseStatus === 'success' && calwarehouse && documentWarehouseNo) {
    return (
      <CalculateProvider warehouseNo={documentWarehouseNo} defaultDocument={calwarehouse?.cal_msproduct_id} defaultZone={calwarehouse?.master_zone_id} defaultWarehouse={calwarehouse?.master_warehouse_id} >
        <div className="lg:p-4 relative">
          {!calwarehouse?.master_warehouse_id &&<div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Show selected warehouse name if available */}
            {<BoxShow label={"Selected Warehouse"} input={''} />}
            {/* Divider */}
            {/* Selected Document Warehouse No */}
            <BoxShow label={"Document Warehouse No"} input={documentWarehouseNo || <span className="text-gray-400">No document selected</span>} />
            {/* Zone & Document Selector Component */}
            <ZoneDocumentSelector 
              disables={{ selectProduct: !!calwarehouse.master_warehouse_id }}
            />
          </div>}
       <CaulateSection calwarehouse={calwarehouse} />
        </div>
      </CalculateProvider>
    );
  };

}







export default function MainCalculation() {

  return <WarehouseCalculation />
};
