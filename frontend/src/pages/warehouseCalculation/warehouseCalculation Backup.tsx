import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { getMswarehouse } from "@/services/mswarehouse.services";
import { getMszone } from "@/services/mszone.services";
import { getMsrack } from "@/services/msrack.services";
import { getMsshelf, getMsshelfByZone } from "@/services/msshelf.services";
import { getCalBox } from "@/services/calbox.services";
import { getCalMsproduct } from "@/services/calmsproduct.services";
import { shelfBoxStorageService, StoreBoxPayload as ShelfStoreBoxPayload } from "@/services/shelfBoxStorage.services";
import ZoneDocumentSelector from "./components/ZoneDocumentSelector";
import { getCalWarehouse } from "@/services/calwarehouse.services";
import ErrorWareHouse from "./components/ErrorWareHouse";
import { ApiResponse, BoxFitResult, DocumentTypeCalculate, BoxPlacement, BoxType, CalculateSummary, RackBoxStorage, RackSpaceSummary, RackType, ShelfStoredBoxType, ShelfType, ShelfWithFitBoxes, StoredBoxType, WarehouseType, ZoneType, DocumentWarehouseType } from "./type";
import DialogCaulate from "./components/dialogCaulate";
import BoxShow from "./components/BoxShow";
import { TypeShelfBoxStorage } from "@/types/response/reponse.msproduct copy";
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

const WarehouseCalculation = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  ;
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
  const [documents, setDocuments] = useState<DocumentTypeCalculate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const [boxFitResults, setBoxFitResults] = useState<BoxFitResult[]>([]);
  const [rackSpaceSummary, setRackSpaceSummary] = useState<RackSpaceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedBoxes, setStoredBoxes] = useState<StoredBoxType[]>([]);
  const [shelfStoredBoxes, setShelfStoredBoxes] = useState<ShelfStoredBoxType[]>([]);
  const [allStoredBoxes, setAllStoredBoxes] = useState<RackBoxStorage[]>([]);
  // const [shelfFitData, setShelfFitData] = useState<ShelfWithFitBoxes[]>([]);

  const [warehouseRecords, setWarehouseRecords] = useState<DocumentWarehouseType[]>([]);
  const [showWarehouseTable, setShowWarehouseTable] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DocumentWarehouseType | null>(null);

  // เพิ่ม state variables สำหรับ auto assign
  const [autoAssignToOtherShelves, setAutoAssignToOtherShelves] = useState(false);
  const [autoAssignPreview, setAutoAssignPreview] = useState<any>(null);
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [calculateSummary, setCalculateSummary] = useState<CalculateSummary | null>(null);

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
  const fetchDocuments = async () => {
    try {
      const response = await getCalMsproduct() as ApiResponse<DocumentTypeCalculate[]>;
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

  const fetchWarehouseRecords = async () => {
    try {
      const response = await getCalWarehouse() as ApiResponse<DocumentWarehouseType[]>;
      if (response.success) {
        setWarehouseRecords(response.responseObject || []);
      }
    } catch (error) {
      console.error('Error fetching warehouse records:', error);
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
      const shelfBoxStorageData = await shelfBoxStorageService.getStoredWareHouseDocumentNo(documentWarehouseNo);
      console.log('shelfBoxStorageData', shelfBoxStorageData.responseObject, '/', shelves)
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
  // Fetch warehouse records
  useEffect(() => {
    fetchDocuments();
    fetchWarehouseRecords();
  }, []);



  // Fetch warehouse data


  // Fetch zones for the selected warehouse
  useEffect(() => {
    fetchZones();
    fetchWarehouseData()
  }, [warehouseId]);


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

  // Fetch racks when a zone is selected
  useEffect(() => {
    fetchRacks();
  }, [selectedZone]);

  // Fetch shelves when a rack is selected
  useEffect(() => {
    fetchShelfStoredBoxes();
  }, [selectedShelf]);

  useEffect(() => {
    fetchShelves();
    fetchStoredBoxes();
  }, [selectedRack]);

  // Track all stored boxes across all racks to filter out completed documents
  useEffect(() => {
    fetchAllStoredBoxes();
  }, [storedBoxes]);

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

  const handleTest = async () => {
    const response = await getMsshelfByZone(selectedZone);
    console.log("response", response);
  }

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
      console.log("boxesResponse", boxesResponse);
      if (!boxesResponse.success) throw new Error("Failed to fetch boxes");
      const boxes = boxesResponse.responseObject || [];

      if (boxes.length === 0) {
        setError("No boxes found for this document");
        setShowCalculateDialog(false);
        setLoading(false);
        return;
      }


      const shelfBoxStorageData = await shelfBoxStorageService.getStoredWareHouseDocumentNo(documentWarehouseNo);
      const storedBoxes = shelfBoxStorageData.responseObject || [];
      const storedCalBoxIds = storedBoxes.map((box: TypeShelfBoxStorage) => box.cal_box.cal_box_id);


      const newBoxes = boxes.filter((box: TypeShelfBoxStorage) => !storedCalBoxIds.includes(box.cal_box_id));
      const normalizedStoredBoxes = storedBoxes
        .sort((a: TypeShelfBoxStorage, b: TypeShelfBoxStorage) => new Date(a.stored_date ?? new Date()).getTime() - new Date(b.stored_date ?? new Date()).getTime())
        .map((box: TypeShelfBoxStorage) => ({
          cal_box_id: box.cal_box_id,
          cal_box: box,
          count: box.count,
          cubic_centimeter_box: box.cal_box.cubic_centimeter_box,
          document_product_no: box.cal_box.document_product_no,
          box_no: box.cal_box.box_no
        }));
      console.log("normalizedStoredBoxes", normalizedStoredBoxes);
      // Calculate placements
      const formattedNewBoxes = newBoxes.map((box: TypeShelfBoxStorage) => ({
        cal_box_id: box.cal_box_id,
        cal_box: box,
        count: box.count,
        cubic_centimeter_box: box.cubic_centimeter_box,
        document_product_no: box.document_product_no,
        box_no: box.box_no
      }));

      const allBoxesToCalculate = Array.from(
        new Map(
          [...normalizedStoredBoxes, ...formattedNewBoxes].map((box: TypeShelfBoxStorage) => [box.cal_box_id, box])
        ).values()
      );
      console.log("allBoxesToCalculate", allBoxesToCalculate);
      // ส่งทั้งหมดไปคำนวณ
      const placements = calculateBoxPlacement(allBoxesToCalculate as unknown as BoxType[], racks, allShelves);



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



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorWareHouse title="Error" message={error} />
    );
  }

  if (!warehouse) {
    return (<ErrorWareHouse title="Warehouse Not Found" message="The requested warehouse could not be found." />)

  }

  return (
    <div className="p-4">
      {/* Calculate Dialog */}
      <DialogCaulate documentWarehouseNo={documentWarehouseNo} showCalculateDialog={showCalculateDialog} setShowCalculateDialog={setShowCalculateDialog}
        calculateSummary={calculateSummary}
        zones={zones}
      />

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">
        {/* Show selected warehouse name if available */}
        {warehouseName && <BoxShow label={"Selected Warehouse"} input={warehouseName} />}

        {/* Divider */}
        <hr className="my-4 border-gray-200" />
        {/* Selected Document Warehouse No */}
        <BoxShow label={"Selected Document Warehouse No"} input={documentWarehouseNo || <span className="text-gray-400">No document selected</span>} />

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
  );
};




export default WarehouseCalculation;