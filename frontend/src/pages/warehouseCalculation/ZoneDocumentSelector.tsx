import React from "react";
import { BoxSelect, Layers } from "lucide-react";

interface ZoneType {
    master_zone_id: string;
    master_zone_name: string;
}

interface DocumentType {
    document_product_id: string;
    document_product_no: string;
}

interface ZoneDocumentSelectorProps {
    zones: ZoneType[];
    selectedZone: string;
    setSelectedZone: (zoneId: string) => void;
    documents: DocumentType[];
    selectedDocument: string;
    setSelectedDocument: (docNo: string) => void;
    onCalculate: () => void;
}

const ZoneDocumentSelector: React.FC<ZoneDocumentSelectorProps> = ({
    zones,
    selectedZone,
    setSelectedZone,
    documents,
    selectedDocument,
    setSelectedDocument,
    onCalculate,
}) => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 mt-8 border border-gray-100">
            {/* Select Zone */}
            <div className="mb-8">
                <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Layers className="text-blue-500 w-5 h-5" /> Select Zone
                </label>
                <select
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-blue-400"
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                >
                    <option value="">-- Select Zone --</option>
                    {zones.map(zone => (
                        <option key={zone.master_zone_id} value={zone.master_zone_id}>
                            {zone.master_zone_name}
                        </option>
                    ))}
                </select>
            </div>
            <hr className="my-6 border-gray-200" />
            {/* Document Box No */}
            <div className="mb-8">
                <label className="block text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <BoxSelect className="text-green-500 w-5 h-5" /> Document Box No
                </label>
                <select
                    className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none text-lg shadow-sm transition-all duration-200 hover:border-green-400"
                    value={selectedDocument}
                    onChange={e => {
                        setSelectedDocument(e.target.value);
                        console.log("Selected document_product_no:", e.target.value);
                    }}
                >
                    <option value="">-- Select Document Box No --</option>
                    {documents.map(doc => (
                        <option key={doc.document_product_id} value={doc.document_product_no}>
                            {doc.document_product_no}
                        </option>
                    ))}
                </select>
            </div>
            {/* Calculate Button */}
            {selectedZone && selectedDocument && (
                <div className="flex justify-end mt-8">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-8 py-3 shadow-lg flex items-center gap-2 text-lg transition-all duration-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        onClick={onCalculate}
                    >
                        <BoxSelect className="w-5 h-5 mr-1" />
                        Calculate
                    </button>
                </div>
            )}
        </div>
    );
};

export default ZoneDocumentSelector; 