import { getMsrack } from '@/services/msrack.services';
import { getMsshelf } from '@/services/msshelf.services';

import { TypeMsbox } from '@/types/response/reponse.msbox';
import { TypeMsrack } from '@/types/response/reponse.msrack';
import { TypeMsshelfAll } from '@/types/response/reponse.msshelf';

import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { getCalBox } from '@/services/calbox.servicers';
import { TypeCalBox } from '@/types/response/reponse.cal_box';
import { TypeMswarehouse } from '@/types/response/reponse.mswarehouse';

export interface CalculateContextType {
  zone: string;
  zoneName: string;
  document: string | undefined;
  showCalculateDialog: boolean;
  rack?: TypeMsrack[] | null;
  shelf?: TypeMsshelfAll[] | null;
  boxs?: TypeCalBox[] | null;
  boxPlacements?: TypeMsbox;
  warehouse?: TypeMswarehouse | null;
  warehouseId: string;
  warehouseNo: string;

  setWarehouseId: (warehouseId: string) => void;
  setWarehouse: (warehouse: TypeMswarehouse) => void;
  setZoneName: React.Dispatch<React.SetStateAction<string>>;
  setZone: (zone: string) => void;
  setDocument: (document: string) => void;
  setShowCalculateDialog: React.Dispatch<React.SetStateAction<boolean>>;


}

// ✅ Context เริ่มต้น
const CalculateContext = createContext<CalculateContextType | undefined>(undefined);

// ✅ Provider
export const CalculateProvider = ({ children, warehouseNo, defaultZone, defaultDocument, defaultWarehouse }: { warehouseNo: string, children: ReactNode, defaultZone: string, defaultDocument?: string, defaultWarehouse: string }) => {
  const [zone, setZone] = useState<string>(defaultZone);
  const [document, setDocument] = useState<CalculateContextType['document']>(defaultDocument);
  const [showCalculateDialog, setShowCalculateDialog] = useState<boolean>(false);
  const [warehouse, setWarehouse] = useState<TypeMswarehouse | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>(defaultWarehouse);
  const [zoneName, setZoneName] = useState<string>("");
  useEffect(() => {
    defaultDocument && setDocument(defaultDocument);

  }, [defaultDocument])

  const { data: rackData } = useQuery({
    queryKey: ['rack', zone],
    queryFn: () => getMsrack(zone!),
    enabled: !!zone,
  });
  const rack = rackData?.responseObject
  const { data: shelfData } = useQuery({
    queryKey: ['shelf', rack?.[0]?.master_rack_id],
    queryFn: () => getMsshelf(rack?.[0]?.master_rack_id),
    enabled: !!rack?.[0]?.master_rack_id,
  });
  const shelf = shelfData?.responseObject ? shelfData.responseObject : [];

  const { data: boxData } = useQuery({
    queryKey: ['box', document],
    queryFn: () => getCalBox(document),
    enabled: !!document,
  });
  const boxs = boxData?.responseObject ? boxData.responseObject : []

  return (
    <CalculateContext.Provider value={{ warehouseNo, showCalculateDialog, warehouse, warehouseId, setWarehouseId, setWarehouse, setShowCalculateDialog, zone, setZone, document, setDocument, zoneName, setZoneName, rack, shelf, boxs }}>
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
