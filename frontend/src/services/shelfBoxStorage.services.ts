import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
const API_PATH = "/api";

export const shelfBoxStorageService = {
    // Get all shelf box storage
    getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/${API_PATH}/shelf-box-storage`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get shelf box storage by ID
    getById: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/${API_PATH}/shelf-box-storage/${id}`);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching shelf box storage by ID:", error);
            throw error;
        }
    },

    // Create new shelf box storage
    create: async (data: any) => {
        try {
            const response = await axios.post(`${API_URL}${API_PATH}/shelf-box-storage`, data);
            return response.data;
        } catch (error: any) {
            console.error("Error creating shelf box storage:", error);
            throw error;
        }
    },

    // Update shelf box storage
    update: async (id: string, data: any) => {
        try {
            const response = await axios.put(`${API_URL}${API_PATH}/shelf-box-storage/${id}`, data);
            return response.data;
        } catch (error: any) {
            console.error("Error updating shelf box storage:", error);
            throw error;
        }
    },

    // Delete shelf box storage
    delete: async (id: string) => {
        try {
            const response = await axios.delete(`${API_URL}${API_PATH}/shelf-box-storage/${id}`);
            return response.data;
        } catch (error: any) {
            console.error("Error deleting shelf box storage:", error);
            throw error;
        }
    },

    // Get shelf box storage by shelf ID
    getByShelfId: async (shelfId: string) => {
        try {
            const response = await axios.get(`${API_URL}/shelf-box-storage/shelf/${shelfId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get shelf box storage by box ID
    getByBoxId: async (boxId: string) => {
        try {
            const response = await axios.get(`${API_URL}${API_PATH}/shelf-box-storage/box/${boxId}`);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching shelf box storage by box ID:", error);
            throw error;
        }
    },

    // Get all stored boxes
    getAllStoredBoxes: async () => {
        try {
            const response = await axios.get(`${API_URL}/shelf-box-storage`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get stored boxes by shelf ID
    getStoredBoxesByShelfId: async (shelfId: string) => {
        try {
            const response = await axios.get(`${API_URL}/shelf-box-storage/shelf/${shelfId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get stored boxes by rack ID
    getStoredBoxesByRackId: async (rackId: string) => {
        try {
            const response = await axios.get(`${API_URL}${API_PATH}/shelf-box-storage/rack/${rackId}`);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching shelf box storage by rack ID:", error);
            throw error;
        }
    },

    // Store multiple boxes in a shelf
    storeMultipleBoxesInShelf: async (payload: any[]) => {
        try {
            const response = await axios.post(`${API_URL}/shelf-box-storage/bulk`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}; 