import { TypeMsbox } from '@/types/response/reponse.msbox';
import { TypeMsrack } from '@/types/response/reponse.msrack';
import { TypeMsshelfAll } from '@/types/response/reponse.msshelf';
import { TypeMszone } from '@/types/response/reponse.mszone';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ✅ สร้าง Interface (Model) ของ Context


export interface CalculateContextType {
  zone: string;
  document: string;
  rack?: TypeMsrack;
  shelf?: TypeMsshelfAll;
  boxPlacements?: TypeMsbox;
  setZone: (zone: string) => void;
  setDocument: (document: string) => void;

}

// ✅ Context เริ่มต้น
const CalculateContext = createContext<CalculateContextType | undefined>(undefined);

// ✅ Provider
export const CalculateProvider = ({ children }: { children: ReactNode }) => {
  const [zone, setZone] = useState<string>("");
  const [document, setDocument] = useState<string>("");

  return (
    <CalculateContext.Provider value={{ zone, setZone, document, setDocument, rack: undefined, shelf: undefined, boxPlacements: undefined }}>
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
