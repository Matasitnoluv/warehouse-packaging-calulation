"use client"
import { SelectWarehouse } from "../warehouseCalculation/components/ZoneDocumentSelector";
import { SelectZoneSingle } from "./components/SelectZoneSingle";
import { TabsExport } from "./components/TabsExport";
import { HeaderExport } from "./components/HeaderExport";
import { ContainerExport } from "./components/ContainerExport";

import { useState, useEffect } from "react";


const ExportPage = () => {
  const [selectedZone, setZone] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  // ล้างการค้นหาเมื่อเปลี่ยน warehouse หรือ zone
  useEffect(() => {
    setSearchKeyword('');
  }, [warehouseId, selectedZone]);

  return (
    <ContainerExport>
      <HeaderExport onSearch={handleSearch} searchKeyword={searchKeyword}>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <SelectWarehouse warehouseId={warehouseId} setWarehouseId={setWarehouseId} />
          <SelectZoneSingle
            selectedZone={selectedZone}
            setMasterWarehouseId={setWarehouseId}
            setSelectedZone={setZone}
            master_warehouse_id={warehouseId}
          />
        </div>
      </HeaderExport>
      <TabsExport wareHouse={warehouseId} zone={selectedZone} searchKeyword={searchKeyword} />
    </ContainerExport>
  );
};

export default ExportPage;
