
"use client"
import { SelectWarehouse, SelectZone } from "../warehouseCalculation/components/ZoneDocumentSelector";
import { TabsExport } from "./components/TabsExport";
import { HeaderExport } from "./components/HeaderExport";
import { ContainerExport } from "./components/ContainerExport";

import { useState } from "react";


const ExportPage = () => {
  const [selectedZone, setZone] = useState<string>('');
  const [warehouse, setWarehouse] = useState<string>('');
  return (
    <ContainerExport>
      <HeaderExport>
        <SelectWarehouse warehouse={warehouse} setWarehouse={setWarehouse} />
        <SelectZone selectedZone={selectedZone} setSelectedZone={setZone} />
      </HeaderExport>
      <TabsExport wareHouse={warehouse} zone={selectedZone} />
    </ContainerExport>
  );
};

export default ExportPage;
