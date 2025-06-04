import axios from "axios";
import { API_URL } from "../config";

// Type for shelf creation/update payload
export interface MsshelfPayload {
    master_shelf_id?: string;
    master_shelf_name: string;
    shelf_level: number;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_shelf: number;
    description?: string;
    master_rack_id: string;
}

// Get all shelves by rack ID
export const getMsshelf = async (master_rack_id?: string) => {
    try {
        const url = master_rack_id
            ? `${API_URL}/v1/msshelf?master_rack_id=${master_rack_id}`
            : `${API_URL}/v1/msshelf`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching shelves:", error);
        return {
            success: false,
            message: "Failed to fetch shelves",
            responseObject: null
        };
    }
};


export const getMsshelfByZone = async (master_zone_id?: string) => {
    try {
        const url = master_zone_id
            ? `${API_URL}/v1/msshelf?master_zone_id=${master_zone_id}`
            : `${API_URL}/v1/msshelf`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching shelves:", error);
        return {
            success: false,
            message: "Failed to fetch shelves",
            responseObject: null
        };
    }
};






// Get shelf by ID
export const getMsshelfById = async (master_shelf_id: string) => {
    try {
        const response = await axios.get(`${API_URL}/v1/msshelf/${master_shelf_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching shelf:", error);
        return {
            success: false,
            message: "Failed to fetch shelf",
            responseObject: null
        };
    }
};

// Create new shelf
export const createMsshelf = async (payload: MsshelfPayload) => {
    try {
        const response = await axios.post(`${API_URL}/v1/msshelf`, payload);
        return response.data;
    } catch (error) {
        console.error("Error creating shelf:", error);
        return {
            success: false,
            message: "Failed to create shelf",
            responseObject: null
        };
    }
};

// Update shelf
export const updateMsshelf = async (payload: MsshelfPayload) => {
    try {
        const response = await axios.put(`${API_URL}/v1/msshelf`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating shelf:", error);
        return {
            success: false,
            message: "Failed to update shelf",
            responseObject: null
        };
    }
};

// Delete shelf
export const deleteMsshelf = async (master_shelf_id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/v1/msshelf/${master_shelf_id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting shelf:", error);
        return {
            success: false,
            message: "Failed to delete shelf",
            responseObject: null
        };
    }
};
