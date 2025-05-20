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
import { getCalWarehouse, deleteCalWarehouse } from "@/services/calwarehouse.service";
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

interface ShelfStoredBoxType {
  storage_id: string;
  master_shelf_id: string;
  cal_box_id: string;
  stored_date: string;
  stored_by?: string | null;
  position?: number | null;
  status: string;
  // Volume information
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
  // Shelf relationship fields
  shelf?: {
    master_shelf_id: string;
    master_shelf_name: string;
    shelf_level: number;
    cubic_centimeter_shelf: number;
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
  const [selectedShelf, setSelectedShelf] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const [boxFitResults, setBoxFitResults] = useState<BoxFitResult[]>([]);
  const [rackSpaceSummary, setRackSpaceSummary] = useState<RackSpaceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedBoxes, setStoredBoxes] = useState<StoredBoxType[]>([]);
  const [shelfStoredBoxes, setShelfStoredBoxes] = useState<ShelfStoredBoxType[]>([]);
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

  // Add new state for boxes in document
  const [boxesInDocument, setBoxesInDocument] = useState([]);

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
    fetchBoxesForDocument(selectedDocument);
  }, [selectedDocument]);

  // Fetch boxes stored in the selected rack
  useEffect(() => {
    const fetchStoredBoxes = async () => {
      if (!selectedRack) {
        setStoredBoxes([]);
        return;
      }

      try {
        console.log("Fetching stored boxes for rack:", selectedRack);
        const response = await shelfBoxStorageService.getStoredBoxesByRackId(selectedRack);

        if (response.success) {
          console.log("Stored boxes response:", response);
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

  // Fetch boxes stored in the selected shelf
  const fetchShelfStoredBoxes = async () => {
    if (!selectedShelf) {
      setShelfStoredBoxes([]);
      return;
    }

    try {
      console.log("Fetching stored boxes for shelf:", selectedShelf);
      const response = await shelfBoxStorageService.getStoredBoxesByShelfId(selectedShelf);

      if (response.success) {
        console.log("Stored boxes in shelf response:", response);
        setShelfStoredBoxes(response.responseObject || []);
      } else {
        console.error("Failed to fetch stored boxes for shelf:", response.message);
        setShelfStoredBoxes([]);
      }
    } catch (err) {
      console.error("Error fetching stored boxes for shelf:", err);
      setShelfStoredBoxes([]);
    }
  };

  useEffect(() => {
    fetchShelfStoredBoxes();
  }, [selectedShelf]);


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
    if (!boxes.length || !selectedShelf) {
      setBoxFitResults([]);
      setRackSpaceSummary(null);
      return;
    }

    // Find the selected shelf
    const shelf = shelves.find(s => s.master_shelf_id === selectedShelf);
    if (!shelf) {
      setBoxFitResults([]);
      setRackSpaceSummary(null);
      return;
    }

    console.log("Calculating box fit for shelf:", shelf);
    console.log("Boxes to fit:", boxes);
    console.log("Stored boxes:", shelfStoredBoxes);

    // Get stored box IDs for checking - make sure we're working with an array
    let storedBoxesInThisShelf: any[] = [];
    if (shelfStoredBoxes && typeof shelfStoredBoxes === 'object') {
      if (Array.isArray(shelfStoredBoxes)) {
        storedBoxesInThisShelf = shelfStoredBoxes;
      } else if ('responseObject' in shelfStoredBoxes && Array.isArray((shelfStoredBoxes as any).responseObject)) {
        storedBoxesInThisShelf = (shelfStoredBoxes as any).responseObject;
      }
    }

    const storedBoxIds = storedBoxesInThisShelf.map((sb: any) => sb.cal_box_id);
    console.log("Stored box IDs in this shelf:", storedBoxIds);

    // Also check all stored boxes across all shelves - make sure we're working with an array
    let allStoredBoxesArray: any[] = [];
    if (allStoredBoxes && typeof allStoredBoxes === 'object') {
      if (Array.isArray(allStoredBoxes)) {
        allStoredBoxesArray = allStoredBoxes;
      } else if ('responseObject' in allStoredBoxes && Array.isArray((allStoredBoxes as any).responseObject)) {
        allStoredBoxesArray = (allStoredBoxes as any).responseObject;
      }
    }

    const allStoredBoxIds = allStoredBoxesArray.map((sb: any) => sb.cal_box_id);
    console.log("All stored box IDs:", allStoredBoxIds);

    // Calculate which boxes fit in the shelf
    let totalUsedVolume = 0;

    // First add the volume of already stored boxes in this shelf
    if (storedBoxesInThisShelf.length > 0) {
      console.log("Adding volume of stored boxes to used space calculation");
      totalUsedVolume = storedBoxesInThisShelf.reduce((total: number, storedBox: any) => {
        // First try to use the total_volume field directly from the stored box
        if (storedBox.total_volume) {
          total += storedBox.total_volume;
          console.log(`Added stored box total_volume: ${storedBox.total_volume} for box ${storedBox.cal_box_id}`);
        } else if (storedBox.cubic_centimeter_box && storedBox.count) {
          // If total_volume is not available, calculate it from cubic_centimeter_box and count
          total += storedBox.cubic_centimeter_box * storedBox.count;
          console.log(`Added stored box calculated volume: ${storedBox.cubic_centimeter_box * storedBox.count} for box ${storedBox.cal_box_id}`);
        }
        return total;
      }, 0);
    }

    console.log(`Initial used volume from stored boxes: ${totalUsedVolume}`);

    let fittingBoxesCount = 0;

    const results = boxes.map((box: BoxType) => {
      const boxVolume = box.cubic_centimeter_box * box.count;

      // Check if this box is stored in this shelf or any other shelf
      const isStoredInThisShelf = storedBoxIds.includes(box.cal_box_id);
      const isStoredAnywhere = allStoredBoxIds.includes(box.cal_box_id);

      console.log(`Box ${box.cal_box_id} (${box.master_box_name}): Checking if stored - In this shelf: ${isStoredInThisShelf}, Anywhere: ${isStoredAnywhere}`);

      // If the box is already stored, it doesn't need to fit again
      // If it's not stored, check if it would fit in the remaining space
      const fits = isStoredInThisShelf || boxVolume <= (shelf.cubic_centimeter_shelf - totalUsedVolume);

      console.log(`Box ${box.cal_box_id} (${box.master_box_name}): Volume=${boxVolume}, Fits=${fits}, IsStoredInThisShelf=${isStoredInThisShelf}, IsStoredAnywhere=${isStoredAnywhere}`);

      // If the box fits and is not already stored, add its volume to the used space
      if (fits && !isStoredInThisShelf) {
        totalUsedVolume += boxVolume;
        fittingBoxesCount++;
        console.log(`Added fitting box volume: ${boxVolume}, new total: ${totalUsedVolume}`);
      }

      // If the box is already stored, count it as fitting
      if (isStoredInThisShelf) {
        fittingBoxesCount++;
        console.log(`Box ${box.cal_box_id} is already stored, counted as fitting`);
      }

      const remainingSpace = shelf.cubic_centimeter_shelf - totalUsedVolume;

      return {
        box,
        fits,
        isStored: isStoredInThisShelf,
        isStoredAnywhere: isStoredAnywhere,
        remainingSpace
      };
    });

    setBoxFitResults(results);

    // Calculate shelf space summary
    const totalRackVolume = shelf.cubic_centimeter_shelf;

    // Calculate total used volume from already stored boxes only
    let usedVolumeFromStoredBoxes = 0;
    if (storedBoxesInThisShelf.length > 0) {
      usedVolumeFromStoredBoxes = storedBoxesInThisShelf.reduce((total: number, storedBox: any) => {
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

    const shelfSummary: RackSpaceSummary = {
      totalRackVolume,
      usedVolume,
      remainingVolume,
      usagePercentage,
      fittingBoxes: fittingBoxesCount,
      totalBoxes: boxes.length
    };

    console.log("Shelf space summary:", shelfSummary);
    setRackSpaceSummary(shelfSummary);

  }, [boxes, selectedShelf, shelves, shelfStoredBoxes, allStoredBoxes]);



  // Function to find available shelves in the same rack
  const findAvailableShelvesInRack = async () => {
    if (!selectedRack) return [];

    try {
      // Get all shelves in the current rack
      const shelvesInRack = shelves.filter(shelf =>
        shelf.master_rack_id === selectedRack &&
        shelf.master_shelf_id !== selectedShelf // Exclude current shelf
      );

      console.log("Available shelves in rack:", shelvesInRack);

      // Get stored boxes for each shelf to calculate remaining space
      const shelvesWithSpace = await Promise.all(
        shelvesInRack.map(async (shelf) => {
          try {
            const response = await shelfBoxStorageService.getStoredBoxesByShelfId(shelf.master_shelf_id);
            let storedBoxes: any[] = [];

            if (response.success) {
              if (Array.isArray(response.responseObject)) {
                storedBoxes = response.responseObject;
              } else if (response.responseObject && Array.isArray(response.responseObject.responseObject)) {
                storedBoxes = response.responseObject.responseObject;
              }
            }

            // Calculate used volume
            let usedVolume = 0;
            if (storedBoxes.length > 0) {
              usedVolume = storedBoxes.reduce((total: number, box: any) => {
                return total + (box.total_volume || 0);
              }, 0);
            }

            const remainingVolume = shelf.cubic_centimeter_shelf - usedVolume;

            return {
              ...shelf,
              remainingVolume,
              usedVolume
            };
          } catch (error) {
            console.error(`Error getting stored boxes for shelf ${shelf.master_shelf_id}:`, error);
            return {
              ...shelf,
              remainingVolume: 0,
              usedVolume: shelf.cubic_centimeter_shelf
            };
          }
        })
      );

      // Sort shelves by remaining space (most space first)
      return shelvesWithSpace
        .filter(shelf => shelf.remainingVolume > 0)
        .sort((a, b) => b.remainingVolume - a.remainingVolume);

    } catch (error) {
      console.error("Error finding available shelves:", error);
      return [];
    }
  };

  // Fetch boxes for selected document
  const fetchBoxesForDocument = async (documentId: string) => {
    if (!documentId) return;

    try {
      const cleanDocNo = documentId.replace(/[()]/g, "");
      const response = await getCalBox(cleanDocNo);
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
    if (!selectedShelf || !autoAssignToOtherShelves) {
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

      // Get current shelf
      const currentShelf = shelves.find(s => s.master_shelf_id === selectedShelf);
      if (!currentShelf) {
        setAutoAssignPreview({ message: "ไม่พบข้อมูลชั้นวางที่เลือก", shelves: [] });
        return;
      }

      // Calculate remaining space in current shelf
      let remainingSpaceInCurrentShelf = currentShelf.cubic_centimeter_shelf;

      // Subtract space used by already stored boxes
      let storedBoxesInThisShelf: any[] = [];
      if (shelfStoredBoxes && typeof shelfStoredBoxes === 'object') {
        if (Array.isArray(shelfStoredBoxes)) {
          storedBoxesInThisShelf = shelfStoredBoxes;
        } else if ('responseObject' in shelfStoredBoxes && Array.isArray((shelfStoredBoxes as any).responseObject)) {
          storedBoxesInThisShelf = (shelfStoredBoxes as any).responseObject;
        }
      }

      if (storedBoxesInThisShelf.length > 0) {
        const usedSpace = storedBoxesInThisShelf.reduce((total: number, storedBox: any) => {
          return total + (storedBox.total_volume || 0);
        }, 0);

        remainingSpaceInCurrentShelf -= usedSpace;
      }

      // Find available shelves in the same rack
      const availableShelves = await findAvailableShelvesInRack();

      // Sort boxes by volume (largest first)
      const sortedBoxes = [...boxesToStore].sort((a, b) => {
        const volumeA = a.box.cubic_centimeter_box * a.box.count;
        const volumeB = b.box.cubic_centimeter_box * b.box.count;
        return volumeB - volumeA; // Largest first
      });

      // Simulate distribution
      const distribution: any = {
        [currentShelf.master_shelf_id]: {
          shelfName: currentShelf.master_shelf_name,
          shelfId: currentShelf.master_shelf_id,
          remainingSpace: remainingSpaceInCurrentShelf,
          totalSpace: currentShelf.cubic_centimeter_shelf,
          boxes: []
        }
      };

      // Add other shelves to distribution
      availableShelves.forEach(shelf => {
        distribution[shelf.master_shelf_id] = {
          shelfName: shelf.master_shelf_name,
          shelfId: shelf.master_shelf_id,
          remainingSpace: shelf.remainingVolume,
          totalSpace: shelf.cubic_centimeter_shelf,
          boxes: []
        };
      });

      // Distribute boxes
      for (const boxResult of sortedBoxes) {
        const box = boxResult.box;
        const boxVolume = box.cubic_centimeter_box * box.count;
        let assigned = false;

        // Try current shelf first
        if (boxVolume <= distribution[currentShelf.master_shelf_id].remainingSpace) {
          // Store in this shelf
          distribution[currentShelf.master_shelf_id].boxes.push({
            ...box,
            volume: boxVolume
          });
          distribution[currentShelf.master_shelf_id].remainingSpace -= boxVolume;
          assigned = true;
        }
        // Then try other shelves
        else {
          for (const shelf of availableShelves) {
            if (boxVolume <= distribution[shelf.master_shelf_id].remainingSpace) {
              distribution[shelf.master_shelf_id].boxes.push({
                ...box,
                volume: boxVolume
              });
              distribution[shelf.master_shelf_id].remainingSpace -= boxVolume;
              assigned = true;
              break;
            }
          }
        }

        // If not assigned to any shelf
        if (!assigned) {
          if (!distribution.unassigned) {
            distribution.unassigned = {
              shelfName: "ไม่สามารถจัดเก็บได้",
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
    if (autoAssignToOtherShelves) {
      previewAutoAssignDistribution();
    } else {
      setAutoAssignPreview(null);
    }
  }, [autoAssignToOtherShelves, selectedShelf, boxFitResults]);


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
      console.log("Selected documentWarehouseNo:", documentWarehouseNo);
    }
  }, [documentWarehouseNo]);

  // Add new function to calculate box placement
  const calculateBoxPlacement = (boxes, racks, shelves) => {
    const placements = [];
    let rackIndex = 0;
    let shelfIndex = 0;
    let usedShelfVolume: { [shelfId: string]: number } = {};

    // เตรียม shelves เรียงตาม rack, level
    const sortedRacks = [...racks];
    const sortedShelves = shelves
      .slice()
      .sort((a, b) => a.shelf_level - b.shelf_level);

    for (const box of boxes) {
      let placed = false;

      // ลองวางใน rack/shelf ทีละอัน
      while (rackIndex < sortedRacks.length && !placed) {
        const rack = sortedRacks[rackIndex];
        const shelvesInRack = sortedShelves.filter(s => s.master_rack_id === rack.master_rack_id);

        while (shelfIndex < shelvesInRack.length && !placed) {
          const shelf = shelvesInRack[shelfIndex];
          const used = usedShelfVolume[shelf.master_shelf_id] || 0;
          const boxVolume = box.cubic_centimeter_box * box.count;

          if (used + boxVolume <= shelf.cubic_centimeter_shelf) {
            // วางกล่องนี้ใน shelf นี้
            placements.push({
              box,
              suggestedShelf: shelf,
              suggestedRack: rack,
              canFit: true,
            });
            usedShelfVolume[shelf.master_shelf_id] = used + boxVolume;
            placed = true;
          } else {
            shelfIndex++;
          }
        }

        if (!placed) {
          rackIndex++;
          shelfIndex = 0;
        }
      }

      if (!placed) {
        // วางไม่ได้
        placements.push({
          box,
          canFit: false,
        });
      }
    }

    return placements;
  };

  // Update the Calculate Dialog to show box placement suggestions
  const handleCalculate = () => {
    const boxPlacements = calculateBoxPlacement(boxes, racks, shelves);
    setCalculateSummary({
      zone: selectedZone,
      document: selectedDocument,
      boxPlacements
    });
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
    if (!calculateSummary?.zone) return "-";
    const found = zones.find(z => z.master_zone_id === calculateSummary.zone);
    return found ? found.master_zone_name : calculateSummary.zone;
  }, [calculateSummary?.zone, zones]);

  // เพิ่ม useEffect สำหรับ log เฉพาะตอนเลือก zone ใหม่
  useEffect(() => {
    if (!calculateSummary?.boxPlacements || !shelves.length) return;
    // log เฉพาะ shelves ที่มี box จริง
    const shelfBoxCount: Record<string, number> = {};
    for (const placement of calculateSummary.boxPlacements) {
      if (placement.canFit && placement.suggestedShelf) {
        const shelfName = placement.suggestedShelf.master_shelf_name;
        shelfBoxCount[shelfName] = (shelfBoxCount[shelfName] || 0) + 1;
      }
    }
    Object.entries(shelfBoxCount).forEach(([shelf, count]) => {
      console.log(`Shelf: ${shelf} has ${count} boxes`);
    });
  }, [selectedZone, calculateSummary?.boxPlacements, shelves.length]);

  useEffect(() => {
    if (!selectedDocument) return;
    const cleanDocNo = selectedDocument.replace(/[()]/g, "");
    fetch(`/v1/shelf_box_storage/document/${cleanDocNo}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.responseObject)) {
          setBoxesInDocument(data.responseObject);
          console.log("Boxes in Document:", data.responseObject);
        } else {
          setBoxesInDocument([]);
          console.log("No boxes found in document:", selectedDocument);
        }
      })
      .catch(err => {
        setBoxesInDocument([]);
        console.error("Error fetching boxes in document:", err);
      });
  }, [selectedDocument]);


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
      {currentPage === 'records' ? (
        <div>
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
            {/* Show selected warehouse name if available */}
            {warehouseName && (
              <div className="mb-6">
                <label className="block text-xl font-bold text-gray-800 mb-2">
                  Selected Warehouse
                </label>
                <div className="bg-gray-50 text-blue-900 rounded-xl px-5 py-3 text-lg font-mono border border-blue-200 shadow-sm">
                  {warehouseName}
                </div>
              </div>
            )}
            {/* Divider */}
            <hr className="my-4 border-gray-200" />
            {/* Selected Document Warehouse No */}
            <div className="mb-6">
              <label className="block text-xl font-bold text-gray-800 mb-2">
                Selected Document Warehouse No
              </label>
              <div className="bg-gray-50 text-blue-900 rounded-xl px-5 py-3 text-lg font-mono border border-blue-200 shadow-sm">
                {documentWarehouseNo || <span className="text-gray-400">No document selected</span>}
              </div>
            </div>

            {/* Zone & Document Selector Component */}
            <ZoneDocumentSelector
              zones={zones}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              documents={documents}
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              onCalculate={handleCalculate}
            />
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
                  <strong>Document Box No:</strong> {calculateSummary?.document}
                </div>
              </div>


              {/* Racks Section */}
              <div className="space-y-8">
                {racks.map((rack) => {
                  const rackShelves = shelves.filter(shelf => shelf.master_rack_id === rack.master_rack_id);

                  return (
                    <div key={rack.master_rack_id} className="bg-white rounded-xl shadow p-6 border border-blue-200">
                      <div className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">RACK: {rack.master_rack_name}</div>
                      {rackShelves.length === 0 ? (
                        <div className="ml-4 text-gray-400">No shelves in this rack</div>
                      ) : (
                        rackShelves.map(shelf => {
                          const placementsInShelf = (calculateSummary?.boxPlacements || [])
                            .filter(p => p.canFit && p.suggestedShelf?.master_shelf_id === shelf.master_shelf_id);

                          // Sort by count (descending)
                          const sortedPlacements = [...placementsInShelf]
                            .sort((a, b) => (a.box.box_no ?? 0) - (b.box.box_no ?? 0));

                          if (sortedPlacements.length > 0) {
                            console.log(`Shelf: ${shelf.master_shelf_name} has ${sortedPlacements.length} boxes`);
                          }

                          return (
                            <div key={shelf.master_shelf_id} className="mb-4">
                              <div className="text-lg font-semibold text-green-700 mb-2 pl-2 border-l-4 border-green-400 bg-green-50 rounded">
                                Shelf: {shelf.master_shelf_name}
                                <span className="ml-2 text-xs text-gray-500">({sortedPlacements.length} boxes)</span>
                              </div>
                              {sortedPlacements.length === 0 ? (
                                <div className="ml-8 text-xs text-gray-400">No boxes in this shelf</div>
                              ) : (
                                <ul className="ml-8 space-y-1">
                                  {sortedPlacements.map((p, idx) => (
                                    <li key={p.box.cal_box_id + idx} className="flex items-center gap-2 text-base text-blue-900">
                                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                                      <span className="font-medium">Box No: {p.box.box_no}</span>
                                      <span className="font-medium">{p.box.master_box_name}</span>
                                      <span className="text-gray-500">| ปริมาตร: {p.box.cubic_centimeter_box}</span>
                                      <span className="text-gray-500">| จำนวน: {p.box.count}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}

                {/* กล่องที่วางไม่ได้ */}
                {(calculateSummary?.boxPlacements || []).some(p => !p.canFit) && (
                  <div className="border rounded-lg p-4 mb-4 bg-red-50 shadow">
                    <div className="font-semibold text-red-600 mb-2">❌ Boxes that cannot be placed</div>
                    <ul className="ml-4 list-disc text-sm text-red-700 space-y-1">
                      {(calculateSummary?.boxPlacements || [])
                        .filter(p => !p.canFit)
                        .map((p, idx) => (
                          <li key={p.box.cal_box_id + idx}>
                            {p.box.master_box_name} | ปริมาตร: {p.box.cubic_centimeter_box} | จำนวน: {p.box.count}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
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

                console.log('=== Starting Box Placement Save Process ===');
                console.log('Total placements to save:', calculateSummary.boxPlacements.length);

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

                console.log('Prepared payload:', payload);
                console.log('Number of boxes to save:', payload.length);

                // Log number of boxes per shelf
                const shelfBoxCount: Record<string, number> = {};
                calculateSummary.boxPlacements.forEach((p) => {
                  if (p.canFit && p.suggestedShelf) {
                    const shelfName = p.suggestedShelf.master_shelf_name;
                    shelfBoxCount[shelfName] = (shelfBoxCount[shelfName] || 0) + 1;
                  }
                });

                console.log('=== Box Distribution Summary ===');
                Object.entries(shelfBoxCount).forEach(([shelf, count]) => {
                  console.log(`📦 Shelf "${shelf}": ${count} boxes`);
                });

                // Save to DB
                try {
                  setLoading(true);
                  console.log('Sending request to save box placements...');
                  const res = await shelfBoxStorageService.storeMultipleBoxesInShelf(payload);
                  setLoading(false);

                  if (res.success) {
                    console.log('✅ Box placements saved successfully');
                    setShowCalculateDialog(false);
                    setShowSuccessDialog(true);
                  } else {
                    console.error('❌ Failed to save box placements:', res.message);
                    setErrorMessage(res.message || 'Failed to save box placements');
                    setShowErrorDialog(true);
                  }
                } catch (err) {
                  console.error('❌ Error saving box placements:', err);
                  setLoading(false);
                  setErrorMessage('An unexpected error occurred while saving box placements');
                  setShowErrorDialog(true);
                }
              }}
              className="w-28 bg-green-500 hover:bg-green-600"
              disabled={loading}
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
