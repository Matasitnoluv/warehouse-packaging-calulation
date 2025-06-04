import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { getMswarehouse, getMswarehouseById, getMswarehouseUsage } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf, getMsshelfByZone } from "@/services/msshelf.services";
import { getCalBox } from "@/services/calbox.services";
import { getCalMsproduct } from "@/services/calmsproduct.services";
import { shelfBoxStorageService, StoreBoxPayload as ShelfStoreBoxPayload } from "@/services/shelfBoxStorage.services";
import ZoneDocumentSelector from "./components/ZoneDocumentSelector";
import { getCalWarehouse } from "@/services/calwarehouse.services";
import ErrorWareHouse from "./components/ErrorWareHouse";
import { ApiResponse, BoxFitResult, DocumentTypeCalculate, BoxPlacement, BoxType, CalculateSummary, RackBoxStorage, RackSpaceSummary, RackType, ShelfStoredBoxType, ShelfType, ShelfWithFitBoxes, StoredBoxType, WarehouseType, ZoneType, DocumentWarehouseType } from "./type";
import DialogCaulate from "./components/dialogCaulate";
import BoxShow from "./components/BoxShow";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct copy";
import { CalculateProvider } from "./context/useCalculateCotext";
import { useQuery } from "@tanstack/react-query";
// Update the calculateBoxPlacement function with proper types
const calculateBoxPlacement = (
  boxes: BoxType[],
  racks: RackType[],
  shelves: ShelfType[]
): BoxPlacement[] => {
  const placements: BoxPlacement[] = [];
  let rackIndex = 0;
  let shelfIndex = 0;
  let usedShelfVolume: { [shelfId: string]: number } = {};

  // Sort shelves by level
  const sortedRacks = [...racks];
  const sortedShelves = shelves
    .slice()

  for (const box of boxes) {
    let placed = false;

    while (rackIndex < sortedRacks.length && !placed) {
      const rack = sortedRacks[rackIndex];
      const shelvesInRack = sortedShelves.filter((s: ShelfType) => s.master_rack_id === rack.master_rack_id);

      while (shelfIndex < shelvesInRack.length && !placed) {
        const shelf = shelvesInRack[shelfIndex];
        const used = usedShelfVolume[shelf.master_shelf_id] || 0;
        const boxVolume = box.cubic_centimeter_box;

        if (used + boxVolume <= shelf.cubic_centimeter_shelf) {
          placements.push({
            box: {
              ...box,
              cal_box_id: box.cal_box_id,
              document_product_no: box.document_product_no,
              cubic_centimeter_box: box.cubic_centimeter_box,
              count: box.count
            },
            suggestedShelf: shelf,
            suggestedRack: rack,
            volume: boxVolume,
            canFit: true,
          });
          usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
          placed = true;
        } else {
          shelfIndex++;
        }
      }

      if (!placed) {
        rackIndex++;
        shelfIndex = 0;
      }
    }

    if (!placed) {
      placements.push({
        box: {
          ...box,
          cal_box_id: box.cal_box_id,
          document_product_no: box.document_product_no,
          cubic_centimeter_box: box.cubic_centimeter_box,
          count: box.count
        },
        canFit: false,
        volume: box.cubic_centimeter_box * box.count,
      });
    }
  }
  return placements;
};



// const ApiGetAllWarehouse = async () => {
//   const response = await getCalWarehouse();
//   const res = await getMsrack();
//   const res2 = await getMsshelf();
//   const res3 = await getCalBox();
//   const res4 = await getCalMsproduct();
//   const res5 = await getMszone();
//   const res6 = await getMswarehouse()
//   return response.data;
// }
const WarehouseCalculation = () => {
  const { warehouseId: warehouse_master_id } = useParams<{ warehouseId: string }>();
  ;
  const location = useLocation();
  const warehouseName = location.state?.warehouseName;
  const documentWarehouseNo = location.state?.documentWarehouseNo;

  const { data: warehouse, status } = useQuery({
    queryKey: [warehouse_master_id],
    queryFn: () => getMswarehouseById(warehouse_master_id!)
  })



  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <ErrorWareHouse title="Error" message={error} />
  //   );
  // }

  // if (!warehouse) {
  //   return (<ErrorWareHouse title="Warehouse Not Found" message="The requested warehouse could not be found." />)

  // }

  return (
    <CalculateProvider>
      <div className="p-4">
        {/* {status} */}
        {JSON.stringify(warehouse?.responseObject)}
        {/* Calculate Dialog */}
        {/* <DialogCaulate documentWarehouseNo={documentWarehouseNo} showCalculateDialog={showCalculateDialog} setShowCalculateDialog={setShowCalculateDialog}
        calculateSummary={calculateSummary}
        zones={zones}
      /> */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
          {/* Show selected warehouse name if available */}
          {warehouse?.responseObject && <BoxShow label={"Selected Warehouse"} input={
            Array.isArray(warehouse?.responseObject)
              ? warehouse?.responseObject[0]?.master_warehouse_name ?? ''
              : warehouse?.responseObject?.master_warehouse_name ?? ''
          }
          />}

          {/* Divider */}
          <hr className="my-4 border-gray-200" />
          {/* Selected Document Warehouse No */}
          <BoxShow label={"Selected Document Warehouse No"} input={documentWarehouseNo || <span className="text-gray-400">No document selected</span>} />

          {/* Zone & Document Selector Component */}
          <ZoneDocumentSelector
          />
        </div>


      </div>
    </CalculateProvider>
  );
};




export default WarehouseCalculation;