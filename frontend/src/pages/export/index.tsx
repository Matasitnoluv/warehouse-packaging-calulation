"use client"
import { SelectWarehouse } from "../warehouseCalculation/components/ZoneDocumentSelector";
import { SelectZoneSingle } from "./components/SelectZoneSingle";
import { TabsExport } from "./components/TabsExport";
import { HeaderExport } from "./components/HeaderExport";
import { ContainerExport } from "./components/ContainerExport";

import { useState } from "react";


const ExportPage = () => {
  const [selectedZone, setZone] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  return (
    <ContainerExport>
      <HeaderExport>
        <SelectWarehouse warehouseId={warehouseId} setWarehouseId={setWarehouseId} />
        <SelectZoneSingle selectedZone={selectedZone} setMasterWarehouseId={setWarehouseId} setSelectedZone={setZone} master_warehouse_id={warehouseId} />
      </HeaderExport>
      <TabsExport wareHouse={warehouseId} zone={selectedZone} />
    </ContainerExport>
  );
};

export default ExportPage;
