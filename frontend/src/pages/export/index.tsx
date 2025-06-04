import React, { useEffect, useState } from "react";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { exportBox, getExportLogs, getStoredBoxesForExport } from "@/services/exportBox.services";
import { getMsrack } from "@/services/msrack.services";
import toast from "react-hot-toast";

// Define types
interface Warehouse {
  master_warehouse_id: string;
  master_warehouse_name: string;
}

interface Zone {
  master_zone_id: string;
  master_zone_name: string;
  master_warehouse_id: string;
}

interface Rack {
  master_rack_id: string;
  master_rack_name: string;
  master_zone_id: string;
  status: string;
}

interface StoredBox {
  storage_id: string;
  master_rack_id: string;
  master_rack_name: string;
  master_zone_name: string;
  master_warehouse_name: string;
  cal_box_id: string;
  stored_date: string;
  stored_by: string | null;
  position: number | null;
  status: string;
  document_product_no: string;
  cubic_centimeter_box: number;
  count: number;
  total_volume: number;
  box_no: number;
  master_box_name: string;
  master_product_name: string;
}

// Interface for grouped documents
interface DocumentGroup {
  document_product_no: string;
  boxes: StoredBox[];
  boxCount: number;
  warehouse: string;
  zone: string;
  rack: string;
  stored_date: string;
}

interface ExportLog {
  export_id: string;
  box_no: string;
  master_product_name: string;
  master_rack_name: string;
  master_zone_name: string;
  master_warehouse_name: string;
  customer_name: string;
  export_date: string;
  export_customer_address?: string;
  export_note?: string;
}

const ExportPage: React.FC = () => {
  // State for data
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [filteredRacks, setFilteredRacks] = useState<Rack[]>([]);
  const [storedBoxes, setStoredBoxes] = useState<StoredBox[]>([]);
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);

  // State for selections
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentGroup | null>(null);

  // UI state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDocumentDetailsOpen, setIsDocumentDetailsOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [exportNote, setExportNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("export");

  // Fetch warehouses on component mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoading(true);
      try {
        const response = await getMswarehouse();
        console.log('Warehouse response:', response);
        if (response.success === true && response.responseObject) {
          setWarehouses(response.responseObject);
        } else {
          // Fallback data if API fails
          setWarehouses([
            { master_warehouse_id: '1', master_warehouse_name: 'Warehouse A' },
            { master_warehouse_id: '2', master_warehouse_name: 'Warehouse B' },
            { master_warehouse_id: '3', master_warehouse_name: 'Warehouse C' }
          ]);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        toast.error("Failed to fetch warehouses");
        // Fallback data if API fails
        setWarehouses([
          { master_warehouse_id: '1', master_warehouse_name: 'Warehouse A' },
          { master_warehouse_id: '2', master_warehouse_name: 'Warehouse B' },
          { master_warehouse_id: '3', master_warehouse_name: 'Warehouse C' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Fetch zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      setIsLoading(true);
      try {
        const response = await getMszone();
        console.log('Zone response:', response);
        if (response.success === true && response.responseObject) {
          setZones(response.responseObject);
        }
      } catch (error) {
        console.error("Error fetching zones:", error);
        toast.error("Failed to fetch zones");
      } finally {
        setIsLoading(false);
      }
    };

    fetchZones();
  }, []);

  // Fetch racks on component mount
  useEffect(() => {
    const fetchRacks = async () => {
      setIsLoading(true);
      try {
        const response = await getMsrack();
        console.log('Rack response:', response);
        if (response.success === true && response.responseObject) {
          setRacks(response.responseObject);
        }
      } catch (error) {
        console.error("Error fetching racks:", error);
        toast.error("Failed to fetch racks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRacks();
  }, []);

  // Group boxes by document number
  const groupBoxesByDocument = (boxes: StoredBox[]): DocumentGroup[] => {
    const groups: Record<string, StoredBox[]> = {};

    boxes.forEach(box => {
      const docNo = box.document_product_no || 'Unknown';
      if (!groups[docNo]) {
        groups[docNo] = [];
      }
      groups[docNo].push(box);
    });

    // Convert to array of DocumentGroup
    return Object.entries(groups).map(([docNo, boxes]) => {
      // Use the first box for common information
      const firstBox = boxes[0];
      return {
        document_product_no: docNo,
        boxes: boxes,
        boxCount: boxes.length,
        warehouse: firstBox.master_warehouse_name,
        zone: firstBox.master_zone_name,
        rack: firstBox.master_rack_name,
        stored_date: firstBox.stored_date
      };
    });
  };

  // Filter zones when warehouse is selected
  useEffect(() => {
    if (selectedWarehouse) {
      const filtered = zones.filter(
        (zone) => zone.master_warehouse_id === selectedWarehouse
      );
      setFilteredZones(filtered);
      setSelectedZone(""); // Reset zone selection when warehouse changes
      setSelectedRack(""); // Reset rack selection when warehouse changes
    } else {
      setFilteredZones([]);
      setSelectedZone("");
      setSelectedRack("");
    }
  }, [selectedWarehouse, zones]);

  // Filter racks when zone is selected
  useEffect(() => {
    if (selectedZone) {
      const filtered = racks.filter(
        (rack) => rack.master_zone_id === selectedZone
      );
      setFilteredRacks(filtered);
      setSelectedRack(""); // Reset rack selection when zone changes
    } else {
      setFilteredRacks([]);
      setSelectedRack("");
    }
  }, [selectedZone, racks]);

  // Fetch stored boxes when warehouse, zone, or rack is selected
  useEffect(() => {
    const fetchStoredBoxes = async () => {
      if (!selectedWarehouse) return;

      setIsLoading(true);
      try {
        console.log('Fetching stored boxes with:', {
          warehouse_id: selectedWarehouse,
          zone_id: selectedZone || undefined,
          rack_id: selectedRack || undefined
        });

        // Pass rack ID as a parameter if selected
        const response = await getStoredBoxesForExport(
          selectedWarehouse,
          selectedZone || undefined,
          selectedRack || undefined
        );
        console.log('Stored boxes response:', response);

        // Check for success using the actual API response format
        if (response.success === true && response.responseObject) {
          const boxes = response.responseObject;
          setStoredBoxes(boxes);

          // Group boxes by document number
          const groups = groupBoxesByDocument(boxes);
          setDocumentGroups(groups);

          console.log('Document groups created:', groups);
        } else {
          console.error('Failed to fetch stored boxes:', response);
          setStoredBoxes([]);
          setDocumentGroups([]);
        }
      } catch (error) {
        console.error("Error fetching stored boxes:", error);
        toast.error("Failed to fetch stored boxes");
        setStoredBoxes([]);
        setDocumentGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "export") {
      fetchStoredBoxes();
    }
  }, [selectedWarehouse, selectedZone, selectedRack, activeTab]);

  // Fetch export logs when tab changes to logs
  useEffect(() => {
    const fetchExportLogs = async () => {
      setIsLoading(true);
      try {
        const filters = {
          warehouse_id: selectedWarehouse || undefined,
          zone_id: selectedZone || undefined,
        };
        const response = await getExportLogs(filters);
        if (response.success === true && response.responseObject) {
          setExportLogs(response.responseObject);
        } else {
          setExportLogs([]);
        }
      } catch (error) {
        console.error("Error fetching export logs:", error);
        toast.error("Failed to fetch export logs");
        setExportLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "logs") {
      fetchExportLogs();
    }
  }, [activeTab, selectedWarehouse, selectedZone]);

  // Handle warehouse selection
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
  };

  // Handle zone selection
  const handleZoneChange = (value: string) => {
    setSelectedZone(value);
  };

  // Handle rack selection
  const handleRackChange = (value: string) => {
    setSelectedRack(value);
  };

  // Handle document selection for viewing details
  const handleDocumentSelect = (document: DocumentGroup) => {
    setSelectedDocument(document);
    setIsDocumentDetailsOpen(true);
  };

  // Handle document export
  const handleDocumentExport = (document: DocumentGroup) => {
    setSelectedDocument(document);
    setIsExportDialogOpen(true);
  };

  // Close document details modal
  const handleCloseDetails = () => {
    setIsDocumentDetailsOpen(false);
    setSelectedDocument(null);
  };

  // Close export dialog
  const handleCloseExportDialog = () => {
    setIsExportDialogOpen(false);
    setCustomerName("");
    setExportNote("");
  };

  // Handle export submission for a document (all boxes in the document)
  const handleExportSubmit = async () => {
    if (!selectedDocument || !customerName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Export all boxes in the document
      const boxIds = selectedDocument.boxes.map(box => box.storage_id);
      const successfulExports: string[] = [];

      // Process each box in the document
      for (const boxId of boxIds) {
        const payload = {
          storage_id: boxId,
          customer_name: customerName,
          export_note: exportNote || undefined,
        };

        const response = await exportBox(payload);
        if (response.status === "Success" || response.success === true) {
          successfulExports.push(boxId);
        }
      }

      if (successfulExports.length > 0) {
        toast.success(`${successfulExports.length} boxes exported successfully`);

        // Reset form and close dialog
        setCustomerName("");
        setExportNote("");
        setSelectedDocument(null);
        setIsExportDialogOpen(false);

        // Refresh the stored boxes list
        const updatedBoxes = storedBoxes.filter(
          (box) => !successfulExports.includes(box.storage_id)
        );
        setStoredBoxes(updatedBoxes);

        // Update document groups
        const updatedGroups = groupBoxesByDocument(updatedBoxes);
        setDocumentGroups(updatedGroups);
      } else {
        toast.error("Failed to export any boxes");
      }
    } catch (error) {
      console.error("Error exporting boxes:", error);
      toast.error("Failed to export boxes");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Export Management</h1>
          <p className="text-gray-600 mb-6">จัดการการส่งออกกล่องสินค้าในคลัง</p>
          <div className="flex gap-4 mb-6 flex-col md:flex-row">
            <div className="w-full md:w-1/3">
              <label htmlFor="warehouse" className="block mb-1 font-medium text-gray-700">Warehouse</label>
              <select
                id="warehouse"
                className="w-full h-10 p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                value={selectedWarehouse}
                onChange={(e) => handleWarehouseChange(e.target.value)}
              >
                <option value="">เลือกคลังสินค้า</option>
                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse.master_warehouse_id}
                    value={warehouse.master_warehouse_id}
                  >
                    {warehouse.master_warehouse_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="zone" className="block mb-1 font-medium text-gray-700">Zone</label>
              <select
                id="zone"
                className="w-full h-10 p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                value={selectedZone}
                onChange={(e) => handleZoneChange(e.target.value)}
                disabled={!selectedWarehouse}
              >
                <option value="">เลือกโซน</option>
                {filteredZones.map((zone) => (
                  <option
                    key={zone.master_zone_id}
                    value={zone.master_zone_id}
                  >
                    {zone.master_zone_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="rack" className="block mb-1 font-medium text-gray-700">Rack</label>
              <select
                id="rack"
                className="w-full h-10 p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                value={selectedRack}
                onChange={(e) => handleRackChange(e.target.value)}
                disabled={!selectedZone}
              >
                <option value="">เลือกรหัสชั้นวาง</option>
                {filteredRacks.map((rack) => (
                  <option
                    key={rack.master_rack_id}
                    value={rack.master_rack_id}
                  >
                    {rack.master_rack_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Content Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-4 border-b flex gap-4">
            <button
              className={`py-2 px-4 rounded-t-lg font-medium transition-colors duration-200 ${activeTab === 'export' ? 'bg-green-100 text-green-700 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-600'}`}
              onClick={() => setActiveTab('export')}
            >
              กล่องที่รอส่งออก
            </button>
            <button
              className={`py-2 px-4 rounded-t-lg font-medium transition-colors duration-200 ${activeTab === 'logs' ? 'bg-green-100 text-green-700 border-b-2 border-green-500' : 'text-gray-500 hover:text-green-600'}`}
              onClick={() => setActiveTab('logs')}
            >
              ประวัติการส่งออก
            </button>
          </div>
          {activeTab === 'export' && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">กล่องที่พร้อมส่งออก</h2>
              <p className="text-gray-600 mb-4">เลือกเอกสารเพื่อดูรายละเอียดหรือส่งออกกล่องทั้งหมดในเอกสาร</p>
              {isLoading ? (
                <div className="flex justify-center p-4">กำลังโหลด...</div>
              ) : documentGroups.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left font-semibold text-gray-900">เลขที่เอกสาร</th>
                        <th className="p-3 text-left font-semibold text-gray-900">จำนวนกล่อง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">คลัง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">โซน</th>
                        <th className="p-3 text-left font-semibold text-gray-900">ชั้นวาง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">วันที่จัดเก็บ</th>
                        <th className="p-3 text-left font-semibold text-gray-900">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentGroups.map((doc) => (
                        <tr key={doc.document_product_no} className="border-t hover:bg-gray-50 transition-colors duration-150">
                          <td className="p-3">{doc.document_product_no}</td>
                          <td className="p-3">{doc.boxCount}</td>
                          <td className="p-3">{doc.warehouse}</td>
                          <td className="p-3">{doc.zone}</td>
                          <td className="p-3">{doc.rack}</td>
                          <td className="p-3">{formatDate(doc.stored_date)}</td>
                          <td className="p-3 flex gap-2">
                            <button
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                              onClick={() => handleDocumentSelect(doc)}
                            >
                              รายละเอียด
                            </button>
                            <button
                              className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-150"
                              onClick={() => handleDocumentExport(doc)}
                            >
                              ส่งออก
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  ไม่มีกล่องที่พร้อมส่งออก
                </div>
              )}
            </div>
          )}
          {activeTab === 'logs' && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">ประวัติการส่งออก</h2>
              <p className="text-gray-600 mb-4">ประวัติการส่งออกกล่องสินค้าไปยังลูกค้า</p>
              {isLoading ? (
                <div className="flex justify-center p-4">กำลังโหลด...</div>
              ) : exportLogs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left font-semibold text-gray-900">เลขกล่อง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">สินค้า</th>
                        <th className="p-3 text-left font-semibold text-gray-900">ชั้นวาง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">โซน</th>
                        <th className="p-3 text-left font-semibold text-gray-900">คลัง</th>
                        <th className="p-3 text-left font-semibold text-gray-900">ลูกค้า</th>
                        <th className="p-3 text-left font-semibold text-gray-900">วันที่ส่งออก</th>
                        <th className="p-3 text-left font-semibold text-gray-900">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportLogs.map((log) => (
                        <tr key={log.export_id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                          <td className="p-3">{log.box_no}</td>
                          <td className="p-3">{log.master_product_name}</td>
                          <td className="p-3">{log.master_rack_name}</td>
                          <td className="p-3">{log.master_zone_name}</td>
                          <td className="p-3">{log.master_warehouse_name}</td>
                          <td className="p-3">{log.customer_name}</td>
                          <td className="p-3">{formatDate(log.export_date)}</td>
                          <td className="p-3">{log.export_note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  ไม่พบประวัติการส่งออก
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {isDocumentDetailsOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Document Details: {selectedDocument.document_product_no}</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p><strong>Warehouse:</strong> {selectedDocument.warehouse}</p>
              <p><strong>Zone:</strong> {selectedDocument.zone}</p>
              <p><strong>Rack:</strong> {selectedDocument.rack}</p>
              <p><strong>Box Count:</strong> {selectedDocument.boxCount}</p>
              <p><strong>Stored Date:</strong> {formatDate(selectedDocument.stored_date)}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Boxes in this Document:</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Box No</th>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Count</th>
                    <th className="p-2 text-left">Volume (cm³)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDocument.boxes.map((box) => (
                    <tr key={box.storage_id} className="border-t">
                      <td className="p-2">{box.box_no}</td>
                      <td className="p-2">{box.master_product_name}</td>
                      <td className="p-2">{box.count}</td>
                      <td className="p-2">{box.cubic_centimeter_box}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCloseDetails();
                  handleDocumentExport(selectedDocument);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export All Boxes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {isExportDialogOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Export Document</h2>
              <button
                onClick={handleCloseExportDialog}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p><strong>Document:</strong> {selectedDocument.document_product_no}</p>
              <p><strong>Box Count:</strong> {selectedDocument.boxCount}</p>
              <p><strong>Warehouse:</strong> {selectedDocument.warehouse}</p>
              <p><strong>Zone:</strong> {selectedDocument.zone}</p>
              <p><strong>Rack:</strong> {selectedDocument.rack}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="customerName" className="block mb-1 font-medium">Customer Name *</label>
              <input
                id="customerName"
                type="text"
                className="w-full p-2 border rounded"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="exportNote" className="block mb-1 font-medium">Export Note</label>
              <textarea
                id="exportNote"
                className="w-full p-2 border rounded"
                value={exportNote}
                onChange={(e) => setExportNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleExportSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isLoading || !customerName}
              >
                {isLoading ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
