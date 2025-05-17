import React from "react";

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
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Select Zone */}
            <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Select Zone
                </label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
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

            {/* Document Product No */}
            <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Document Product No
                </label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
                    value={selectedDocument}
                    onChange={e => {
                        setSelectedDocument(e.target.value);
                        console.log("Selected document_product_no:", e.target.value);
                    }}
                >
                    <option value="">-- Select Document Product No --</option>
                    {documents.map(doc => (
                        <option key={doc.document_product_id} value={doc.document_product_no}>
                            {doc.document_product_no}
                        </option>
                    ))}
                </select>
            </div>

            {/* Calculate Button */}
            {selectedZone && selectedDocument && (
                <div className="flex justify-end">
                    <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-lg"
                        onClick={onCalculate}
                    >
                        Calculate
                    </button>
                </div>
            )}
        </div>
    );
};

export default ZoneDocumentSelector; 