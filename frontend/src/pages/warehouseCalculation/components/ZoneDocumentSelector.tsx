import React, { useEffect, useState } from "react";
import { BoxSelect, Layers } from "lucide-react";
import CalculationSummary from "./CalculationSummary";
import { DocumentTypeCalculate } from "../type";
import { useQuery } from "@tanstack/react-query";
import { getMszone } from "@/services/mszone.services";
import { getMsbox } from "@/services/msbox.services";
import { getMsproduct } from "@/services/msproduct.services";
import { getCalMsproduct } from "@/services/calmsproduct.services";
import { useCalculateContext } from "../context/useCalculateCotext";
import { ButtonCalculate } from "../warehouseCalculation";
import { getCalWarehouse } from "@/services/calwarehouse.services";
import { getMswarehouse } from "@/services/mswarehouse.services";

interface ZoneType {
    master_zone_id: string;
    master_zone_name: string;
}

interface ZoneDocumentSelectorProps {
    zones: ZoneType[];
    selectedZone: string;
    setSelectedZone: (zoneId: string) => void;
    documents: DocumentTypeCalculate[];
    selectedDocument: string;
    setSelectedDocument: (docNo: string) => void;
    onCalculate: () => void;
}

const SelectZone = ({ selectedZone, setSelectedZone }: { selectedZone: string, setSelectedZone: (zoneId: string) => void }) => {
    const { data: zones, status } = useQuery({
        queryKey: ["zones"],
        queryFn: () => getMszone()
    })
    if (status === 'pending') return "load";
    const zonesData = zones?.responseObject;
    return (
        <div >
            <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Zone
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
            >
                <option value="">-- Select Zone --</option>
                {zonesData?.map(zone => (
                    <option key={zone.master_zone_id} value={zone.master_zone_id}>
                        {zone.master_zone_name}
                    </option>
                ))}
            </select>
        </div>
    )
}


const SelectProducts = ({ document, setDocument }: { document: string, setDocument: (document: string) => void }) => {
    const { data: products, status } = useQuery({
        queryKey: ["products"],
        queryFn: () => getCalMsproduct()
    })
    if (status === 'pending') return "load";
    const productsData = products?.responseObject;
    return (
        <div >
            <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Products
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg  border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={document}
                onChange={e => setDocument(e.target.value)}
            >
                <option value="">-- Select products --</option>
                {productsData?.map((product) => (
                    <option key={product.document_product_no} value={product.document_product_no}>
                        {product.document_product_no}
                    </option>
                ))}
            </select>
        </div>
    )
}

const SelectWarehouse = ({ warehouse, setWarehouse }: { warehouse: string, setWarehouse: (warehouseId: string) => void }) => {
    const { data: warehouses, status } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => getMswarehouse()
    })
    if (status === 'pending') return "load";
    const warehousesData = warehouses?.responseObject;
    return (
        <div>
            <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Warehouse
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={warehouse}
                onChange={e => setWarehouse(e.target.value)}
            >
                <option value="">-- Select Warehouse --</option>
                {warehousesData?.map((warehouse) => (
                    <option key={warehouse.master_warehouse_id} value={warehouse.master_warehouse_id}>
                        {warehouse.master_warehouse_name}
                    </option>
                ))}
            </select>
        </div>
    )
}




const ZoneDocumentSelector = ({ defaultZone, defaultDocument }: { defaultZone?: string, defaultDocument?: string }) => {

    //   const [zones, setZones] = useState<ZoneType[]>([]);
    const { zone, setZone, document, setDocument, warehouse, setWarehouse } = useCalculateContext();


    useEffect(() => { defaultDocument && setDocument(defaultDocument) }, [defaultDocument])

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 mt-8 border border-gray-100">
            {/* Select Zone */}

            <hr className="my-6 border-gray-200" />
            {/* Document Box No */}

            <SelectWarehouse warehouse={warehouse} setWarehouse={setWarehouse} />
            <hr className="my-4 border-gray-200" />
            <div className="space-y-4 mt-8">

                <SelectZone selectedZone={zone} setSelectedZone={setZone} />
                <SelectProducts document={document} setDocument={setDocument} />


                <div className="flex justify-end">
                    <ButtonCalculate disabled={!zone || !document || !warehouse} />
                </div>
            </div>

            {/* Calculate Button */}
            {/* {selectedZone && selectedDocument && (
                <div className="flex justify-end mt-8">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-8 py-3 shadow-lg flex items-center gap-2 text-lg transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        onClick={handleCalculate}
                    >
                        <BoxSelect className="w-5 h-5 mr-1" />
                        Calculate
                    </button>
                </div>
            )} */}

            {/* Calculation Summary */}
            {/* {showCalculation && selectedZone && selectedDocument && (
                <CalculationSummary
                    selectedZone={selectedZone}
                    selectedDocument={selectedDocument}
                    onCalculate={onCalculate}
                />
            )} */}


        </div>
    );
};

export default ZoneDocumentSelector; 