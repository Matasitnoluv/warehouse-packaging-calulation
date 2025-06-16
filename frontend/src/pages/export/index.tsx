
"use client"
import { SelectWarehouse, SelectZone } from "../warehouseCalculation/components/ZoneDocumentSelector";
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
        <SelectZone selectedZone={selectedZone} setSelectedZone={setZone} />
      </HeaderExport>
      <TabsExport wareHouse={warehouseId} zone={selectedZone} />
    </ContainerExport>
  );
};

export default ExportPage;
