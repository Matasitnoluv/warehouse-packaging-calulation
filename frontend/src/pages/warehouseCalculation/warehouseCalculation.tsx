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
import ZoneDocumentSelector from "./ZoneDocumentSelector";
import { getCalWarehouse } from "@/services/calwarehouse.services";
import { postBoxInShelfOnStorage } from "@/services/box_in_shelf_onstorage.services";

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


interface ApiResponse<T> {
  success: boolean;
  message?: string;
  responseObject: T;
}

// Add new interface for box placement
interface BoxPlacement {
  box: BoxType;
  suggestedShelf?: ShelfType;
  suggestedRack?: RackType;
  volume: number;
  canFit: boolean;
}

type FitBox = {
  document_product_no: string;
  box_no: string | number;
  cubic_centimeter_box: number;
  cal_box_id: string;
  count: number;
};

type ShelfWithFitBoxes = {
  shelf_id: string;
  shelf_name: string;
  master_rack_id: string;
  fitBoxes: FitBox[];
};


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
  const [allStoredBoxes, setAllStoredBoxes] = useState<RackBoxStorage[]>([]);

  const [shelfFitData, setShelfFitData] = useState<ShelfWithFitBoxes[]>([]); 4

  const tempShelfData: ShelfWithFitBoxes[] = [];
  const [warehouseRecords, setWarehouseRecords] = useState<Array<{
    document_warehouse_id: string;
    document_warehouse_no: string;
    status: boolean;
    sort_by: number;
  }>>([]);
  const [showWarehouseTable, setShowWarehouseTable] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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
  const [calculateSummary, setCalculateSummary] = useState<{ zone: string; document: string; racks: RackType[]; boxPlacements?: BoxPlacement[]; shelves: ShelfType[] } | null>(null);


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

  const savePayload = async () => {
    try {
      if (!documentWarehouseNo) {
        alert("Please select a warehouse document first!");
        return;
      }

      // Log the current state for debugging
      console.log("Current tempShelfData:", tempShelfData);

      // Transform tempShelfData to match the expected payload format
      const payload = tempShelfData.map(shelf => {
        // Filter out any boxes without cal_box_id
        const validBoxes = shelf.fitBoxes.filter(box => box.cal_box_id && box.cal_box_id !== "");
        if (validBoxes.length === 0) {
          console.log(`Shelf ${shelf.shelf_id} has no valid boxes`);
          return null; // Skip shelves with no valid boxes
        }

        const shelfPayload = {
          master_shelf_id: shelf.shelf_id,
          document_warehouse_no: documentWarehouseNo,
          fitBoxes: validBoxes.map(box => ({
            cal_box_id: box.cal_box_id,
            document_product_no: box.document_product_no,
            cubic_centimeter_box: box.cubic_centimeter_box,
            count: box.count || 1,
            total_volume: box.cubic_centimeter_box * (box.count || 1)
          }))
        };

        console.log(`Shelf ${shelf.shelf_id} payload:`, shelfPayload);
        return shelfPayload;
      }).filter(Boolean); // Remove null entries

      console.log("Final payload:", payload);


      if (payload.length === 0) {
        alert("No valid boxes to save! Please check if boxes have valid cal_box_id.");
        return;
      }

      // Send each shelf's data to the backend
      const results = await Promise.all(
        payload.map(async (shelfData) => {
          if (!shelfData) return null;
          try {
            const response = await postBoxInShelfOnStorage(shelfData);
            return response;
          } catch (error) {
            console.error(`Error saving shelf ${shelfData.master_shelf_id}:`, error);
            return null;
          }
        })
      );

      // Check if all requests were successful
      const allSuccessful = results.every(result => result && result.success);

      if (allSuccessful) {
        // Show success message
        alert("Successfully saved all shelf data!");
        // Close the dialog
        setShowCalculateDialog(false);
      } else {
        // Show error message
        alert("Some shelves failed to save. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error saving shelf data:", error);
      alert("Failed to save shelf data. Please check the console for details.");
    }
  };


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
    let fittingBoxesCount = 0;
    const results = boxes.map((box: BoxType, idx) => {
      const singleBoxVolume = box.cubic_centimeter_box;
      const shelfVolume = shelf.cubic_centimeter_shelf;
      const availableVolume = shelfVolume - totalUsedVolume;

      // จำนวนกล่องสูงสุดที่ใส่ได้ใน shelf นี้ (ไม่เกิน box.count)
      let maxFit = 0;
      if (singleBoxVolume > 0 && availableVolume >= singleBoxVolume) {
        maxFit = Math.min(box.count, Math.floor(availableVolume / singleBoxVolume));
      }

      // ถ้าใส่ได้อย่างน้อย 1 กล่อง
      const fits = maxFit > 0;

      // อัปเดต volume ที่ใช้ไป
      if (fits) {
        totalUsedVolume += maxFit * singleBoxVolume;
        fittingBoxesCount += maxFit;
      }

      // log จำนวนกล่องที่ใส่ได้ใน shelf นี้
      console.log(
        `Shelf: ${shelf.master_shelf_name} (Vol: ${shelf.cubic_centimeter_shelf}) | Box: ${box.master_box_name} | Max fit: ${maxFit} | Used: ${totalUsedVolume}`
      );

      return {
        box,
        fits,
        isStored: false,
        isStoredAnywhere: false,
        remainingSpace: shelf.cubic_centimeter_shelf - totalUsedVolume,
        actualBoxCount: maxFit,
      };
    });
    // log จำนวนกล่องทั้งหมดที่ใส่ได้ใน shelf นี้
    console.log(
      `==> Shelf: ${shelf.master_shelf_name} (Vol: ${shelf.cubic_centimeter_shelf}) | Total boxes fit: ${fittingBoxesCount}`
    );

    setBoxFitResults(results);

    // Calculate shelf space summary
    const totalRackVolume = shelf.cubic_centimeter_shelf;

    // Calculate total used volume from already stored boxes only
    let usedVolumeFromStoredBoxes = 0;
    if (storedBoxesInThisShelf.length > 0) {
      usedVolumeFromStoredBoxes = storedBoxesInThisShelf.reduce((total: number, storedBox: any) => {
        return total + (storedBox.cubic_centimeter_box * storedBox.count);
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
      // Ensure document number has parentheses
      const formattedDocNo = documentId.startsWith("(") ? documentId : `(${documentId})`;
      console.log("Calculating for document:", formattedDocNo);

      // Get all shelves in the zone
      const shelvesResponse = await getMsshelf(selectedZone);
      if (!shelvesResponse.success) {
        throw new Error("Failed to fetch shelves");
      }
      const shelves = shelvesResponse.responseObject || [];

      // Get boxes for the document
      const boxesResponse = await getCalBox(formattedDocNo);
      if (!boxesResponse.success) {
        throw new Error("Failed to fetch boxes");
      }
      const boxes = boxesResponse.responseObject || [];

      if (boxes.length === 0) {
        setError("No boxes found for this document");
        return;
      }

      // Calculate placements
      const placements = calculateBoxPlacement(boxes, racks, shelves);

      setCalculateSummary({
        zone: selectedZone,
        document: formattedDocNo,
        racks: racks.sort((a: RackType, b: RackType) => a.master_rack_name.localeCompare(b.master_rack_name)),
        shelves: shelves,
        boxPlacements: placements
      });
      console.log("Racks:", racks);
      console.log("Shelves:", shelves);
      console.log("Placements:", placements);

    } catch (error) {
      console.error("Error calculating box placement:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate box placements");
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

  // Update the handleCalculate function
  const handleCalculate = async () => {
    if (!selectedZone || !selectedDocument) {
      setError("Please select both zone and document");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. โหลด racks ของ zone ที่เลือก
      const racksResponse = await getMsrack(selectedZone);
      if (!racksResponse.success) throw new Error("Failed to fetch racks");
      const racks = racksResponse.responseObject || [];

      // 2. โหลด shelves ของ rack ทุกตัวใน zone ที่เลือก
      let allShelves: ShelfType[] = [];
      for (const rack of racks) {
        const shelvesResponse = await getMsshelf(rack.master_rack_id);
        if (shelvesResponse.success && Array.isArray(shelvesResponse.responseObject)) {
          allShelves = allShelves.concat(shelvesResponse.responseObject);
        }
      }

      // 3. โหลด boxes (document number ต้องมีวงเล็บ)
      const formattedDocNo = selectedDocument.startsWith("(") ? selectedDocument : `(${selectedDocument})`;
      const boxesResponse = await getCalBox(formattedDocNo);
      if (!boxesResponse.success) throw new Error("Failed to fetch boxes");
      const boxes = boxesResponse.responseObject || [];

      if (boxes.length === 0) {
        setError("No boxes found for this document");
        setShowCalculateDialog(false);
        setLoading(false);
        return;
      }

      // 4. คำนวณ placement
      const placements = calculateBoxPlacement(boxes, racks, allShelves);

      setCalculateSummary({
        zone: selectedZone,
        document: formattedDocNo,
        racks: racks.sort((a: RackType, b: RackType) => a.master_rack_name.localeCompare(b.master_rack_name)),
        shelves: allShelves,
        boxPlacements: placements
      });
      console.log("Racks:", racks);
      console.log("Shelves:", allShelves);
      console.log("Placements:", placements);

      setShowCalculateDialog(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to calculate box placements");
      setShowCalculateDialog(false);
    } finally {
      setLoading(false);
    }
  };

  // Update the calculateBoxPlacement function with proper types
  const calculateBoxPlacement = (
    boxes: BoxType[],
    racks: RackType[],
    shelves: ShelfType[]
  ): BoxPlacement[] => {
    const placements: BoxPlacement[] = [];
    let rackIndex = 0;
    let shelfIndex = 0;
    let usedShelfVolume: { [shelfId: string]: number } = {};

    // Sort shelves by level
    const sortedRacks = [...racks];
    const sortedShelves = shelves
      .slice()
      .sort((a: ShelfType, b: ShelfType) => a.shelf_level - b.shelf_level);

    for (const box of boxes) {
      let placed = false;

      while (rackIndex < sortedRacks.length && !placed) {
        const rack = sortedRacks[rackIndex];
        const shelvesInRack = sortedShelves.filter((s: ShelfType) => s.master_rack_id === rack.master_rack_id);

        while (shelfIndex < shelvesInRack.length && !placed) {
          const shelf = shelvesInRack[shelfIndex];
          const used = usedShelfVolume[shelf.master_shelf_id] || 0;
          const boxVolume = box.cubic_centimeter_box;

          if (used + boxVolume <= shelf.cubic_centimeter_shelf) {
            placements.push({
              box: {
                ...box,
                cal_box_id: box.cal_box_id,
                document_product_no: box.document_product_no,
                cubic_centimeter_box: box.cubic_centimeter_box,
                count: box.count
              },
              suggestedShelf: shelf,
              suggestedRack: rack,
              volume: boxVolume,
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
        placements.push({
          box: {
            ...box,
            cal_box_id: box.cal_box_id,
            document_product_no: box.document_product_no,
            cubic_centimeter_box: box.cubic_centimeter_box,
            count: box.count
          },
          canFit: false,
          volume: box.cubic_centimeter_box * box.count,
        });
      }
    }

    return placements;
  };

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

      {/* Calculate Dialog */}
      <Dialog.Root open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <Dialog.Content className="max-w-4xl max-h-[80vh] flex flex-col">
          <div className="flex-none">
            <Dialog.Title className="text-xl font-bold mb-4">
              Calculation Summary
            </Dialog.Title>
            {calculateSummary && (
              <div className="mb-4">
                <strong>Zone:</strong> {zones.find(z => z.master_zone_id === calculateSummary.zone)?.master_zone_name || calculateSummary.zone}
                <br />
                <strong>Document:</strong> {calculateSummary.document}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {calculateSummary && (
              <div>
                {/* ตารางรายชื่อ Rack และ Shelf */}
                <div>
                  {calculateSummary?.racks.map((rack) => (
                    <div key={rack.master_rack_id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-blue-800 mb-2">
                        Rack: {rack.master_rack_name}
                      </div>

                      {(calculateSummary.shelves || [])
                        .filter((shelf) => shelf.master_rack_id === rack.master_rack_id)
                        .map((shelf) => {
                          const fitBoxes = (calculateSummary.boxPlacements || [])
                            .filter(
                              (bp) =>
                                bp.canFit &&
                                bp.suggestedShelf?.master_shelf_id === shelf.master_shelf_id
                            )
                            .map((bp) => {
                              // ดึง cal_box_id จาก bp.box โดยตรง
                              return {
                                cal_box_id: bp.box.cal_box_id,
                                document_product_no: bp.box.document_product_no,
                                box_no: bp.box.box_no,
                                cubic_centimeter_box: bp.box.cubic_centimeter_box,
                                count: bp.box.count || 1
                              };
                            });

                          // 🔹 เก็บค่าลง tempShelfData
                          if (fitBoxes.length > 0) {
                            // Check if shelf already exists in tempShelfData
                            const existingShelfIndex = tempShelfData.findIndex(
                              s => s.shelf_id === shelf.master_shelf_id
                            );

                            if (existingShelfIndex === -1) {
                              // Add new shelf
                              tempShelfData.push({
                                shelf_id: shelf.master_shelf_id,
                                shelf_name: shelf.master_shelf_name,
                                master_rack_id: shelf.master_rack_id,
                                fitBoxes,
                              });
                            } else {
                              // Update existing shelf's fitBoxes
                              tempShelfData[existingShelfIndex].fitBoxes = [
                                ...tempShelfData[existingShelfIndex].fitBoxes,
                                ...fitBoxes
                              ];
                            }
                          }

                          return (
                            <div key={shelf.master_shelf_id} className="ml-4 mb-4">
                              <div className="font-semibold text-gray-700">
                                Shelf: {shelf.master_shelf_name} Volume:{" "}
                                {shelf.cubic_centimeter_shelf}
                              </div>

                              {fitBoxes.length > 0 && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-md text-sm text-green-900">
                                  <div className="font-semibold mb-1">
                                    ✅ กล่องที่สามารถใส่ได้ใน{" "}
                                    <span className="underline">{shelf.master_shelf_name}</span>:
                                  </div>
                                  <ul className="list-disc ml-5">
                                    {fitBoxes.map((box, i) => (
                                      <li key={i}>
                                        Doc: {box.document_product_no}, Box No: {box.box_no} Volume: {box.cubic_centimeter_box}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-none mt-6 flex justify-end gap-4 border-t pt-4">
            <Button
              onClick={() => savePayload()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Save
            </Button>

            <Button
              onClick={() => setShowCalculateDialog(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default WarehouseCalculation;