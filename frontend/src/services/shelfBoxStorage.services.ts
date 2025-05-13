import axios from "axios";
import { API_URL } from "../config";

// Define the payload type for storing a box in a shelf
export interface StoreBoxPayload {
  master_shelf_id: string;
  cal_box_id: string;
  stored_by?: string;
  position?: number;
  status?: string;
  cubic_centimeter_box: number;
  count: number;
  document_product_no: string;
}

// Get all stored boxes
export const getAllStoredBoxes = async () => {
  try {
    const response = await axios.get(`${API_URL}/v1/shelf_box_storage`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all stored boxes:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to fetch stored boxes",
    };
  }
};

// Get stored boxes by shelf ID
export const getStoredBoxesByShelfId = async (master_shelf_id: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/v1/shelf_box_storage/shelf/${master_shelf_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stored boxes by shelf ID:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to fetch stored boxes for the shelf",
    };
  }
};

// Get stored boxes by rack ID (fetches all shelves in the rack and their stored boxes)
export const getStoredBoxesByRackId = async (master_rack_id: string) => {
  try {
    // First get all shelves in the rack
    const shelvesResponse = await axios.get(`${API_URL}/v1/msshelf?master_rack_id=${master_rack_id}`);
    
    if (!shelvesResponse.data.success) {
      return {
        success: false,
        responseObject: [],
        message: "Failed to fetch shelves for the rack",
      };
    }
    
    const shelves = shelvesResponse.data.responseObject || [];
    
    // If no shelves, return empty array
    if (!Array.isArray(shelves) || shelves.length === 0) {
      return {
        success: true,
        responseObject: [],
        message: "No shelves found in this rack",
      };
    }
    
    // Get stored boxes for each shelf
    const storedBoxesPromises = shelves.map((shelf: any) => 
      getStoredBoxesByShelfId(shelf.master_shelf_id)
    );
    
    const storedBoxesResponses = await Promise.all(storedBoxesPromises);
    
    // Combine all stored boxes
    const allStoredBoxes = storedBoxesResponses.reduce((acc: any[], response: any) => {
      if (response.success && Array.isArray(response.responseObject)) {
        return [...acc, ...(response.responseObject)];
      }
      return acc;
    }, []);
    
    return {
      success: true,
      responseObject: allStoredBoxes,
      message: "Successfully fetched stored boxes for all shelves in the rack",
    };
  } catch (error) {
    console.error("Error fetching stored boxes by rack ID:", error);
    return {
      success: false,
      responseObject: [],
      message: "Failed to fetch stored boxes for the rack",
    };
  }
};

// Get stored boxes by document number
export const getStoredBoxesByDocumentNo = async (document_product_no: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/v1/shelf_box_storage/document/${document_product_no}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stored boxes by document number:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to fetch stored boxes for the document",
    };
  }
};

// Store a box in a shelf
export const storeBoxInShelf = async (payload: StoreBoxPayload) => {
  try {
    const response = await axios.post(`${API_URL}/v1/shelf_box_storage`, payload);
    return response.data;
  } catch (error) {
    console.error("Error storing box in shelf:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to store box in shelf",
    };
  }
};

// Store multiple boxes in a shelf
export const storeMultipleBoxesInShelf = async (payload: StoreBoxPayload[]) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/shelf_box_storage/store-multiple`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error storing multiple boxes in shelf:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to store multiple boxes in shelf",
    };
  }
};

// Update a stored box
export const updateStoredBox = async (storage_id: string, payload: Partial<StoreBoxPayload>) => {
  try {
    const response = await axios.put(
      `${API_URL}/v1/shelf_box_storage/${storage_id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating stored box:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to update stored box",
    };
  }
};

// Delete a stored box
export const deleteStoredBox = async (storage_id: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/v1/shelf_box_storage/${storage_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting stored box:", error);
    return {
      success: false,
      responseObject: null,
      message: "Failed to delete stored box",
    };
  }
};

// Export all functions as a service object
export const shelfBoxStorageService = {
  getAllStoredBoxes,
  getStoredBoxesByShelfId,
  getStoredBoxesByRackId,
  getStoredBoxesByDocumentNo,
  storeBoxInShelf,
  storeMultipleBoxesInShelf,
  updateStoredBox,
  deleteStoredBox,
};
