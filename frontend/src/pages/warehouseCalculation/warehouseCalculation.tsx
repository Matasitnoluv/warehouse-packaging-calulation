import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Text, Dialog, Flex, Table, Select, Badge, Separator } from "@radix-ui/themes";
import { ArrowLeft, CheckCircle, Info, X, Plus, Trash2, Edit, Save, AlertCircle, Package, Warehouse, BoxSelect, BarChart3, Layers, Grid3X3 } from "lucide-react";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf } from "@/services/msshelf.services";
import { getCalBox } from "@/services/calbox.services";
import { getCalMsproduct } from "@/services/calmsproduct.services";
import { shelfBoxStorageService, StoreBoxPayload as ShelfStoreBoxPayload } from "@/services/shelfBoxStorage.services";

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

const WarehouseCalculation = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();

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
  const [autoAssignToOtherShelves, setAutoAssignToOtherShelves] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState<any>(null);
  const [showStorageSuccessDialog, setShowStorageSuccessDialog] = useState(false);

  // State for warehouse overview
  const [showWarehouseOverview, setShowWarehouseOverview] = useState(false);
  const [warehouseOverview, setWarehouseOverview] = useState<WarehouseOverview | null>(null);

  // State for detailed view dialogs
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [showRackDetails, setShowRackDetails] = useState(false);
  const [showShelfDetails, setShowShelfDetails] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);

  // State to store all zones, racks, and shelves for details view
  const [allZonesData, setAllZonesData] = useState<any[]>([]);
  const [allRacksData, setAllRacksData] = useState<any[]>([]);
  const [allShelvesData, setAllShelvesData] = useState<any[]>([]);

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!warehouseId) return;

      try {
        setLoading(true);
        const response = await getMswarehouse();
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
      } catch (err) {
        setError("An error occurred while fetching warehouse data");
        console.error(err);
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
        const response = await getMszone(warehouseId);
        console.log("Zones response:", response);
        if (response.success) {
          setZones(response.responseObject || []);
        } else {
          setError("Failed to load zones");
        }
      } catch (err) {
        setError("An error occurred while fetching zones");
        console.error(err);
      }
    };

    fetchZones();
  }, [warehouseId]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getCalMsproduct();
        console.log("Documents response:", response);
        if (response.success) {
          setDocuments(response.responseObject || []);
        } else {
          setError("Failed to load documents");
        }
      } catch (err) {
        setError("An error occurred while fetching documents");
        console.error(err);
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
        const response = await getMsrack(selectedZone);
        console.log("Racks response:", response);
        if (response.success) {
          setRacks(response.responseObject || []);
        } else {
          setError("Failed to load racks");
        }
      } catch (err) {
        setError("An error occurred while fetching racks");
        console.error(err);
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
    const fetchBoxes = async () => {
      if (!selectedDocument) {
        setBoxes([]);
        setBoxFitResults([]);
        setRackSpaceSummary(null);
        return;
      }

      try {
        console.log("Fetching boxes for document:", selectedDocument);
        const response = await getCalBox(selectedDocument);
        console.log("Boxes response for document:", response);

        if (response.success) {
          // Only get boxes that belong to the selected document
          const documentBoxes = response.responseObject.filter(
            (box: BoxType) => box.document_product_no === selectedDocument
          );

          console.log(`Found ${documentBoxes.length} boxes for document ${selectedDocument}`);

          if (documentBoxes.length > 0) {
            setBoxes(documentBoxes);
          } else {
            console.warn(`No boxes found for document ${selectedDocument}`);

            // Try to fetch all boxes again to see if there are any for this document
            const allBoxesResponse = await getCalBox("");
            if (allBoxesResponse.success) {
              const matchingBoxes = allBoxesResponse.responseObject.filter(
                (box: BoxType) => box.document_product_no === selectedDocument
              );

              console.log(`Found ${matchingBoxes.length} matching boxes from all boxes`);

              if (matchingBoxes.length > 0) {
                console.log("Using matching boxes from all boxes as fallback");
                setBoxes(matchingBoxes);
              } else {
                setBoxes([]);
              }
            }
          }
        } else {
          setError("Failed to load boxes");
        }
      } catch (err) {
        setError("An error occurred while fetching boxes");
        console.error(err);
      }
    };

    fetchBoxes();
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

  // Refresh stored boxes after successful storage operations
  const refreshAfterStorage = async () => {
    // Refresh stored boxes for the current shelf
    try {
      console.log("Refreshing data after storage operation");

      // Refresh stored boxes in this shelf
      if (selectedShelf) {
        const shelfResponse = await shelfBoxStorageService.getStoredBoxesByShelfId(selectedShelf);
        if (shelfResponse.success) {
          console.log("Updated shelf stored boxes:", shelfResponse.responseObject);
          setShelfStoredBoxes(shelfResponse.responseObject || []);
        }
      }

      // Refresh all stored boxes across all shelves
      const allBoxesResponse = await shelfBoxStorageService.getAllStoredBoxes();
      if (allBoxesResponse.success) {
        console.log("Updated all stored boxes:", allBoxesResponse.responseObject);
        setAllStoredBoxes(allBoxesResponse.responseObject || []);
      }

      // Refresh the boxes from the document to update their status
      if (selectedDocument) {
        const response = await getCalBox(selectedDocument);
        if (response.success) {
          const documentBoxes = response.responseObject.filter(
            (box: BoxType) => box.document_product_no === selectedDocument
          );
          console.log("Updated document boxes:", documentBoxes);
          setBoxes(documentBoxes);
        }
      }

      // Refresh the shelves to update available space
      if (selectedRack) {
        const shelfResponse = await getMsshelf(selectedRack);
        if (shelfResponse.success) {
          setShelves(shelfResponse.responseObject || []);
        }
      }

      // Refresh documents list to update which ones are fully stored
      const docsResponse = await getCalMsproduct();
      if (docsResponse.success) {
        setDocuments(docsResponse.responseObject || []);
      }

      // Force re-calculation of box fit results
      if (selectedShelf && boxes.length > 0) {
        console.log("Forcing recalculation of box fit results");
        // This will trigger the useEffect that calculates box fit results
        const tempShelf = selectedShelf;
        setSelectedShelf("");
        setTimeout(() => {
          setSelectedShelf(tempShelf);
        }, 50);
      }
    } catch (error) {
      console.error("Error refreshing data after storage:", error);
    }
  };

  // Refresh stored boxes in shelves after successful storage operations
  const refreshShelfStoredBoxes = async () => {
    if (!selectedShelf) {
      setShelfStoredBoxes([]);
      return;
    }

    try {
      // Refresh stored boxes for the current shelf
      const response = await shelfBoxStorageService.getStoredBoxesByShelfId(selectedShelf);
      if (response.success) {
        console.log("Refreshed stored boxes for shelf:", response.responseObject);
        setShelfStoredBoxes(response.responseObject || []);
      } else {
        console.error("Failed to refresh stored boxes for shelf:", response.message);
      }

      // Also refresh all stored boxes across all shelves
      const allBoxesResponse = await shelfBoxStorageService.getAllStoredBoxes();
      if (allBoxesResponse.success) {
        console.log("Refreshed all stored boxes:", allBoxesResponse.responseObject);
        setAllStoredBoxes(allBoxesResponse.responseObject || []);
      }
    } catch (err) {
      console.error("Error refreshing stored boxes:", err);
    }
  };

  // Track all stored boxes across all racks to filter out completed documents
  useEffect(() => {
    const fetchAllStoredBoxes = async () => {
      try {
        const response = await shelfBoxStorageService.getAllStoredBoxes();
        if (response.success) {
          setAllStoredBoxes(response.responseObject || []);
        } else {
          console.error("Failed to load all stored boxes:", response.message);
        }
      } catch (err) {
        console.error("Error fetching all stored boxes:", err);
      }
    };

    fetchAllStoredBoxes();
  }, [storedBoxes]); // Refresh when storedBoxes changes

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
      } else if (shelfStoredBoxes.responseObject && Array.isArray(shelfStoredBoxes.responseObject)) {
        storedBoxesInThisShelf = shelfStoredBoxes.responseObject;
      }
    }

    const storedBoxIds = storedBoxesInThisShelf.map((sb: any) => sb.cal_box_id);
    console.log("Stored box IDs in this shelf:", storedBoxIds);

    // Also check all stored boxes across all shelves - make sure we're working with an array
    let allStoredBoxesArray: any[] = [];
    if (allStoredBoxes && typeof allStoredBoxes === 'object') {
      if (Array.isArray(allStoredBoxes)) {
        allStoredBoxesArray = allStoredBoxes;
      } else if (allStoredBoxes.responseObject && Array.isArray(allStoredBoxes.responseObject)) {
        allStoredBoxesArray = allStoredBoxes.responseObject;
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

  // Function to check if all boxes for a document are stored
  const checkIfDocumentFullyStored = (documentId: string): boolean => {
    if (!documentId || !allStoredBoxes || boxes.length === 0) {
      return false;
    }

    // Get all boxes for this document
    const boxesForDoc = boxes.filter(box => box.document_product_no === documentId);
    if (boxesForDoc.length === 0) {
      return false;
    }

    // Get all stored box IDs
    let storedBoxes: any[] = [];
    if (Array.isArray(allStoredBoxes)) {
      storedBoxes = allStoredBoxes;
    } else if (allStoredBoxes && typeof allStoredBoxes === 'object' && allStoredBoxes.responseObject && Array.isArray(allStoredBoxes.responseObject)) {
      storedBoxes = allStoredBoxes.responseObject;
    }

    // Check if all boxes for this document are stored
    const boxIds = boxesForDoc.map(box => box.cal_box_id);
    const storedBoxIds = storedBoxes.map((sb: any) => sb.cal_box_id);

    console.log("Checking if document fully stored:", documentId);
    console.log("Box IDs for document:", boxIds);
    console.log("Stored box IDs:", storedBoxIds);

    return boxIds.every(boxId => storedBoxIds.includes(boxId));
  };

  // Function to check if all boxes for a document are stored anywhere
  const areAllBoxesStoredAnywhere = (): boolean => {
    if (!selectedDocument || !allStoredBoxes || boxes.length === 0) {
      return false;
    }

    // Get all boxes for this document
    const boxesForDoc = boxes.filter(box => box.document_product_no === selectedDocument);
    if (boxesForDoc.length === 0) {
      return false;
    }

    // Get all stored box IDs
    let storedBoxes: any[] = [];
    if (Array.isArray(allStoredBoxes)) {
      storedBoxes = allStoredBoxes;
    } else if (allStoredBoxes && typeof allStoredBoxes === 'object' && allStoredBoxes.responseObject && Array.isArray(allStoredBoxes.responseObject)) {
      storedBoxes = allStoredBoxes.responseObject;
    }

    // Check if all boxes for this document are stored
    const boxIds = boxesForDoc.map(box => box.cal_box_id);
    const storedBoxIds = storedBoxes.map((sb: any) => sb.cal_box_id);

    console.log("Checking if all boxes are stored anywhere:", selectedDocument);
    console.log("Box IDs for document:", boxIds);
    console.log("Stored box IDs:", storedBoxIds);

    return boxIds.every(boxId => storedBoxIds.includes(boxId));
  };

  // Filter documents to only show those with boxes not yet stored
  const availableDocuments = useMemo(() => {
    if (!documents.length) return documents;
    if (!Array.isArray(allStoredBoxes)) return documents;

    return documents.filter(doc => {
      // For performance reasons, we'll only do a detailed check for the selected document
      if (doc.document_product_no === selectedDocument && boxes.length > 0) {
        // For the selected document, check if all its boxes are stored
        const isFullyStored = checkIfDocumentFullyStored(
          doc.document_product_no
        );

        console.log(`Document (${doc.document_product_no}): All boxes stored? ${isFullyStored}`);

        // If all boxes are stored, filter this document out (don't show it)
        return !isFullyStored;
      }

      // For other documents, we'll do a simpler check
      // Get all stored boxes for this document
      const storedBoxesForDoc = allStoredBoxes.filter(sb => {
        const documentProductNo = sb.document_product_no ||
          (sb.box && sb.box.document_product_no);
        return documentProductNo === doc.document_product_no;
      });

      // If we have stored boxes for this document, we need to check if all boxes are stored
      if (storedBoxesForDoc.length > 0) {
        // We need to fetch all boxes for this document to check if all are stored
        // This is an expensive operation, so we'll just show a warning that some boxes are stored
        console.log(`Document (${doc.document_product_no}): Has ${storedBoxesForDoc.length} stored boxes`);

        // For now, we'll still show the document in the list
        return true;
      }

      // No stored boxes for this document, so it's available
      return true;
    });
  }, [documents, allStoredBoxes, selectedDocument, boxes]);

  // ตรวจสอบว่า Document นี้ถูกเก็บใน rack ใด ๆ แล้วหรือยัง (ทั่วทั้งคลัง)
  const isDocumentAlreadyStored = useMemo(() => {
    if (!selectedDocument) return false;
    return Array.isArray(allStoredBoxes) && allStoredBoxes.some(
      (sb) => (sb.document_product_no || (sb.box && sb.box.document_product_no)) === selectedDocument
    );
  }, [allStoredBoxes, selectedDocument]);

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

  // Handle zone selection
  const handleZoneChange = (value: string) => {
    console.log("Zone selected:", value);
    setSelectedZone(value);
    setSelectedRack("");
    setSelectedShelf("");
    setBoxFitResults([]);
    setRackSpaceSummary(null);
  };

  // Handle rack selection
  const handleRackChange = (value: string) => {
    console.log("Rack selected:", value);
    setSelectedRack(value);
    setSelectedShelf(""); // Reset shelf selection when rack changes
  };

  // Handle shelf selection
  const handleShelfChange = (value: string) => {
    setSelectedShelf(value);
  };

  // Handle document selection
  const handleDocumentChange = (value: string) => {
    console.log("Document selected:", value);
    if (value === "select-document") {
      setSelectedDocument("");
    } else {
      setSelectedDocument(value);
      // Fetch boxes when document is selected
      fetchBoxesForDocument(value);
    }
  };

  // Fetch boxes for selected document
  const fetchBoxesForDocument = async (documentId: string) => {
    if (!documentId) return;

    try {
      const response = await getCalBox(documentId);
      if (response.success) {
        setBoxes(response.responseObject || []);
        // Calculate box fit results immediately after fetching boxes
        calculateBoxFitResults(response.responseObject || []);
      } else {
        setError("Failed to load boxes");
      }
    } catch (err) {
      setError("An error occurred while fetching boxes");
      console.error(err);
    }
  };

  // Handle storing a box in the shelf
  const handleStoreBox = async () => {
    if (!selectedShelf || !selectedBoxId) {
      return;
    }

    // Find the box to store
    const boxToStore = boxes.find((box) => box.cal_box_id === selectedBoxId);
    if (!boxToStore) {
      return;
    }

    // Find the selected shelf
    const selectedShelfData = shelves.find((shelf) => shelf.master_shelf_id === selectedShelf);
    if (!selectedShelfData) {
      return;
    }

    // Check if there's enough space in the shelf
    const boxVolume = boxToStore.cubic_centimeter_box * boxToStore.count;

    // Get current used space in the shelf
    const response = await shelfBoxStorageService.getStoredBoxesByShelfId(selectedShelf);
    const currentStoredBoxes = response.success ? response.responseObject : [];
    const usedSpace = Array.isArray(currentStoredBoxes) ? currentStoredBoxes.reduce((total: number, box: any) => {
      return total + (box.total_volume || 0);
    }, 0) : 0;

    const remainingSpace = selectedShelfData.cubic_centimeter_shelf - usedSpace;

    if (boxVolume > remainingSpace) {
      setStorageError("Not enough space in the shelf to store this box");
      setShowStorageDialog(true);
      setStorageSuccess(false);
      return;
    }

    // Prepare the payload for storing the box
    const payload: ShelfStoreBoxPayload = {
      master_shelf_id: selectedShelf,
      cal_box_id: boxToStore.cal_box_id,
      cubic_centimeter_box: boxToStore.cubic_centimeter_box,
      count: boxToStore.count,
      document_product_no: boxToStore.document_product_no,
    };

    // Store the box in the shelf
    try {
      const storeResponse = await shelfBoxStorageService.storeBoxInShelf(payload);
      if (storeResponse.success) {
        setStorageSuccess(true);
        setStorageError(null);
        // Refresh data
        await refreshAfterStorage();
      } else {
        setStorageSuccess(false);
        setStorageError(storeResponse.message || "Failed to store box in shelf");
      }
    } catch (err) {
      console.error("Error storing box in shelf:", err);
      setStorageSuccess(false);
      setStorageError("An error occurred while storing the box");
    }

    setShowStorageDialog(true);
  };

  // Function to handle storing all boxes
  const handleStoreAllBoxes = async () => {
    setLoading(true);
    setShowBulkStorageDialog(false);

    try {
      // Get all fitting boxes that are not already stored
      const boxesToStore = boxFitResults.filter(result =>
        result.fits && !result.isStored && !result.isStoredAnywhere
      );

      if (boxesToStore.length === 0) {
        setLoading(false);
        return;
      }

      // Get the current shelf
      const currentShelf = shelves.find(s => s.master_shelf_id === selectedShelf);
      if (!currentShelf) {
        setLoading(false);
        return;
      }

      // Find available shelves in the same rack
      let availableShelves: any[] = [];
      if (autoAssignEnabled) {
        availableShelves = await findAvailableShelvesInRack();
      }

      // Sort boxes by volume (largest first) to optimize shelf space usage
      const sortedBoxes = [...boxesToStore].sort((a, b) => {
        const volumeA = a.box.cubic_centimeter_box * a.box.count;
        const volumeB = b.box.cubic_centimeter_box * b.box.count;
        return volumeB - volumeA; // Largest first
      });

      // Prepare to store boxes
      const successfullyStored: any[] = [];
      const failedToStore: any[] = [];
      const doesNotFitBoxes: any[] = [];

      // Calculate remaining space in current shelf and available shelves
      const shelfSpaces = new Map();

      // Initialize current shelf space
      let remainingSpaceInCurrentShelf = currentShelf.cubic_centimeter_shelf;
      let storedBoxesInThisShelf: any[] = [];
      if (shelfStoredBoxes && typeof shelfStoredBoxes === 'object') {
        if (Array.isArray(shelfStoredBoxes)) {
          storedBoxesInThisShelf = shelfStoredBoxes;
        } else if (shelfStoredBoxes.responseObject && Array.isArray(shelfStoredBoxes.responseObject)) {
          storedBoxesInThisShelf = shelfStoredBoxes.responseObject;
        }
      }

      if (storedBoxesInThisShelf.length > 0) {
        const usedSpace = storedBoxesInThisShelf.reduce((total: number, storedBox: any) => {
          if (storedBox.total_volume) {
            return total + storedBox.total_volume;
          } else if (storedBox.cubic_centimeter_box && storedBox.count) {
            return total + storedBox.cubic_centimeter_box * storedBox.count;
          }
          return total;
        }, 0);
        remainingSpaceInCurrentShelf -= usedSpace;
      }
      shelfSpaces.set(currentShelf.master_shelf_id, remainingSpaceInCurrentShelf);

      // Initialize available shelves space
      for (const shelf of availableShelves) {
        shelfSpaces.set(shelf.master_shelf_id, shelf.remainingVolume);
      }

      // Store boxes across all available shelves
      for (const boxResult of sortedBoxes) {
        const box = boxResult.box;
        const boxVolume = box.cubic_centimeter_box * box.count;
        let stored = false;

        // Try current shelf first
        if (boxVolume <= shelfSpaces.get(currentShelf.master_shelf_id)) {
          try {
            const storeResponse = await shelfBoxStorageService.storeBoxInShelf({
              cal_box_id: box.cal_box_id,
              master_shelf_id: currentShelf.master_shelf_id,
              document_product_no: box.document_product_no,
              cubic_centimeter_box: box.cubic_centimeter_box,
              count: box.count
            });

            if (storeResponse.success) {
              successfullyStored.push({
                ...box,
                shelfName: currentShelf.master_shelf_name
              });
              shelfSpaces.set(currentShelf.master_shelf_id, shelfSpaces.get(currentShelf.master_shelf_id) - boxVolume);
              stored = true;
            }
          } catch (error) {
            console.error(`Error storing box ${box.cal_box_id} in current shelf:`, error);
          }
        }

        // If not stored in current shelf and auto-assign is enabled, try other available shelves
        if (!stored && autoAssignEnabled) {
          for (const shelf of availableShelves) {
            if (boxVolume <= shelfSpaces.get(shelf.master_shelf_id)) {
              try {
                const storeResponse = await shelfBoxStorageService.storeBoxInShelf({
                  cal_box_id: box.cal_box_id,
                  master_shelf_id: shelf.master_shelf_id,
                  document_product_no: box.document_product_no,
                  cubic_centimeter_box: box.cubic_centimeter_box,
                  count: box.count
                });

                if (storeResponse.success) {
                  successfullyStored.push({
                    ...box,
                    shelfName: shelf.master_shelf_name
                  });
                  shelfSpaces.set(shelf.master_shelf_id, shelfSpaces.get(shelf.master_shelf_id) - boxVolume);
                  stored = true;
                  break;
                }
              } catch (error) {
                console.error(`Error storing box ${box.cal_box_id} in shelf ${shelf.master_shelf_name}:`, error);
              }
            }
          }
        }

        // If still not stored, add to appropriate list
        if (!stored) {
          if (!autoAssignEnabled) {
            failedToStore.push(box);
          } else {
            doesNotFitBoxes.push(box);
          }
        }
      }

      // Update box fit results to show "Does not fit" status
      const updatedBoxFitResults = boxFitResults.map(result => {
        const doesNotFit = doesNotFitBoxes.some(box => box.cal_box_id === result.box.cal_box_id);
        if (doesNotFit) {
          return {
            ...result,
            fits: false,
            message: "Does not fit"
          };
        }
        return result;
      });
      setBoxFitResults(updatedBoxFitResults);

      // Show results
      setBulkStorageResults({
        successfullyStored,
        failedToStore: [...failedToStore, ...doesNotFitBoxes]
      });

      // Update data
      await refreshAfterStorage();

      // Show success dialog
      setShowStorageSuccessDialog(true);

    } catch (error) {
      console.error("Error storing all boxes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format volume with commas and units
  const formatVolume = (volume?: number) => {
    if (volume === undefined || volume === null) return "0 cm³";
    return volume.toLocaleString() + " cm³";
  };

  // Format percentage
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
        } else if (shelfStoredBoxes.responseObject && Array.isArray(shelfStoredBoxes.responseObject)) {
          storedBoxesInThisShelf = shelfStoredBoxes.responseObject;
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

  // Calculate warehouse overview data
  const calculateWarehouseOverview = async () => {
    if (!warehouse) return;

    try {
      // Fetch all zones for this warehouse
      const zonesResponse = await getMszone(warehouse.master_warehouse_id);
      const allZones = zonesResponse.success ? zonesResponse.responseObject : [];

      // Fetch all racks for these zones
      let allRacks: RackType[] = [];
      for (const zone of allZones) {
        const racksResponse = await getMsrack(zone.master_zone_id);
        if (racksResponse.success) {
          allRacks = [...allRacks, ...racksResponse.responseObject];
        }
      }

      // Fetch all shelves for these racks
      let allShelves: ShelfType[] = [];
      for (const rack of allRacks) {
        const shelvesResponse = await getMsshelf(rack.master_rack_id);
        if (shelvesResponse.success) {
          allShelves = [...allShelves, ...shelvesResponse.responseObject];
        }
      }

      // Fetch all stored boxes in shelves
      let totalBoxesStored = 0;
      let totalShelfVolumeUsed = 0;

      // Get all stored boxes
      const allStoredBoxesResponse = await shelfBoxStorageService.getAllStoredBoxes();
      console.log("All stored boxes response:", allStoredBoxesResponse);

      if (allStoredBoxesResponse.success) {
        // Log the structure of responseObject to understand its format
        console.log("Response object structure:", typeof allStoredBoxesResponse.responseObject);
        console.log("Response object keys:", Object.keys(allStoredBoxesResponse.responseObject));

        // Try to extract the data regardless of whether it's an array or an object with data property
        let storedBoxesData: any[] = [];

        if (Array.isArray(allStoredBoxesResponse.responseObject)) {
          // If responseObject is already an array
          storedBoxesData = allStoredBoxesResponse.responseObject;
          console.log("ResponseObject is an array with length:", storedBoxesData.length);
        } else if (allStoredBoxesResponse.responseObject && typeof allStoredBoxesResponse.responseObject === 'object') {
          // Check if responseObject has a data property that is an array
          if (allStoredBoxesResponse.responseObject.data && Array.isArray(allStoredBoxesResponse.responseObject.data)) {
            storedBoxesData = allStoredBoxesResponse.responseObject.data;
            console.log("Found data in responseObject.data with length:", storedBoxesData.length);
          } else {
            // Try to convert the object to an array if it's not already
            console.log("ResponseObject keys:", Object.keys(allStoredBoxesResponse.responseObject));

            // If we can't find a data array, try to use the object values as our data
            const values = Object.values(allStoredBoxesResponse.responseObject);
            console.log("ResponseObject values types:", values.map(v => typeof v));

            // Find the first array in the values, if any
            const firstArray = values.find(v => Array.isArray(v));
            if (firstArray) {
              storedBoxesData = firstArray;
              console.log("Found array in responseObject values with length:", storedBoxesData.length);
            } else {
              // If all values are objects, use them as our data
              if (values.every(v => typeof v === 'object' && v !== null)) {
                storedBoxesData = values;
                console.log("Using object values as data array with length:", storedBoxesData.length);
              }
            }
          }
        }

        console.log("Processed stored boxes data:", storedBoxesData);

        // Get all shelf IDs from our warehouse
        const shelfIds = allShelves.map(shelf => shelf.master_shelf_id);
        console.log("Shelf IDs in this warehouse:", shelfIds);

        // Filter boxes to only include those in our shelves
        const relevantBoxes = storedBoxesData.filter((box: any) =>
          box && typeof box === 'object' && shelfIds.includes(box.master_shelf_id)
        );

        console.log("Relevant boxes found:", relevantBoxes);

        totalBoxesStored = relevantBoxes.length;

        // Calculate total volume used
        for (const box of relevantBoxes) {
          if (box && typeof box === 'object') {
            // Make sure we're getting the correct cubic_centimeter_box and count values
            console.log(`Box data: id=${box.shelf_box_storage_id || 'unknown'}, shelf=${box.master_shelf_id || 'unknown'}, cubic_cm=${box.cubic_centimeter_box || 0}, count=${box.count || 0}`);

            const boxVolume = (parseFloat(box.cubic_centimeter_box) || 0) * (parseInt(box.count) || 0);
            totalShelfVolumeUsed += boxVolume;

            console.log(`Box volume calculated: ${boxVolume} (${box.cubic_centimeter_box || 0} × ${box.count || 0})`);
          }
        }

        console.log(`Total boxes stored: ${totalBoxesStored}`);
        console.log(`Total shelf volume used: ${totalShelfVolumeUsed}`);
      } else {
        console.error("Failed to get stored boxes:", allStoredBoxesResponse.message);
      }

      // Calculate zone usage
      const totalZoneVolume = allZones.reduce((total: number, zone: ZoneType) => total + zone.cubic_centimeter_zone, 0);
      const totalRackVolume = allRacks.reduce((total: number, rack: RackType) => total + rack.cubic_centimeter_rack, 0);
      const totalShelfVolume = allShelves.reduce((total: number, shelf: ShelfType) => total + shelf.cubic_centimeter_shelf, 0);

      // Calculate percentages and remaining volumes
      const zoneRemainingVolume = totalZoneVolume - totalRackVolume;
      const zoneUsagePercentage = totalZoneVolume > 0 ? (totalRackVolume / totalZoneVolume) * 100 : 0;

      const rackRemainingVolume = totalRackVolume - totalShelfVolume;
      const rackUsagePercentage = totalRackVolume > 0 ? (totalShelfVolume / totalRackVolume) * 100 : 0;

      const shelfRemainingVolume = totalShelfVolume - totalShelfVolumeUsed;
      const shelfUsagePercentage = totalShelfVolume > 0 ? (totalShelfVolumeUsed / totalShelfVolume) * 100 : 0;

      // Calculate aisle space (warehouse volume - zone volume)
      const warehouseVolume = warehouse.cubic_centimeter_warehouse;
      const aisleVolume = warehouseVolume - totalZoneVolume;
      const aislePercentage = warehouseVolume > 0 ? (aisleVolume / warehouseVolume) * 100 : 0;

      // Create overview object
      const overview: WarehouseOverview = {
        totalZones: allZones.length,
        totalRacks: allRacks.length,
        totalShelves: allShelves.length,
        totalBoxesStored,
        zoneUsage: {
          totalVolume: totalZoneVolume,
          usedForRacks: totalRackVolume,
          remainingVolume: zoneRemainingVolume,
          usagePercentage: zoneUsagePercentage
        },
        rackUsage: {
          totalVolume: totalRackVolume,
          usedForShelves: totalShelfVolume,
          remainingVolume: rackRemainingVolume,
          usagePercentage: rackUsagePercentage
        },
        shelfUsage: {
          totalVolume: totalShelfVolume,
          usedForBoxes: totalShelfVolumeUsed,
          remainingVolume: shelfRemainingVolume,
          usagePercentage: shelfUsagePercentage
        },
        aisleSpace: {
          totalVolume: aisleVolume,
          percentage: aislePercentage
        }
      };

      setWarehouseOverview(overview);
      setAllZonesData(allZones);
      setAllRacksData(allRacks);
      setAllShelvesData(allShelves);
      setShowWarehouseOverview(true);
    } catch (error) {
      console.error("Error calculating warehouse overview:", error);
    }
  };

  // Functions to handle showing details
  const handleShowZoneDetails = () => {
    if (warehouseOverview) {
      setDetailsData({
        type: 'zone',
        zones: allZonesData,
        usage: warehouseOverview.zoneUsage
      });
      setShowZoneDetails(true);
    }
  };

  const handleShowRackDetails = () => {
    if (warehouseOverview) {
      setDetailsData({
        type: 'rack',
        racks: allRacksData,
        usage: warehouseOverview.rackUsage
      });
      setShowRackDetails(true);
    }
  };

  const handleShowShelfDetails = () => {
    if (warehouseOverview) {
      setDetailsData({
        type: 'shelf',
        shelves: allShelvesData,
        usage: warehouseOverview.shelfUsage
      });
      setShowShelfDetails(true);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                <span className="flex items-center gap-2">
                  <Warehouse size={28} className="text-blue-500" />
                  {warehouse.master_warehouse_name}
                </span>
              </h2>
              <p className="text-gray-600">
                Warehouse Calculation - Calculate box placement in shelves
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm">
                    Back
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Warehouse Info Card */}
        <Card className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Warehouse Information</h2>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={calculateWarehouseOverview}
            >
              <BarChart3 className="mr-1" size={16} />
              View OVR
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Dimensions (W×L×H)</p>
              <p className="font-medium">
                {warehouse.width} × {warehouse.length} × {warehouse.height} cm
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Volume</p>
              <p className="font-medium">
                {formatVolume(warehouse.cubic_centimeter_warehouse)} cm³
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Zones</p>
              <p className="font-medium">{zones.length}</p>
            </div>
          </div>
        </Card>

        {/* Selection Controls */}
        <Card className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Box Placement Calculator</h3>

          <div className="flex flex-col gap-4 mt-4">
            {/* Zone Selection */}
            <div>
              <Text as="div" size="2" mb="1" weight="bold">
                Select Zone
              </Text>
              <Select.Root
                value={selectedZone}
                onValueChange={handleZoneChange}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Available Zones</Select.Label>
                    <Select.Item value="select-zone">Select Zone</Select.Item>
                    {zones.map((zone) => (
                      <Select.Item key={zone.master_zone_id} value={zone.master_zone_id}>
                        {zone.master_zone_name} ({formatVolume(zone.cubic_centimeter_zone)})
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </div>

            {/* Document Selection - Only show when zone is selected */}
            {selectedZone && (
              <div>
                <Text as="div" size="2" mb="1" weight="bold">
                  Select Document
                </Text>
                <Select.Root
                  value={selectedDocument}
                  onValueChange={handleDocumentChange}
                >
                  <Select.Trigger className="w-full" />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Available Documents</Select.Label>
                      <Select.Item value="select-document">Select Document</Select.Item>
                      {documents.map((doc) => (
                        <Select.Item key={doc.document_product_id} value={doc.document_product_id}>
                          {doc.document_product_no}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
            )}

            {/* Store All Fitting Boxes button - Only show when document is selected */}
            {selectedDocument && boxes.length > 0 && (
              <Button
                onClick={handleStoreAllBoxes}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                disabled={loading}
              >
                Store All Fitting Boxes
              </Button>
            )}
          </div>
        </Card>

        {/* Shelf Space Summary */}
        {rackSpaceSummary && (
          <Card className="p-4 mb-4">
            <Text size="3" weight="bold" className="mb-2">Shelf Space Usage</Text>
            <div className="space-y-1">
              <Text as="p" size="2">Total Shelf Volume: {formatVolume(rackSpaceSummary.totalRackVolume)}</Text>
              <Text as="p" size="2">Used Volume: {formatVolume(rackSpaceSummary.usedVolume)}</Text>
              <Text as="p" size="2">Remaining Volume: {formatVolume(rackSpaceSummary.remainingVolume)}</Text>
              <Text as="p" size="2">Usage: {formatPercentage(rackSpaceSummary.usagePercentage)}</Text>
              <Text as="p" size="2">Fitting Boxes: {rackSpaceSummary.fittingBoxes} of {rackSpaceSummary.totalBoxes}</Text>

              {/* Visual representation of shelf space usage */}
              <div className="w-full h-4 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(rackSpaceSummary.usagePercentage, 100)}%`,
                    backgroundColor: rackSpaceSummary.usagePercentage > 90
                      ? '#ef4444' // red for > 90%
                      : rackSpaceSummary.usagePercentage > 70
                        ? '#f97316' // orange for > 70%
                        : '#22c55e' // green for <= 70%
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {selectedDocument && boxes.length > 0 && (
          <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BoxSelect size={24} className="text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Box Placement Results
                  </h3>
                </div>

                {boxFitResults.some(result => result.fits && !result.isStored && !result.isStoredAnywhere) && !areAllBoxesStoredAnywhere() && (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setShowBulkStorageDialog(true)}
                  >
                    Store All Fitting Boxes
                  </Button>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Document: <span className="font-medium">{selectedDocument}</span> ({boxes.length} boxes)
              </p>
            </div>

            <div className="overflow-x-auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row className="bg-gray-50">
                    <Table.ColumnHeaderCell>Box No.</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Box Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Volume</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Count</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total Volume</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Remaining Space</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {boxFitResults.length > 0 ? (
                    boxFitResults.map((result) => (
                      <Table.Row
                        key={result.box.cal_box_id}
                        className={
                          result.isStored
                            ? "bg-blue-50"
                            : result.fits
                              ? "bg-green-50"
                              : "bg-red-50"
                        }
                      >
                        <Table.Cell>{result.box.box_no}</Table.Cell>
                        <Table.Cell className="font-medium">{result.box.master_box_name}</Table.Cell>
                        <Table.Cell>{result.box.master_product_name}</Table.Cell>
                        <Table.Cell>{formatVolume(result.box.cubic_centimeter_box)}</Table.Cell>
                        <Table.Cell>{result.box.count}</Table.Cell>
                        <Table.Cell>
                          {formatVolume(result.box.cubic_centimeter_box * result.box.count)}
                        </Table.Cell>
                        <Table.Cell>
                          {result.isStored ? (
                            <Badge color="gray" className="px-2 py-1 text-xs">
                              Already in Shelf
                            </Badge>
                          ) : result.fits ? (
                            <Badge color="green">
                              Fits
                            </Badge>
                          ) : (
                            <Badge color="red">
                              Does not fit
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {result.fits ? formatVolume(result.remainingSpace) : "N/A"}
                        </Table.Cell>
                        <Table.Cell>
                          {!result.isStored && !result.isStoredAnywhere && result.fits && !isDocumentAlreadyStored && (
                            <Button
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2"
                              onClick={() => {
                                setSelectedBoxId(result.box.cal_box_id);
                                setShowStorageDialog(true);
                              }}
                            >
                              Store in Shelf
                            </Button>
                          )}
                          {result.isStored && (
                            <Badge color="green" className="px-2 py-1 text-xs">
                              Stored in This Shelf
                            </Badge>
                          )}
                          {!result.isStored && result.isStoredAnywhere && (
                            <Badge color="blue" className="px-2 py-1 text-xs">
                              Stored in Another Shelf
                            </Badge>
                          )}
                          {!result.fits && !result.isStored && !result.isStoredAnywhere && (
                            <Badge color="red" className="px-2 py-1 text-xs">
                              Does Not Fit
                            </Badge>
                          )}
                          {!result.isStored && !result.isStoredAnywhere && isDocumentAlreadyStored && (
                            <Badge color="gray" className="px-2 py-1 text-xs">
                              Document Fully Stored
                            </Badge>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={9} className="text-center py-8">
                        <div className="text-gray-500">
                          {selectedShelf ? "No calculation results" : "Select a shelf to calculate box placement"}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </div>
          </Card>
        )}

        {/* Store Box Dialog */}
        <Dialog.Root open={showStorageDialog} onOpenChange={setShowStorageDialog}>
          <Dialog.Content>
            <Dialog.Title>Store Box in Shelf</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Are you sure you want to store this box in the selected shelf? Once stored, the box cannot be removed, only moved to another shelf.
            </Dialog.Description>

            {storageSuccess ? (
              <Flex direction="column" align="center" gap="3" py="4">
                <CheckCircle size={48} className="text-green-500" />
                <Text size="4" weight="bold" className="text-green-700">Box Stored Successfully</Text>
                <Text size="2" className="text-gray-600">
                  The box has been successfully stored in the shelf and will now be included in the shelf's used space.
                </Text>
                <Button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2"
                  onClick={() => {
                    setShowStorageDialog(false);
                    setStorageSuccess(false);
                    setSelectedBoxId(null);
                  }}
                >
                  Close
                </Button>
              </Flex>
            ) : (
              <>
                {storageError && (
                  <Flex align="center" gap="2" className="bg-red-50 p-3 rounded-lg mb-4">
                    <AlertCircle size={20} className="text-red-500" />
                    <Text size="2" className="text-red-700">{storageError}</Text>
                  </Flex>
                )}

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleStoreBox}>
                    Store Box
                  </Button>
                </Flex>
              </>
            )}
          </Dialog.Content>
        </Dialog.Root>

        {/* Bulk Store Boxes Dialog */}
        <Dialog.Root open={showBulkStorageDialog} onOpenChange={setShowBulkStorageDialog}>
          <Dialog.Content>
            <Dialog.Title>Store All Fitting Boxes</Dialog.Title>

            {!bulkStorageSuccess ? (
              <>
                <Dialog.Description size="2" mb="4">
                  This will store all boxes that fit in the selected shelf. Once stored, boxes cannot be
                  removed, only moved to another shelf.
                </Dialog.Description>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <Text size="2" className="text-blue-800 font-medium">Storage Summary</Text>
                  <Text size="4" className="text-blue-900 font-bold">
                    {boxFitResults.filter(result => result.fits && !result.isStored && !result.isStoredAnywhere).length} boxes will be stored in the shelf.
                  </Text>
                  {boxFitResults.filter(result => !result.fits).length > 0 && (
                    <Text size="4" className="text-red-600">
                      {boxFitResults.filter(result => !result.fits).length} boxes do not fit and will not be stored.
                    </Text>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAssignToOtherShelves}
                      onChange={(e) => setAutoAssignToOtherShelves(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      Automatically assign boxes to other shelves if this shelf is full
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    If enabled, boxes that don't fit in this shelf will be automatically stored in other available shelves in this rack.
                  </p>
                </div>

                {autoAssignToOtherShelves && autoAssignPreview && (
                  <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <Text size="3" weight="bold" className="mb-2">Auto-Assign Preview</Text>
                    <Text size="2" className="text-gray-600 mb-4">
                      Here's how boxes will be distributed across shelves:
                    </Text>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {autoAssignPreview.shelves && autoAssignPreview.shelves.map((shelf: any, index: number) => (
                        <div key={index} className="border rounded p-3 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <Text size="3" weight="bold" className={shelf.shelfName === "ไม่สามารถจัดเก็บได้" ? "text-red-600" : "text-green-600"}>
                              {shelf.shelfName}
                            </Text>
                            {shelf.remainingSpace !== undefined && (
                              <Text size="2" className="text-gray-600">
                                พื้นที่คงเหลือ: {formatVolume(shelf.remainingSpace)} / {formatVolume(shelf.totalSpace)}
                                ({Math.round((shelf.remainingSpace / shelf.totalSpace) * 100)}%)
                              </Text>
                            )}
                          </div>

                          {shelf.boxes && shelf.boxes.length > 0 ? (
                            <div className="text-sm">
                              <Text size="2" className="text-gray-700 mb-1">จะจัดเก็บ {shelf.boxes.length} กล่อง:</Text>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {shelf.boxes.map((box: any, boxIndex: number) => (
                                  <div key={boxIndex} className="text-xs bg-gray-100 p-2 rounded">
                                    <div><span className="font-medium">ชื่อกล่อง:</span> {box.master_box_name}</div>
                                    <div><span className="font-medium">ปริมาตร:</span> {formatVolume(box.volume)}</div>
                                    <div><span className="font-medium">จำนวน:</span> {box.count}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Text size="2" className="text-gray-500 italic">
                              {shelf.shelfId === selectedShelf
                                ? "ชั้นวางนี้เต็มแล้ว กล่องจะถูกจัดเก็บในชั้นวางอื่นโดยอัตโนมัติ"
                                : "ไม่มีกล่องที่จะจัดเก็บในชั้นนี้"}
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleStoreAllBoxes}
                    disabled={boxFitResults.filter(r => r.fits && !r.isStored).length === 0}
                  >
                    Store All Boxes
                  </Button>
                </Flex>
              </>
            ) : (
              <Flex direction="column" align="center" gap="3" py="4">
                <CheckCircle size={48} className="text-green-500" />
                <Text size="4" weight="bold" className="text-green-700">Boxes Stored</Text>
                <div className="bg-gray-50 p-4 rounded-lg w-full text-center">
                  <p className="text-gray-700">
                    <span className="font-bold text-green-600">{bulkStorageResults.successfullyStored.length}</span> boxes stored successfully
                  </p>
                  {bulkStorageResults.failedToStore.length > 0 && (
                    <p className="text-gray-700 mt-2">
                      <span className="font-bold text-red-600">{bulkStorageResults.failedToStore.length}</span> boxes could not be stored
                    </p>
                  )}
                </div>
                <Text size="2" className="text-gray-600 text-center">
                  {bulkStorageResults.failedToStore.length > 0
                    ? "Some boxes could not be stored. This may be because there was not enough space in the shelf or other shelves, or the boxes are already stored elsewhere."
                    : "All boxes have been successfully stored in shelves."}
                </Text>
                <Button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2"
                  onClick={() => {
                    setShowBulkStorageDialog(false);
                    setBulkStorageSuccess(false);
                    // Refresh the page data after closing the dialog
                    if (selectedDocument) {
                      getCalBox(selectedDocument).then(response => {
                        if (response.success) {
                          const documentBoxes = response.responseObject.filter(
                            (box: BoxType) => box.document_product_no === selectedDocument
                          );
                          setBoxes(documentBoxes);
                        }
                      });
                    }
                  }}
                >
                  Close
                </Button>
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Root>

        {/* Stored Boxes Dialog */}
        <Dialog.Root open={showStoredBoxesDialog} onOpenChange={setShowStoredBoxesDialog}>
          <Dialog.Content style={{ maxWidth: '800px' }}>
            <Dialog.Title>Boxes Stored in Shelf</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              These boxes are currently stored in the selected shelf.
            </Dialog.Description>

            {shelfStoredBoxes.length > 0 ? (
              <div className="overflow-x-auto max-h-96">
                <Table.Root>
                  <Table.Header>
                    <Table.Row className="bg-gray-50">
                      <Table.ColumnHeaderCell>Box Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Volume</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Count</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Stored Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {shelfStoredBoxes.map((storedBox) => (
                      <Table.Row key={storedBox.storage_id}>
                        <Table.Cell className="font-medium">{storedBox.box?.master_box_name}</Table.Cell>
                        <Table.Cell>{storedBox.box?.master_product_name}</Table.Cell>
                        <Table.Cell>{formatVolume(storedBox.box?.cubic_centimeter_box)}</Table.Cell>
                        <Table.Cell>{storedBox.box?.count}</Table.Cell>
                        <Table.Cell>{formatDate(storedBox.stored_date)}</Table.Cell>
                        <Table.Cell>
                          <Badge color="blue">
                            {storedBox.status}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </div>
            ) : (
              <div className="text-center py-12">
                <Info size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Boxes Stored</h3>
                <p className="text-gray-500">
                  There are no boxes currently stored in this shelf.
                </p>
              </div>
            )}

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Storage Success Dialog */}
        <Dialog.Root open={showStorageSuccessDialog} onOpenChange={setShowStorageSuccessDialog}>
          <Dialog.Content>
            <Dialog.Title>Storage Success</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Boxes have been successfully stored in the shelf.
            </Dialog.Description>

            <Flex direction="column" align="center" gap="3" py="4">
              <CheckCircle size={48} className="text-green-500" />
              <Text size="4" weight="bold" className="text-green-700">Storage Successful</Text>
              <Text size="2" className="text-gray-600">
                The boxes have been successfully stored in the shelf and will now be included in the shelf's used space.
              </Text>
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2"
                onClick={() => {
                  setShowStorageSuccessDialog(false);
                  // Refresh the page data after closing the dialog
                  if (selectedDocument) {
                    getCalBox(selectedDocument).then(response => {
                      if (response.success) {
                        const documentBoxes = response.responseObject.filter(
                          (box: BoxType) => box.document_product_no === selectedDocument
                        );
                        setBoxes(documentBoxes);
                      }
                    });
                  }
                }}
              >
                Close
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Warehouse Overview Dashboard Dialog */}
        <Dialog.Root open={showWarehouseOverview} onOpenChange={setShowWarehouseOverview}>
          <Dialog.Content style={{ maxWidth: '900px', width: '90vw' }}>
            <Dialog.Title>Warehouse Overview Dashboard</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Detailed information about warehouse space usage and allocation.
            </Dialog.Description>

            {warehouseOverview ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <Text size="1" className="text-blue-700 mb-1">Total Zones</Text>
                    <Text size="6" weight="bold">{warehouseOverview.totalZones}</Text>
                  </Card>
                  <Card className="p-4 bg-green-50">
                    <Text size="1" className="text-green-700 mb-1">Total Racks</Text>
                    <Text size="6" weight="bold">{warehouseOverview.totalRacks}</Text>
                  </Card>
                  <Card className="p-4 bg-purple-50">
                    <Text size="1" className="text-purple-700 mb-1">Total Shelves</Text>
                    <Text size="6" weight="bold">{warehouseOverview.totalShelves}</Text>
                  </Card>
                  <Card className="p-4 bg-amber-50">
                    <Text size="1" className="text-amber-700 mb-1">Boxes Stored</Text>
                    <Text size="6" weight="bold">{warehouseOverview.totalBoxesStored}</Text>
                  </Card>
                </div>

                {/* Zone Usage */}
                <Card className="p-4">
                  <Flex align="center" gap="2" className="mb-3">
                    <Layers size={20} className="text-blue-600" />
                    <Text size="4" weight="bold">Zone Usage</Text>
                    <Button
                      variant="outline"
                      onClick={handleShowZoneDetails}
                    >
                      View
                    </Button>
                  </Flex>
                  <div className="space-y-3">
                    <Flex justify="between">
                      <Text size="2">Total Volume:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.zoneUsage.totalVolume)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Used for Racks:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.zoneUsage.usedForRacks)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Remaining Volume:</Text>
                      <Text size="2" weight="medium" className="text-green-600">{formatVolume(warehouseOverview.zoneUsage.remainingVolume)} cm³</Text>
                    </Flex>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <Text size="2">Usage:</Text>
                        <Text size="2" weight="medium">{warehouseOverview.zoneUsage.usagePercentage.toFixed(2)}%</Text>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(warehouseOverview.zoneUsage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Rack Usage */}
                <Card className="p-4">
                  <Flex align="center" gap="2" className="mb-3">
                    <Grid3X3 size={20} className="text-green-600" />
                    <Text size="4" weight="bold">Rack Usage</Text>
                    <Button
                      variant="outline"
                      onClick={handleShowRackDetails}
                    >
                      View
                    </Button>
                  </Flex>
                  <div className="space-y-3">
                    <Flex justify="between">
                      <Text size="2">Total Volume:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.rackUsage.totalVolume)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Used for Shelves:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.rackUsage.usedForShelves)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Remaining Volume:</Text>
                      <Text size="2" weight="medium" className="text-green-600">{formatVolume(warehouseOverview.rackUsage.remainingVolume)} cm³</Text>
                    </Flex>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <Text size="2">Usage:</Text>
                        <Text size="2" weight="medium">{warehouseOverview.rackUsage.usagePercentage.toFixed(2)}%</Text>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(warehouseOverview.rackUsage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Shelf Usage */}
                <Card className="p-4">
                  <Flex align="center" gap="2" className="mb-3">
                    <BoxSelect size={20} className="text-purple-600" />
                    <Text size="4" weight="bold">Shelf Usage</Text>
                    <Button
                      variant="outline"
                      onClick={handleShowShelfDetails}
                    >
                      View
                    </Button>
                  </Flex>
                  <div className="space-y-3">
                    <Flex justify="between">
                      <Text size="2">Total Volume:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.shelfUsage.totalVolume)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Used for Boxes:</Text>
                      <Text size="2" weight="medium">{formatVolume(warehouseOverview.shelfUsage.usedForBoxes)} cm³</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text size="2">Remaining Volume:</Text>
                      <Text size="2" weight="medium" className="text-green-600">{formatVolume(warehouseOverview.shelfUsage.remainingVolume)} cm³</Text>
                    </Flex>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <Text size="2">Usage:</Text>
                        <Text size="2" weight="medium">{warehouseOverview.shelfUsage.usagePercentage.toFixed(2)}%</Text>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(warehouseOverview.shelfUsage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Aisle Space */}
                {warehouseOverview.aisleSpace && (
                  <Card className="p-4">
                    <Flex align="center" gap="2" className="mb-3">
                      <Warehouse size={20} className="text-amber-600" />
                      <Text size="4" weight="bold">Aisle Space</Text>
                    </Flex>
                    <div className="space-y-3">
                      <Flex justify="between">
                        <Text size="2">Total Aisle Volume:</Text>
                        <Text size="2" weight="medium">{formatVolume(warehouseOverview.aisleSpace.totalVolume)} cm³</Text>
                      </Flex>
                      <Flex justify="between">
                        <Text size="2">Percentage of Warehouse:</Text>
                        <Text size="2" weight="medium">{warehouseOverview.aisleSpace.percentage.toFixed(2)}%</Text>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(warehouseOverview.aisleSpace.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Notes about Aisle Space */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Text size="3" weight="medium" className="mb-2">Notes about Aisle Space</Text>
                  <Text size="2" className="text-gray-600">
                    Aisle space is calculated as the difference between the total warehouse volume and the total zone volume.
                    This space is typically used for walkways, transportation paths, and other operational needs.
                    Industry standards recommend allocating 30-40% of warehouse space for aisles to ensure efficient operations.
                  </Text>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-12">
                <Text>Loading warehouse data...</Text>
              </div>
            )}

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Zone Details Dialog */}
        <Dialog.Root open={showZoneDetails} onOpenChange={setShowZoneDetails}>
          <Dialog.Content>
            <div className="flex justify-between items-center mb-4">
              <div>
                <Dialog.Title>Zone Details</Dialog.Title>
                <Dialog.Description>
                  Detailed information about zones in the warehouse.
                </Dialog.Description>
              </div>
              <Dialog.Close>
                <Button variant="ghost">
                  <X size={16} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="py-4">
              {detailsData && detailsData.type === 'zone' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Zone Usage Summary</h3>
                    <Badge variant="outline" className="bg-blue-50">
                      {detailsData.zones.length} Zones
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span>{detailsData.usage.totalVolume.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used for Racks:</span>
                      <span>{detailsData.usage.usedForRacks.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Volume:</span>
                      <span className="text-green-600">{detailsData.usage.remainingVolume.toLocaleString()} cm³</span>
                    </div>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <span>Usage:</span>
                        <span>{detailsData.usage.usagePercentage.toFixed(2)}%</span>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: `${Math.min(detailsData.usage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Zone List</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {detailsData.zones.map((zone: any) => (
                        <div key={zone.master_zone_id} className="border rounded-md p-3">
                          <div className="font-medium">{zone.master_zone_name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex justify-between">
                              <span>ID:</span>
                              <span>{zone.master_zone_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width:</span>
                              <span>{zone.width_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Length:</span>
                              <span>{zone.length_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Height:</span>
                              <span>{zone.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span>{(zone.width_cm * zone.length_cm * zone.height_cm).toLocaleString()} cm³</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowZoneDetails(false)}>Close</Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>

        {/* Rack Details Dialog */}
        <Dialog.Root open={showRackDetails} onOpenChange={setShowRackDetails}>
          <Dialog.Content>
            <div className="flex justify-between items-center mb-4">
              <div>
                <Dialog.Title>Rack Details</Dialog.Title>
                <Dialog.Description>
                  Detailed information about racks in the warehouse.
                </Dialog.Description>
              </div>
              <Dialog.Close>
                <Button variant="ghost">
                  <X size={16} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="py-4">
              {detailsData && detailsData.type === 'rack' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Rack Usage Summary</h3>
                    <Badge variant="outline" className="bg-green-50">
                      {detailsData.racks.length} Racks
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span>{detailsData.usage.totalVolume.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used for Shelves:</span>
                      <span>{detailsData.usage.usedForShelves.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Volume:</span>
                      <span className="text-green-600">{detailsData.usage.remainingVolume.toLocaleString()} cm³</span>
                    </div>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <span>Usage:</span>
                        <span>{detailsData.usage.usagePercentage.toFixed(2)}%</span>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${Math.min(detailsData.usage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rack List</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {detailsData.racks.map((rack: any) => (
                        <div key={rack.master_rack_id} className="border rounded-md p-3">
                          <div className="font-medium">{rack.master_rack_name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex justify-between">
                              <span>ID:</span>
                              <span>{rack.master_rack_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Zone:</span>
                              <span>{rack.master_zone_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width:</span>
                              <span>{rack.width_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Length:</span>
                              <span>{rack.length_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Height:</span>
                              <span>{rack.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span>{(rack.width_cm * rack.length_cm * rack.height_cm).toLocaleString()} cm³</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowRackDetails(false)}>Close</Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>

        {/* Shelf Details Dialog */}
        <Dialog.Root open={showShelfDetails} onOpenChange={setShowShelfDetails}>
          <Dialog.Content>
            <div className="flex justify-between items-center mb-4">
              <div>
                <Dialog.Title>Shelf Details</Dialog.Title>
                <Dialog.Description>
                  Detailed information about shelves in the warehouse.
                </Dialog.Description>
              </div>
              <Dialog.Close>
                <Button variant="ghost">
                  <X size={16} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="py-4">
              {detailsData && detailsData.type === 'shelf' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Shelf Usage Summary</h3>
                    <Badge variant="outline" className="bg-purple-50">
                      {detailsData.shelves.length} Shelves
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span>{detailsData.usage.totalVolume.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used for Boxes:</span>
                      <span>{detailsData.usage.usedForBoxes.toLocaleString()} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Volume:</span>
                      <span className="text-green-600">{detailsData.usage.remainingVolume.toLocaleString()} cm³</span>
                    </div>
                    <div>
                      <Flex justify="between" className="mb-1">
                        <span>Usage:</span>
                        <span>{detailsData.usage.usagePercentage.toFixed(2)}%</span>
                      </Flex>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-500 h-2.5 rounded-full"
                          style={{ width: `${Math.min(detailsData.usage.usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Shelf List</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {detailsData.shelves.map((shelf: any) => (
                        <div key={shelf.master_shelf_id} className="border rounded-md p-3">
                          <div className="font-medium">{shelf.master_shelf_name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex justify-between">
                              <span>ID:</span>
                              <span>{shelf.master_shelf_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rack:</span>
                              <span>{shelf.master_rack_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Width:</span>
                              <span>{shelf.width_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Length:</span>
                              <span>{shelf.length_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Height:</span>
                              <span>{shelf.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volume:</span>
                              <span>{(shelf.width_cm * shelf.length_cm * shelf.height_cm).toLocaleString()} cm³</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Boxes Stored:</span>
                              <span>{shelf.boxesStored || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowShelfDetails(false)}>Close</Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  );
};

export default WarehouseCalculation;
