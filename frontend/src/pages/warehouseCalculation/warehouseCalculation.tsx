import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Button, Card, Text, Dialog, Flex, Table, Select, Badge, Separator } from "@radix-ui/themes";
import { ArrowLeft, CheckCircle, Info, X, Plus, Trash2, Edit, Save, AlertCircle, Package, Warehouse, BoxSelect, BarChart3, Layers, Grid3X3 } from "lucide-react";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf } from "@/services/msshelf.services";
import { getCalBox } from "@/services/calbox.services";
import { getCalMsproduct } from "@/services/calmsproduct.services";
import { shelfBoxStorageService, StoreBoxPayload as ShelfStoreBoxPayload } from "@/services/shelfBoxStorage.services";
import { getCalWarehouse, deleteCalWarehouse } from "@/services/calwarehouse.services";
import ZoneDocumentSelector from "./ZoneDocumentSelector";

// Define types
interface WarehouseType {
  master_warehouse_id: string;
  master_warehouse_name: string;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_warehouse: number;
  description: string;
}

interface ZoneType {
  master_zone_id: string;
  master_zone_name: string;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_zone: number;
  description: string;
  master_warehouse_id: string;
}

interface RackType {
  master_rack_id: string;
  master_rack_name: string;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_rack: number;
  description: string;
  master_zone_id: string;
}

interface ShelfType {
  master_shelf_id: string;
  master_shelf_name: string;
  shelf_level: number;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_shelf: number;
  description: string;
  master_rack_id: string;
}

interface DocumentType {
  document_product_id: string;
  document_product_no: string;
  status: boolean;
  status_date: string;
  status_by: string;
  create_by: string;
  create_date: string;
  update_by: string;
  update_date: string;
  sort_by: number;
  master_box_id: string;
  master_product_id: string;
}

interface BoxType {
  cal_box_id: string;
  box_no: number;
  master_box_name: string;
  code_box: string;
  master_product_name: string;
  code_product: string;
  cubic_centimeter_box: number;
  count: number;
  document_product_no: string;
}

interface BoxFitResult {
  box: BoxType;
  fits: boolean;
  isStored: boolean;
  isStoredAnywhere: boolean;
  remainingSpace: number;
}

interface RackSpaceSummary {
  totalRackVolume: number;
  usedVolume: number;
  remainingVolume: number;
  usagePercentage: number;
  fittingBoxes: number;
  totalBoxes: number;
}

interface StoredBoxType {
  storage_id: string;
  master_rack_id: string;
  cal_box_id: string;
  stored_date: string;
  stored_by?: string | null;
  position?: number | null;
  status: string;
  // New fields for volume information
  cubic_centimeter_box?: number;
  count?: number;
  total_volume?: number;
  document_product_no?: string;
  // Box relationship fields
  box?: {
    cal_box_id: string;
    box_no?: number;
    master_box_name?: string;
    code_box?: string;
    master_product_name?: string;
    code_product?: string;
    cubic_centimeter_box?: number;
    count?: number;
    document_product_no?: string;
  }
  // Flattened box fields
  box_no?: number;
  master_box_name?: string;
  code_box?: string;
  master_product_name?: string;
  code_product?: string;
};

interface RackBoxStorage {
  storage_id: string;
  master_rack_id: string;
  cal_box_id: string;
  stored_date: string;
  stored_by?: string | null;
  position?: number | null;
  status: string;
  document_product_no?: string;
  cubic_centimeter_box?: number;
  count?: number;
  total_volume?: number;
  box?: {
    cal_box_id: string;
    box_no?: number;
    master_box_name?: string;
    code_box?: string;
    master_product_name?: string;
    code_product?: string;
    cubic_centimeter_box?: number;
    count?: number;
    document_product_no?: string;
  };
}

// Interface for warehouse overview dashboard
interface WarehouseOverview {
  totalZones: number;
  totalRacks: number;
  totalShelves: number;
  totalBoxesStored: number;
  zoneUsage: {
    totalVolume: number;
    usedForRacks: number;
    remainingVolume: number;
    usagePercentage: number;
  };
  rackUsage: {
    totalVolume: number;
    usedForShelves: number;
    remainingVolume: number;
    usagePercentage: number;
  };
  shelfUsage: {
    totalVolume: number;
    usedForBoxes: number;
    remainingVolume: number;
    usagePercentage: number;
  };
  aisleSpace?: {
    totalVolume: number;
    percentage: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  responseObject: T;
}

// Add new interface for box placement
interface BoxPlacement {
  box: BoxType;
  suggestedShelf: ShelfType;
  suggestedRack: RackType;
  volume: number;
  canFit: boolean;
}

const WarehouseCalculation = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('documentId');
  const location = useLocation();
  const warehouseName = location.state?.warehouseName;
  const documentWarehouseNo = location.state?.documentWarehouseNo;

  // State variables
  const [warehouse, setWarehouse] = useState<WarehouseType | null>(null);
  const [zones, setZones] = useState<ZoneType[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [racks, setRacks] = useState<RackType[]>([]);
  const [selectedRack, setSelectedRack] = useState<string>("");
  const [shelves, setShelves] = useState<ShelfType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const [boxFitResults, setBoxFitResults] = useState<BoxFitResult[]>([]);
  const [rackSpaceSummary, setRackSpaceSummary] = useState<RackSpaceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedBoxes, setStoredBoxes] = useState<StoredBoxType[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [storageSuccess, setStorageSuccess] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [showStoredBoxesDialog, setShowStoredBoxesDialog] = useState(false);
  const [showBulkStorageDialog, setShowBulkStorageDialog] = useState(false);
  const [bulkStorageSuccess, setBulkStorageSuccess] = useState(false);
  const [bulkStorageResults, setBulkStorageResults] = useState<any>({});
  const [autoAssignToOtherRacks, setAutoAssignToOtherRacks] = useState(false);
  const [allStoredBoxes, setAllStoredBoxes] = useState<RackBoxStorage[]>([]);
  const [warehouseRecords, setWarehouseRecords] = useState<Array<{
    document_warehouse_id: string;
    document_warehouse_no: string;
    status: boolean;
    sort_by: number;
  }>>([]);
  const [showWarehouseTable, setShowWarehouseTable] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    document_warehouse_id: string;
    document_warehouse_no: string;
    status: boolean;
    sort_by: number;
  } | null>(null);

  // เพิ่ม state variables สำหรับ auto assign
  const [autoAssignToOtherShelves, setAutoAssignToOtherShelves] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState<any>(null);

  // เพิ่ม state สำหรับการจัดการหน้า
  const [currentPage, setCurrentPage] = useState<'records' | 'calculation'>('records');

  // เพิ่ม state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [calculateSummary, setCalculateSummary] = useState<{ zone: string; document: string; boxPlacements?: BoxPlacement[] } | null>(null);

  // Add new state for error dialog
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add new state for selected rack stored boxes
  const [selectedRackStoredBoxes, setSelectedRackStoredBoxes] = useState<any[]>([]);

  // Fetch warehouse records
  useEffect(() => {
    const fetchWarehouseRecords = async () => {
      try {
        const response = await getCalWarehouse() as ApiResponse<Array<{
          document_warehouse_id: string;
          document_warehouse_no: string;
          status: boolean;
          sort_by: number;
        }>>;
        if (response.success) {
          setWarehouseRecords(response.responseObject || []);
        }
      } catch (error) {
        console.error('Error fetching warehouse records:', error);
      }
    };

    fetchWarehouseRecords();
  }, []);

  // Handle document ID from URL
  useEffect(() => {
    if (documentId) {
      setShowWarehouseTable(true);
      const record = warehouseRecords.find(r => r.document_warehouse_id === documentId);
      if (record) {
        setSelectedRecord(record);
        setEditDialogOpen(true);
      }
    }
  }, [documentId, warehouseRecords]);

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!warehouseId) return;

      try {
        setLoading(true);
        const response = await getMswarehouse() as ApiResponse<WarehouseType[]>;
        console.log("Warehouse data response:", response);
        if (response.success) {
          const warehouseData = response.responseObject.find(
            (w: WarehouseType) => w.master_warehouse_id === warehouseId
          );

          if (warehouseData) {
            console.log("Selected warehouse:", warehouseData);
            setWarehouse(warehouseData);
          } else {
            setError("Warehouse not found");
          }
        } else {
          setError("Failed to load warehouse data");
        }
      } catch (error) {
        setError("An error occurred while fetching warehouse data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, [warehouseId]);

  // Fetch zones for the selected warehouse
  useEffect(() => {
    const fetchZones = async () => {
      if (!warehouseId) return;

      try {
        const response = await getMszone(warehouseId) as ApiResponse<ZoneType[]>;
        console.log("Zones response:", response);
        if (response.success) {
          setZones(response.responseObject || []);
        } else {
          setError("Failed to load zones");
        }
      } catch (error) {
        setError("An error occurred while fetching zones");
        console.error(error);
      }
    };

    fetchZones();
  }, [warehouseId]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getCalMsproduct() as ApiResponse<DocumentType[]>;
        if (response.success) {
          if (Array.isArray(response.responseObject)) {
            setDocuments(response.responseObject);
          } else if (response.responseObject && typeof response.responseObject === 'object') {
            setDocuments([response.responseObject]);
          } else {
            setDocuments([]);
          }
        } else {
          setError("Failed to load documents");
          setDocuments([]);
        }
      } catch (error) {
        setError("An error occurred while fetching documents");
        setDocuments([]);
        console.error(error);
      }
    };
    fetchDocuments();
  }, []);

  // Fetch racks when a zone is selected
  useEffect(() => {
    const fetchRacks = async () => {
      if (!selectedZone) {
        setRacks([]);
        return;
      }

      try {
        const response = await getMsrack(selectedZone) as ApiResponse<RackType[]>;
        console.log("Racks response:", response);
        if (response.success) {
          setRacks(response.responseObject || []);
        } else {
          setError("Failed to load racks");
        }
      } catch (error) {
        setError("An error occurred while fetching racks");
        console.error(error);
      }
    };

    fetchRacks();
  }, [selectedZone]);

  // Fetch shelves when a rack is selected
  useEffect(() => {
    const fetchShelves = async () => {
      if (!selectedRack) {
        setShelves([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getMsshelf(selectedRack);
        if (response.success) {
          const shelfData = response.responseObject || [];
          setShelves(shelfData);
        } else {
          setError(response.message || "Failed to fetch shelves");
        }
      } catch (err) {
        console.error("Error fetching shelves:", err);
        setError("Failed to fetch shelves. The backend API may not be available yet.");
        setShelves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShelves();
  }, [selectedRack]);

  // Fetch boxes when a document is selected
  useEffect(() => {
    if (!selectedDocument) {
      setBoxes([]);
      setBoxFitResults([]);
      setRackSpaceSummary(null);
      return;
    }
    const res = async () => {
      const res = await fetchBoxesForDocument(selectedDocument);
      console.log("Selected Document:", res);
    }
    res();

  }, [selectedDocument]);

  // Fetch boxes stored in the selected rack
  useEffect(() => {
    const fetchStoredBoxes = async () => {
      if (!selectedRack) {
        setStoredBoxes([]);
        return;
      }

      try {
        // console.log("Fetching stored boxes for rack:", selectedRack);
        const response = await shelfBoxStorageService.getStoredBoxesByRackId(selectedRack);

        if (response.success) {
          // console.log("Stored boxes response:", response);
          setStoredBoxes(response.responseObject || []);
        } else {
          console.error("Failed to load stored boxes:", response.message);
        }
      } catch (err) {
        console.error("Error fetching stored boxes:", err);
      }
    };

    fetchStoredBoxes();
  }, [selectedRack]);

  // Track all stored boxes across all racks to filter out completed documents
  useEffect(() => {
    const fetchAllStoredBoxes = async () => {
      try {
        const response = await shelfBoxStorageService.getAllStoredBoxes();
        if (response.success) {
          if (Array.isArray(response.responseObject)) {
            setAllStoredBoxes(response.responseObject);
          } else if (response.responseObject && typeof response.responseObject === 'object') {
            setAllStoredBoxes([response.responseObject]);
          } else {
            setAllStoredBoxes([]);
          }
        } else {
          setAllStoredBoxes([]);
        }
      } catch (err) {
        setAllStoredBoxes([]);
        console.error(err);
      }
    };
    fetchAllStoredBoxes();
  }, [storedBoxes]);

  // Calculate box fit when boxes and selected rack change
  useEffect(() => {
    if (!boxes.length || !selectedRack) {
      setBoxFitResults([]);
      setRackSpaceSummary(null);
      return;
    }

    // Find the selected rack
    const rack = racks.find(r => r.master_rack_id === selectedRack);
    if (!rack) {
      setBoxFitResults([]);
      setRackSpaceSummary(null);
      return;
    }

    // console.log("Calculating box fit for rack:", rack);
    // console.log("Boxes to fit:", boxes);
    // console.log("Stored boxes:", storedBoxes);

    // Get stored box IDs for checking - make sure we're working with an array
    let storedBoxesInThisRack: any[] = [];
    if (storedBoxes && typeof storedBoxes === 'object') {
      if (Array.isArray(storedBoxes)) {
        storedBoxesInThisRack = storedBoxes;
      } else if ('responseObject' in storedBoxes && Array.isArray((storedBoxes as any).responseObject)) {
        storedBoxesInThisRack = (storedBoxes as any).responseObject;
      }
    }

    const storedBoxIds = storedBoxesInThisRack.map((sb: any) => sb.cal_box_id);
    // console.log("Stored box IDs in this rack:", storedBoxIds);

    // Also check all stored boxes across all racks - make sure we're working with an array
    let allStoredBoxesArray: any[] = [];
    if (allStoredBoxes && typeof allStoredBoxes === 'object') {
      if (Array.isArray(allStoredBoxes)) {
        allStoredBoxesArray = allStoredBoxes;
      } else if ('responseObject' in allStoredBoxes && Array.isArray((allStoredBoxes as any).responseObject)) {
        allStoredBoxesArray = (allStoredBoxes as any).responseObject;
      }
    }

    const allStoredBoxIds = allStoredBoxesArray.map((sb: any) => sb.cal_box_id);
    // console.log("All stored box IDs:", allStoredBoxIds);

    // Calculate which boxes fit in the rack
    let totalUsedVolume = 0;

    // First add the volume of already stored boxes in this rack
    if (storedBoxesInThisRack.length > 0) {
      // console.log("Adding volume of stored boxes to used space calculation");
      totalUsedVolume = storedBoxesInThisRack.reduce((total: number, storedBox: any) => {
        // First try to use the total_volume field directly from the stored box
        if (storedBox.total_volume) {
          total += storedBox.total_volume;
          // console.log(`Added stored box total_volume: ${storedBox.total_volume} for box ${storedBox.cal_box_id}`);
        } else if (storedBox.cubic_centimeter_box && storedBox.count) {
          // If total_volume is not available, calculate it from cubic_centimeter_box and count
          total += storedBox.cubic_centimeter_box * storedBox.count;
          // console.log(`Added stored box calculated volume: ${storedBox.cubic_centimeter_box * storedBox.count} for box ${storedBox.cal_box_id}`);
        }
        return total;
      }, 0);
    }

    // console.log(`Initial used volume from stored boxes: ${totalUsedVolume}`);

    let fittingBoxesCount = 0;

    const results = boxes.map((box: BoxType) => {
      const boxVolume = box.cubic_centimeter_box * box.count;

      // Check if this box is stored in this rack or any other rack
      const isStoredInThisRack = storedBoxIds.includes(box.cal_box_id);
      const isStoredAnywhere = allStoredBoxIds.includes(box.cal_box_id);

      // console.log(`Box ${box.cal_box_id} (${box.master_box_name}): Checking if stored - In this rack: ${isStoredInThisRack}, Anywhere: ${isStoredAnywhere}`);

      // If the box is already stored, it doesn't need to fit again
      // If it's not stored, check if it would fit in the remaining space
      const fits = isStoredInThisRack || boxVolume <= (rack.cubic_centimeter_rack - totalUsedVolume);

      // console.log(`Box ${box.cal_box_id} (${box.master_box_name}): Volume=${boxVolume}, Fits=${fits}, IsStoredInThisRack=${isStoredInThisRack}, IsStoredAnywhere=${isStoredAnywhere}`);

      // If the box fits and is not already stored, add its volume to the used space
      if (fits && !isStoredInThisRack) {
        totalUsedVolume += boxVolume;
        fittingBoxesCount++;
        // console.log(`Added fitting box volume: ${boxVolume}, new total: ${totalUsedVolume}`);
      }

      // If the box is already stored, count it as fitting
      if (isStoredInThisRack) {
        fittingBoxesCount++;
        // console.log(`Box ${box.cal_box_id} is already stored, counted as fitting`);
      }

      const remainingSpace = rack.cubic_centimeter_rack - totalUsedVolume;

      return {
        box,
        fits,
        isStored: isStoredInThisRack,
        isStoredAnywhere: isStoredAnywhere,
        remainingSpace
      };
    });

    setBoxFitResults(results);

    // Calculate rack space summary
    const totalRackVolume = rack.cubic_centimeter_rack;

    // Calculate total used volume from already stored boxes only
    let usedVolumeFromStoredBoxes = 0;
    if (storedBoxesInThisRack.length > 0) {
      usedVolumeFromStoredBoxes = storedBoxesInThisRack.reduce((total: number, storedBox: any) => {
        if (storedBox.total_volume) {
          return total + storedBox.total_volume;
        } else if (storedBox.cubic_centimeter_box && storedBox.count) {
          return total + storedBox.cubic_centimeter_box * storedBox.count;
        }
        return total;
      }, 0);
    }

    const usedVolume = usedVolumeFromStoredBoxes;
    const remainingVolume = totalRackVolume - usedVolume;
    const usagePercentage = Math.round((usedVolume / totalRackVolume) * 100);

    const rackSummary: RackSpaceSummary = {
      totalRackVolume,
      usedVolume,
      remainingVolume,
      usagePercentage,
      fittingBoxes: fittingBoxesCount,
      totalBoxes: boxes.length
    };

    // console.log("Rack space summary:", rackSummary);
    setRackSpaceSummary(rackSummary);

  }, [boxes, selectedRack, racks, storedBoxes, allStoredBoxes]);

  // Fetch boxes for selected document
  const fetchBoxesForDocument = async (documentId: string) => {
    if (!documentId) return;

    try {
      const response = await getCalBox(documentId);
      if (response.success) {
        setBoxes(response.responseObject || []);
        // ไม่ต้องเรียก calculateBoxFitResults
      } else {
        setError("Failed to load boxes");
      }
    } catch (err) {
      setError("An error occurred while fetching boxes");
      console.error(err);
    }
  };

  // Function to preview auto-assign distribution
  const previewAutoAssignDistribution = async () => {
    if (!selectedRack || !autoAssignToOtherRacks) {
      setAutoAssignPreview(null);
      return;
    }

    try {
      // Get boxes that fit and are not already stored
      const boxesToStore = boxFitResults.filter(result =>
        result.fits && !result.isStored && !result.isStoredAnywhere
      );

      if (boxesToStore.length === 0) {
        setAutoAssignPreview({ message: "ไม่มีกล่องที่ต้องเก็บเพิ่มเติม", shelves: [] });
        return;
      }

      // Get current rack
      const currentRack = racks.find(r => r.master_rack_id === selectedRack);
      if (!currentRack) {
        setAutoAssignPreview({ message: "ไม่พบข้อมูลชั้นวางที่เลือก", shelves: [] });
        return;
      }

      // Calculate remaining space in current rack
      let remainingSpaceInCurrentRack = currentRack.cubic_centimeter_rack;

      // Subtract space used by already stored boxes
      let storedBoxesInThisRack: any[] = [];
      if (storedBoxes && typeof storedBoxes === 'object') {
        if (Array.isArray(storedBoxes)) {
          storedBoxesInThisRack = storedBoxes;
        } else if ('responseObject' in storedBoxes && Array.isArray((storedBoxes as any).responseObject)) {
          storedBoxesInThisRack = (storedBoxes as any).responseObject;
        }
      }

      if (storedBoxesInThisRack.length > 0) {
        const usedSpace = storedBoxesInThisRack.reduce((total: number, storedBox: any) => {
          return total + (storedBox.total_volume || 0);
        }, 0);

        remainingSpaceInCurrentRack -= usedSpace;
      }

      // Find available racks in the same zone
      const availableRacks = racks.filter(r => r.master_zone_id === currentRack.master_zone_id && r.master_rack_id !== selectedRack);

      // Sort boxes by volume (largest first)
      const sortedBoxes = [...boxesToStore].sort((a, b) => {
        const volumeA = a.box.cubic_centimeter_box * a.box.count;
        const volumeB = b.box.cubic_centimeter_box * b.box.count;
        return volumeB - volumeA; // Largest first
      });

      // Simulate distribution
      const distribution: any = {
        [currentRack.master_rack_id]: {
          rackName: currentRack.master_rack_name,
          rackId: currentRack.master_rack_id,
          remainingSpace: remainingSpaceInCurrentRack,
          totalSpace: currentRack.cubic_centimeter_rack,
          boxes: []
        }
      };

      // Add other racks to distribution
      availableRacks.forEach(rack => {
        distribution[rack.master_rack_id] = {
          rackName: rack.master_rack_name,
          rackId: rack.master_rack_id,
          remainingSpace: rack.cubic_centimeter_rack,
          totalSpace: rack.cubic_centimeter_rack,
          boxes: []
        };
      });

      // Distribute boxes
      for (const boxResult of sortedBoxes) {
        const box = boxResult.box;
        const boxVolume = box.cubic_centimeter_box * box.count;
        let assigned = false;

        // Try current rack first
        if (boxVolume <= distribution[currentRack.master_rack_id].remainingSpace) {
          // Store in this rack
          distribution[currentRack.master_rack_id].boxes.push({
            ...box,
            volume: boxVolume
          });
          distribution[currentRack.master_rack_id].remainingSpace -= boxVolume;
          assigned = true;
        }
        // Then try other racks
        else {
          for (const rack of availableRacks) {
            if (boxVolume <= distribution[rack.master_rack_id].remainingSpace) {
              distribution[rack.master_rack_id].boxes.push({
                ...box,
                volume: boxVolume
              });
              distribution[rack.master_rack_id].remainingSpace -= boxVolume;
              assigned = true;
              break;
            }
          }
        }

        // If not assigned to any rack
        if (!assigned) {
          if (!distribution.unassigned) {
            distribution.unassigned = {
              rackName: "ไม่สามารถจัดเก็บได้",
              boxes: []
            };
          }
          distribution.unassigned.boxes.push({
            ...box,
            volume: boxVolume
          });
        }
      }

      // Convert to array for easier rendering
      const distributionArray = Object.values(distribution);

      // Set preview
      setAutoAssignPreview({
        message: "การจัดเก็บกล่องโดยอัตโนมัติ",
        shelves: distributionArray
      });

    } catch (error) {
      console.error("Error generating auto-assign preview:", error);
      setAutoAssignPreview({ message: "เกิดข้อผิดพลาดในการแสดงตัวอย่างการจัดเก็บ", shelves: [] });
    }
  };

  // Update preview when auto-assign option changes
  useEffect(() => {
    if (autoAssignToOtherRacks) {
      previewAutoAssignDistribution();
    } else {
      setAutoAssignPreview(null);
    }
  }, [autoAssignToOtherRacks, selectedRack, boxFitResults]);

  // โหลด records เมื่อเปิดตาราง
  useEffect(() => {
    if (showWarehouseTable) {
      getCalWarehouse().then((res) => {
        if (res.success) {
          if (Array.isArray(res.responseObject)) {
            setWarehouseRecords(res.responseObject);
          } else if (res.responseObject && typeof res.responseObject === 'object') {
            setWarehouseRecords([res.responseObject]);
          } else {
            setWarehouseRecords([]);
          }
        } else {
          setWarehouseRecords([]);
        }
      });
    }
  }, [showWarehouseTable]);

  // log ค่า documentWarehouseNo
  useEffect(() => {
    if (documentWarehouseNo) {
      // console.log("Selected documentWarehouseNo:", documentWarehouseNo);
    }
  }, [documentWarehouseNo]);

  // Add new function to calculate box placement
  const calculateBoxPlacement = (
    boxes: BoxType[],
    zones: ZoneType[],
    racks: RackType[],
    shelves: ShelfType[],
    storedBoxes: StoredBoxType[]
  ) => {
    // เตรียมข้อมูล used volume ของแต่ละ shelf จาก shelf_box_storage
    const usedShelfVolume: Record<string, number> = {};
    storedBoxes.forEach(sb => {
      if (!usedShelfVolume[sb.master_shelf_id]) usedShelfVolume[sb.master_shelf_id] = 0;
      usedShelfVolume[sb.master_shelf_id] += (sb.cubic_centimeter_box || 0) * (sb.count || 1);
    });

    const placements: any[] = [];
    const logDetails: any[] = [];

    for (const box of boxes) {
      let placed = false;
      for (const zone of zones) {
        const racksInZone = racks.filter(r => r.master_zone_id === zone.master_zone_id);
        for (const rack of racksInZone) {
          const shelvesInRack = shelves.filter(s => s.master_rack_id === rack.master_rack_id);
          for (const shelf of shelvesInRack) {
            const used = usedShelfVolume[shelf.master_shelf_id] || 0;
            const boxVolume = box.cubic_centimeter_box * box.count;
            // เช็คว่ามีของอยู่แล้วหรือไม่ และมีที่เหลือพอไหม
            if (used === 0 && boxVolume <= shelf.cubic_centimeter_shelf) {
              // shelf ว่าง วางกล่องใหม่ได้
              placements.push({
                box,
                suggestedZone: zone,
                suggestedRack: rack,
                suggestedShelf: shelf,
                canFit: true,
              });
              usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
              logDetails.push(`Box ${box.master_box_name} placed in Zone: ${zone.master_zone_name}, Rack: ${rack.master_rack_name}, Shelf: ${shelf.master_shelf_name}`);
              placed = true;
              break;
            } else if (used > 0 && used + boxVolume <= shelf.cubic_centimeter_shelf) {
              // shelf มีของอยู่แล้ว แต่ยังมีที่เหลือพอ
              placements.push({
                box,
                suggestedZone: zone,
                suggestedRack: rack,
                suggestedShelf: shelf,
                canFit: true,
              });
              usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
              logDetails.push(`Box ${box.master_box_name} placed in Zone: ${zone.master_zone_name}, Rack: ${rack.master_rack_name}, Shelf: ${shelf.master_shelf_name} (added to existing)`);
              placed = true;
              break;
            } else {
              logDetails.push(`Box ${box.master_box_name} cannot fit in Shelf: ${shelf.master_shelf_name} (used: ${used}, box: ${boxVolume}, shelf: ${shelf.cubic_centimeter_shelf})`);
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
      if (!placed) {
        placements.push({ box, canFit: false });
        logDetails.push(`Box ${box.master_box_name} could not be placed in any shelf/zone.`);
      }
    }

    // log รายละเอียดทั้งหมด
    // console.log('Box Placement Details:', logDetails);

    return placements;
  };

  // Update the Calculate Dialog to show box placement suggestions
  const handleCalculate = async () => {
    // console.log('=== Opening Calculation Dialog ===');
    // console.log('Selected Zone:', selectedZone);
    // console.log('Available Racks:', racks);
    // console.log('Available Shelves:', shelves);
    setShowCalculateDialog(true);
  };

  // หลังจากโหลด racks แล้ว ให้โหลด shelves ของ racks เหล่านั้น
  useEffect(() => {
    const fetchAllShelves = async () => {
      if (!selectedZone || racks.length === 0) {
        setShelves([]);
        return;
      }
      let allShelves: ShelfType[] = [];
      for (const rack of racks) {
        const response = await getMsshelf(rack.master_rack_id);
        if (response.success) {
          allShelves = allShelves.concat(response.responseObject || []);
        }
      }
      setShelves(allShelves);
    };
    fetchAllShelves();
  }, [racks, selectedZone]);

  const selectedZoneName = useMemo(() => {
    if (!selectedZone) return "-";
    const found = zones.find(z => z.master_zone_id === selectedZone);
    return found ? found.master_zone_name : selectedZone;
  }, [selectedZone, zones]);

  // Add new useEffect to fetch and log shelf_box_storage data when warehouseId, selectedZone, and selectedRack are all selected
  useEffect(() => {
    if (warehouseId && selectedZone && selectedRack) {
      shelfBoxStorageService.getStoredBoxesByRackId(selectedRack).then(res => {
        // console.log('shelf_box_storage:', res);
        setSelectedRackStoredBoxes(res.responseObject || []);
      });
    } else {
      setSelectedRackStoredBoxes([]);
    }
  }, [warehouseId, selectedZone, selectedRack]);

  // Add effect to calculate box placements when document is selected
  useEffect(() => {
    const calculatePlacements = async () => {
      if (!selectedDocument) return;

      // ดึงข้อมูลกล่องที่วางอยู่แล้วในทุก shelf ของ zone/rack ที่เลือก
      let allShelfStoredBoxes: StoredBoxType[] = [];
      for (const shelf of shelves) {
        const res = await shelfBoxStorageService.getStoredBoxesByShelfId(shelf.master_shelf_id);
        if (res.success && Array.isArray(res.responseObject)) {
          allShelfStoredBoxes = allShelfStoredBoxes.concat(res.responseObject);
        }
      }
      // คำนวณการวางกล่องใหม่
      const boxPlacements = calculateBoxPlacement(boxes, zones, racks, shelves, allShelfStoredBoxes);
      setCalculateSummary({
        zone: selectedZone,
        document: selectedDocument,
        boxPlacements
      });
    };

    calculatePlacements();
  }, [selectedDocument, shelves, boxes, zones, racks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-8">
              <div className="text-red-500 text-xl mb-4">Error</div>
              <p className="text-gray-700">{error}</p>
              <Button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-8">
              <div className="text-yellow-500 text-xl mb-4">Warehouse Not Found</div>
              <p className="text-gray-700">The requested warehouse could not be found.</p>
              <Button
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* {JSON.stringify(selectedDocument)} */}
      {currentPage === 'records' ? (
        <div>
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Show selected warehouse name if available */}
            {warehouseName && (
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-1">
                  Selected Warehouse
                </label>
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 text-base font-mono border border-gray-200">
                  {warehouseName}
                </div>
              </div>
            )}
            {/* Selected Document Warehouse No */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-1">
                Selected Document Warehouse No
              </label>
              <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 text-base font-mono border border-gray-200">
                {documentWarehouseNo || <span className="text-gray-400">No document selected</span>}
              </div>
            </div>

            {/* Zone Selector Only */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Select Zone
              </label>
              <Select.Root
                value={selectedZone}
                onValueChange={setSelectedZone}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Zones</Select.Label>
                    {zones.map((zone) => (
                      <Select.Item key={zone.master_zone_id} value={zone.master_zone_id}>
                        {zone.master_zone_name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </div>

            {/* Calculate Button */}
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCalculate}
              disabled={!selectedZone}
            >
              Calculate
            </Button>

            {/* Show shelf_box_storage data if available */}
            {selectedRackStoredBoxes.length > 0 && (
              <div className="mt-6">
                <div className="font-semibold mb-2">Boxes in this Rack:</div>
                <ul className="list-disc ml-6 text-sm">
                  {selectedRackStoredBoxes.map((box, idx) => (
                    <li key={box.cal_box_id || idx}>
                      Box ID: {box.cal_box_id} {box.master_box_name ? `| Name: ${box.master_box_name}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        // แสดงหน้า Warehouse Calculation
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Warehouse Calculation</h1>
            <Button
              variant="soft"
              color="gray"
              onClick={() => setCurrentPage('records')}
            >
              Back to Records
            </Button>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog.Root open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <Dialog.Content>
          <Dialog.Title className="text-green-600 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Success
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-700">
            Box placements have been saved successfully.
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              OK
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Calculate Dialog */}
      <Dialog.Root open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <Dialog.Content className="max-w-4xl flex flex-col" style={{ maxHeight: '80vh', minHeight: '60vh' }}>
          <div className="flex-1 overflow-y-auto pr-2">
            <Dialog.Title>Calculation Summary</Dialog.Title>
            <div className="space-y-4 mt-4">
              {/* Zone and Document Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <strong>Warehouse:</strong> {warehouseName || "-"}
                  <span className="ml-4"><strong>Zone:</strong> {selectedZoneName}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Document Product No
                  </label>
                  <Select.Root
                    value={selectedDocument}
                    onValueChange={(value) => {
                      const doc = documents.find(d => d.document_product_id === value);
                      console.log('Document selected:', doc);
                      setSelectedDocument(value);
                    }}
                  >
                    <Select.Trigger className="w-full" />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label>Documents</Select.Label>
                        {documents.map((doc) => (
                          <Select.Item key={doc.document_product_id} value={doc.document_product_id}>
                            {doc.document_product_no}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Racks and Shelves Structure */}
              <div className="space-y-8">
                {racks.map((rack) => {
                  const rackShelves = shelves.filter(shelf => shelf.master_rack_id === rack.master_rack_id);
                  // console.log(`Rack ${rack.master_rack_name} has ${rackShelves.length} shelves`);

                  return (
                    <div key={rack.master_rack_id} className="bg-white rounded-xl shadow p-6 border border-blue-200">
                      <div className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">RACK: {rack.master_rack_name}</div>
                      {rackShelves.length === 0 ? (
                        <div className="ml-4 text-gray-400">No shelves in this rack</div>
                      ) : (
                        rackShelves.map(shelf => {
                          // console.log(`Shelf ${shelf.master_shelf_name} in rack ${rack.master_rack_name}`);
                          return (
                            <div key={shelf.master_shelf_id} className="mb-4">
                              {/* {JSON.stringify(storedBoxes)} */}
                              <div className="text-lg font-semibold text-green-700 mb-2 pl-2 border-l-4 border-green-400 bg-green-50 rounded">
                                Shelf: {shelf.master_shelf_name}
                                <span className="ml-2 text-xs text-gray-500">
                                  (0 boxes)
                                </span>
                              </div>
                              <div className="ml-8 text-xs text-gray-400">No boxes in this shelf</div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 left-0 bg-white pt-4 pb-2 flex justify-end border-t z-10">
            <Button onClick={() => setShowCalculateDialog(false)} className="w-28 mr-2 bg-red-500 hover:bg-red-600" disabled={loading}>
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!calculateSummary?.boxPlacements) return;

                // console.log('=== Starting Box Placement Save Process ===');
                // console.log('Total placements to save:', calculateSummary.boxPlacements.length);

                // Prepare payload for boxes that can be placed
                const payload = calculateSummary.boxPlacements
                  .filter((p) => p.canFit && p.suggestedShelf && p.box)
                  .map((p) => ({
                    master_shelf_id: p.suggestedShelf.master_shelf_id,
                    cal_box_id: p.box.cal_box_id,
                    cubic_centimeter_box: p.box.cubic_centimeter_box,
                    count: p.box.count,
                    document_product_no: p.box.document_product_no,
                    stored_by: 'system',
                  }));

                // console.log('Prepared payload:', payload);
                // console.log('Number of boxes to save:', payload.length);

                // Log number of boxes per shelf
                const shelfBoxCount: Record<string, number> = {};
                calculateSummary.boxPlacements.forEach((p) => {
                  if (p.canFit && p.suggestedShelf) {
                    const shelfName = p.suggestedShelf.master_shelf_name;
                    shelfBoxCount[shelfName] = (shelfBoxCount[shelfName] || 0) + 1;
                  }
                });

                // console.log('=== Box Distribution Summary ===');
                Object.entries(shelfBoxCount).forEach(([shelf, count]) => {
                  // console.log(`📦 Shelf "${shelf}": ${count} boxes`);
                });

                // Save to DB
                try {
                  setLoading(true);
                  // console.log('Sending request to save box placements...');
                  const res = await shelfBoxStorageService.storeMultipleBoxesInShelf(payload);
                  setLoading(false);

                  if (res.success) {
                    // console.log('✅ Box placements saved successfully');
                    setShowCalculateDialog(false);
                    setShowSuccessDialog(true);
                  } else {
                    console.error('❌ Failed to save box placements:', res.message);
                    setErrorMessage(res.message || 'Failed to save box placements');
                    setShowErrorDialog(true);
                  }
                } catch (err) {
                  // console.error('❌ Error saving box placements:', err);
                  setLoading(false);
                  setErrorMessage('An unexpected error occurred while saving box placements');
                  setShowErrorDialog(true);
                }
              }}
              className="w-28 bg-green-500 hover:bg-green-600"
              disabled={loading || !selectedDocument}
            >
              Save
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      {/* Add Error Dialog */}
      <Dialog.Root open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <Dialog.Content>
          <Dialog.Title className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Error
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-700">
            {errorMessage}
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Close
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default WarehouseCalculation;
