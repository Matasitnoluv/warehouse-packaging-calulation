import { API_ENDPOINTS } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";

export interface RackBoxStorage {
  storage_id: string;
  master_rack_id: string;
  cal_box_id: string;
  stored_date: string;
  stored_by?: string;
  position?: number;
  status: string;
  // Volume information
  cubic_centimeter_box?: number;
  count?: number;
  total_volume?: number;
  document_product_no?: string;
  // Box properties from join
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

export interface StoreBoxPayload {
  master_rack_id: string;
  cal_box_id: string;
  stored_by?: string;
  position?: number;
  // Added volume information
  cubic_centimeter_box?: number;
  count?: number;
  total_volume?: number;
  // Document information
  document_product_no?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}

export const rackBoxStorageService = {
  // Get all stored boxes
  getAllStoredBoxes: async (): Promise<ServiceResponse<RackBoxStorage[]>> => {
    try {
      const { data: response } = await mainApi.get(API_ENDPOINTS.RACK_BOX_STORAGE.GET_ALL);
      return {
        success: true,
        message: "Successfully fetched all stored boxes",
        responseObject: Array.isArray(response) ? response : [],
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching all stored boxes:", error);
      return {
        success: false,
        message: "Failed to fetch all stored boxes",
        responseObject: [],
        statusCode: 500
      };
    }
  },

  // Get boxes stored in a specific rack
  getStoredBoxesByRackId: async (master_rack_id: string): Promise<ServiceResponse<RackBoxStorage[]>> => {
    try {
      const { data: response } = await mainApi.get(
        API_ENDPOINTS.RACK_BOX_STORAGE.GET_BY_RACK_ID.replace(":master_rack_id", master_rack_id)
      );

      // Log the raw response for debugging
      //console.log("Raw response from backend:", response);

      // Check if the response is an object with a responseObject property (API wrapper)
      let responseArray: RackBoxStorage[] = [];

      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          // Direct array response
          responseArray = response;
        } else if (response.responseObject && Array.isArray(response.responseObject)) {
          // Wrapped in responseObject
          responseArray = response.responseObject;
        }
      }

      //console.log("Processed response array:", responseArray);

      return {
        success: true,
        message: `Successfully fetched stored boxes for rack ${master_rack_id}`,
        responseObject: responseArray,
        statusCode: 200
      };
    } catch (error) {
      console.error(`Error fetching stored boxes for rack ${master_rack_id}:`, error);
      return {
        success: false,
        message: `Failed to fetch stored boxes for rack ${master_rack_id}`,
        responseObject: [],
        statusCode: 500
      };
    }
  },

  // Store a box in a rack
  storeBox: async (payload: StoreBoxPayload): Promise<ServiceResponse<RackBoxStorage | null>> => {
    try {
      const { data: response } = await mainApi.post(API_ENDPOINTS.RACK_BOX_STORAGE.STORE, payload);
      return {
        success: true,
        message: "Successfully stored box in rack",
        responseObject: response || null,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error storing box in rack:", error);
      return {
        success: false,
        message: "Failed to store box in rack",
        responseObject: null,
        statusCode: 500
      };
    }
  },

  // Store multiple boxes in a rack
  storeMultipleBoxes: async (payloads: StoreBoxPayload[]): Promise<ServiceResponse<any[]>> => {
    try {
      // Process boxes sequentially to avoid race conditions
      const results = [];
      for (const payload of payloads) {
        try {
          const { data: response } = await mainApi.post(
            API_ENDPOINTS.RACK_BOX_STORAGE.STORE,
            payload
          );
          results.push({
            success: true,
            data: response,
            cal_box_id: payload.cal_box_id
          });
        } catch (error: any) {
          results.push({
            success: false,
            error: error.response?.data?.message || "Failed to store box",
            cal_box_id: payload.cal_box_id
          });
        }
      }
      return {
        success: true,
        message: "Successfully stored multiple boxes in rack",
        responseObject: results,
        statusCode: 201
      };
    } catch (error) {
      console.error("Error in bulk store operation:", error);
      return {
        success: false,
        message: "Failed to store multiple boxes in rack",
        responseObject: [],
        statusCode: 500
      };
    }
  },

  // Update a stored box (change status or position)
  updateStoredBox: async (storage_id: string, payload: { status?: string; position?: number }): Promise<ServiceResponse<RackBoxStorage | null>> => {
    try {
      const { data: response } = await mainApi.put(
        API_ENDPOINTS.RACK_BOX_STORAGE.UPDATE.replace(":storage_id", storage_id),
        payload
      );
      return {
        success: true,
        message: `Successfully updated stored box ${storage_id}`,
        responseObject: response || null,
        statusCode: 200
      };
    } catch (error: any) {
      console.error(`Error updating stored box ${storage_id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to update stored box ${storage_id}`,
        responseObject: null,
        statusCode: error.response?.status || 500
      };
    }
  },

  // Remove a box from a rack
  removeStoredBox: async (storage_id: string): Promise<ServiceResponse<RackBoxStorage | null>> => {
    try {
      const { data: response } = await mainApi.delete(
        API_ENDPOINTS.RACK_BOX_STORAGE.DELETE.replace(":storage_id", storage_id)
      );
      return {
        success: true,
        message: `Successfully removed stored box ${storage_id}`,
        responseObject: response || null,
        statusCode: 200
      };
    } catch (error: any) {
      console.error(`Error removing stored box ${storage_id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || `Failed to remove stored box ${storage_id}`,
        responseObject: null,
        statusCode: error.response?.status || 500
      };
    }
  },

  // Find alternative racks that can fit a box
  findAlternativeRacks: async (cal_box_id: string, warehouse_id: string): Promise<ServiceResponse<any[]>> => {
    try {
      // Get the box details
      const { data: boxResponse } = await mainApi.get(
        `${API_ENDPOINTS.CAL_BOX.GET}/${cal_box_id}`
      );
      const box = boxResponse.data;

      if (!box || !box.cubic_centimeter_box || !box.count) {
        return {
          success: false,
          message: "Box not found or has no volume information",
          responseObject: [],
          statusCode: 404
        };
      }

      // Get all racks in the warehouse
      const { data: racksResponse } = await mainApi.get(
        `${API_ENDPOINTS.MSRACK.GET}?warehouse_id=${warehouse_id}`
      );
      const racks = racksResponse.data;

      if (!racks || racks.length === 0) {
        return {
          success: true,
          message: "No racks found in the warehouse",
          responseObject: [],
          statusCode: 200
        };
      }

      const boxVolume = box.cubic_centimeter_box * box.count;
      const availableRacks = [];

      // Check each rack for available space
      for (const rack of racks) {
        if (!rack.cubic_centimeter_rack) continue;

        try {
          // Get stored boxes for this rack
          const storedBoxesResponse = await rackBoxStorageService.getStoredBoxesByRackId(rack.master_rack_id);
          const storedBoxes = storedBoxesResponse.responseObject || [];

          // Calculate used volume
          let usedVolume = 0;
          for (const storedBox of storedBoxes) {
            if (storedBox.box?.cubic_centimeter_box && storedBox.box?.count) {
              usedVolume += storedBox.box.cubic_centimeter_box * storedBox.box.count;
            }
          }

          // Check if the rack has enough space
          const availableVolume = rack.cubic_centimeter_rack - usedVolume;
          if (availableVolume >= boxVolume) {
            availableRacks.push({
              ...rack,
              available_volume: availableVolume,
              used_volume: usedVolume
            });
          }
        } catch (error) {
          console.error(`Error checking space in rack ${rack.master_rack_id}:`, error);
          // Continue to next rack
        }
      }

      // Sort racks by available space (most space first)
      const sortedRacks = availableRacks.sort((a, b) => b.available_volume - a.available_volume);
      return {
        success: true,
        message: "Successfully found alternative racks",
        responseObject: sortedRacks,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error finding alternative racks:", error);
      return {
        success: false,
        message: "Failed to find alternative racks",
        responseObject: [],
        statusCode: 500
      };
    }
  }
};

// Backward compatibility functions
export const getRackBoxStorageByRack = rackBoxStorageService.getStoredBoxesByRackId;
export const storeBoxInRack = rackBoxStorageService.storeBox;
