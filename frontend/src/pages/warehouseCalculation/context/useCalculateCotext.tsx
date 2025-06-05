import { getMsrack } from '@/services/msrack.services';
import { getMsshelf } from '@/services/msshelf.services';
import { getMsbox } from '@/services/msbox.services';
import { TypeMsbox } from '@/types/response/reponse.msbox';
import { TypeMsrack } from '@/types/response/reponse.msrack';
import { TypeMsshelfAll } from '@/types/response/reponse.msshelf';
import { TypeMszone } from '@/types/response/reponse.mszone';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCalMsproduct, getCalMsproductByNo } from '@/services/calmsproduct.services';
import { TypeCalMsproduct } from '@/types/response/reponse.cal_msproduct';
import { getCalBox } from '@/services/calbox.servicers';
import { TypeCalBox } from '@/types/response/reponse.cal_box';
import { TypeCalWarehouse } from '@/types/response/reponse.cal_warehouse';

// ✅ สร้าง Interface (Model) ของ Context


export interface CalculateContextType {
  zone: string;
  document: string;
  showCalculateDialog: boolean;
  rack?: TypeMsrack[];
  shelf?: TypeMsshelfAll[] | null;
  boxs?: TypeCalBox[] | null;
  boxPlacements?: TypeMsbox;
  warehouse: string;
  warehouseNo: string;
  setWarehouse: (warehouse: string) => void;
  setZone: (zone: string) => void;
  setDocument: (document: string) => void;
  setShowCalculateDialog: React.Dispatch<React.SetStateAction<boolean>>;


}

// ✅ Context เริ่มต้น
const CalculateContext = createContext<CalculateContextType | undefined>(undefined);

// ✅ Provider
export const CalculateProvider = ({ children, warehouseNo }: { warehouseNo: string, children: ReactNode }) => {
  const [zone, setZone] = useState<string>("");
  const [document, setDocument] = useState<string>("");
  const [showCalculateDialog, setShowCalculateDialog] = useState<boolean>(false);
  const [warehouse, setWarehouse] = useState<string>("");



  const { data: rackData } = useQuery({
    queryKey: ['rack', zone],
    queryFn: () => getMsrack(zone!),
    enabled: !!zone,
  });
  const rack = rackData?.responseObject
  const { data: shelfData } = useQuery({
    queryKey: ['shelf', zone],
    queryFn: () => getMsshelf(rack?.[0]?.master_rack_id),
    enabled: !!rack?.[0]?.master_rack_id,
  });
  const shelf = shelfData?.responseObject ? shelfData.responseObject : [];

  const { data: boxData } = useQuery({
    queryKey: ['box', zone],
    queryFn: () => getCalBox(document),
    enabled: !!document,
  });
  const boxs = boxData?.responseObject ? boxData.responseObject : []

  return (
    <CalculateContext.Provider value={{ warehouseNo, showCalculateDialog, warehouse, setWarehouse, setShowCalculateDialog, zone, setZone, document, setDocument, rack, shelf, boxs }}>
      {children}
    </CalculateContext.Provider>
  );
};

// ✅ Custom hook
export const useCalculateContext = (): CalculateContextType => {
  const context = useContext(CalculateContext);
  if (!context) {
    throw new Error('useCalculateContext must be used within a CalculateProvider');
  }
  return context;
};
