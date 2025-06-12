
import { DocumentTypeCalculate } from "../type";
import { useQuery } from "@tanstack/react-query";
import { useCalculateContext } from "../context/useCalculateCotext";
import { ButtonCalculate } from "../warehouseCalculation";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { useCalMsProductQuery, useZoneQuery } from "@/services/queriesHook";
import { Layers } from "lucide-react";
import { useEffect } from "react";

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

export const SelectZone = ({ selectedZone, setSelectedZone, className, setZoneName }: { className?: string, setZoneName?: React.Dispatch<React.SetStateAction<string>>, selectedZone: string, setSelectedZone: (zoneId: string) => void }) => {
    const { data: zones, status } = useZoneQuery()
    useEffect(() => {
        if (selectedZone && setZoneName) {
            const zoneName = zones?.responseObject?.find(zone => zone.master_zone_id === selectedZone)?.master_zone_name || ""
            setZoneName(zoneName)
        }
    }, [selectedZone, setZoneName, zones])

    if (status === 'pending') return "load";
    const zonesData = zones?.responseObject;
    return (
        <div className={className}>
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


export const SelectProducts = ({ document, setDocument, className }: { className?: string, document: string | undefined, setDocument: (document: string) => void }) => {
    const { data: products, status } = useCalMsProductQuery()
    if (status === 'pending') return "load";
    const productsData = products?.responseObject;
    return (
        <div className={className}>
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

export const SelectWarehouse = ({ warehouseId, setWarehouse, className, setWarehouseId }: { className?: string, warehouseId: string, setWarehouse?: (warehouseId: string) => void, setWarehouseId: (warehouseId: string) => void }) => {
    const { data: warehouses, status } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => getMswarehouse()
    })

    if (status === 'pending') return "load";
    const warehousesData = warehouses?.responseObject;
    return (
        <div className={className}>
            <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Layers className="text-blue-500 w-5 h-5" /> Select Warehouse
            </label>
            <select
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
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




const ZoneDocumentSelector = ({ setZone: setMainZone, disables }: { setZone: (zone: string) => void, disables?: { selectProduct?: boolean, selectZone?: boolean } }) => {

    //   const [zones, setZones] = useState<ZoneType[]>([]);
    const { zone, setZone, document, setDocument, warehouse, setWarehouse, setZoneName, setWarehouseId, warehouseId } = useCalculateContext();
    useEffect(() => {
        if (zone) {
            setMainZone(zone)
        }
    }, [zone, setMainZone])

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 mt-8 border border-gray-100">
            {/* Select Zone */}

            <hr className="my-6 border-gray-200" />
            {/* Document Box No */}

            <SelectWarehouse warehouseId={warehouseId} setWarehouseId={setWarehouseId} />
            <hr className="my-4 border-gray-200" />
            <div className="space-y-4 mt-8">

                {!disables?.selectZone && <SelectZone selectedZone={zone} setSelectedZone={setZone} setZoneName={setZoneName} />}
                {!disables?.selectProduct && <SelectProducts document={document} setDocument={setDocument} />}


                <div className="flex justify-end">
                    <ButtonCalculate disabled={!zone || !document || !warehouseId} />
                </div>
            </div>

        </div>
    );
};

export default ZoneDocumentSelector; 