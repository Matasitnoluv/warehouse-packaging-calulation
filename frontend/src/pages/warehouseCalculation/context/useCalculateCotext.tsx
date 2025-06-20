import { getMsrack } from '@/services/msrack.services';
import { getMsshelf } from '@/services/msshelf.services';

import { TypeMsbox } from '@/types/response/reponse.msbox';
import { TypeMsrack } from '@/types/response/reponse.msrack';
import { TypeMsshelfAll } from '@/types/response/reponse.msshelf';

import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { getCalBox } from '@/services/calbox.servicers';
import { TypeCalBox } from '@/types/response/reponse.cal_box';
import { TypeMswarehouse, TypeWarehouseCompile } from '@/types/response/reponse.mswarehouse';
import { getShelfBoxStorage, getStorageShelfBox } from '@/services/shelfBoxStorage.services';

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
  documentId: string;
  dataCompile?:TypeWarehouseCompile | null
  setDocumentId: (documentId: string) => void;

  setWarehouseId: (warehouseId: string) => void;
  setWarehouse: React.Dispatch<React.SetStateAction<TypeMswarehouse | null>>;
  setZoneName: React.Dispatch<React.SetStateAction<string>>;
  setZone: React.Dispatch<React.SetStateAction<string>>;
  setDocument: (document: string) => void;
  setShowCalculateDialog: React.Dispatch<React.SetStateAction<boolean>>;

  selectedZones: { id: string; name: string }[];
  setSelectedZones: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
}

// ✅ Context เริ่มต้น
const CalculateContext = createContext<CalculateContextType | undefined>(undefined);

// ✅ Provider
export const CalculateProvider = ({ children, warehouseNo, defaultZone, defaultDocument, defaultWarehouse }: { warehouseNo: string, children: ReactNode, defaultZone: string, defaultDocument?: string, defaultWarehouse: string }) => {
  const [zone, setZone] = useState<string>(defaultZone);
  const [document, setDocument] = useState<CalculateContextType['document']>(defaultDocument);
  const [documentId, setDocumentId] = useState<string>("");
  const [showCalculateDialog, setShowCalculateDialog] = useState<boolean>(!defaultWarehouse? false :true);
  const [warehouse, setWarehouse] = useState<TypeMswarehouse | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>(defaultWarehouse);
  const [zoneName, setZoneName] = useState<string>("");
  const [selectedZones, setSelectedZones] = useState<{ id: string; name: string }[]>([]);
  const { data: dataCompile } = useQuery({
    queryKey: ['storage',warehouseId ],
    queryFn: () => getStorageShelfBox(warehouseId),
    enabled: !!warehouseId,
  });
  const { data: boxData } = useQuery({
    queryKey: ['box', document],
    queryFn: () => getCalBox(document),
    enabled: !!document,
  });
  const boxs = boxData?.responseObject ? boxData.responseObject : []
  return (
    <CalculateContext.Provider value={{
      dataCompile:dataCompile?.responseObject,
      warehouseNo, showCalculateDialog, warehouse, warehouseId,
      setWarehouseId, setWarehouse, setShowCalculateDialog, zone, setZone, document, setDocument, zoneName, setZoneName, boxs, documentId, setDocumentId,
      selectedZones, setSelectedZones
    }}>
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
