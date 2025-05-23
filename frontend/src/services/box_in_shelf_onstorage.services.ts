import axios from "axios";
import { PayloadCreateBoxInShelfOnStorage, PayloadUpdateBoxInShelfOnStorage } from "../types/requests/request.box_in_shelf_onstorage";

const BASE_URL = import.meta.env.VITE_API_URL;

export const postBoxInShelfOnStorage = async (payload: PayloadCreateBoxInShelfOnStorage) => {
    try {
        const response = await axios.post(`${BASE_URL}/v1/box_in_shelf_onstorage/create`, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create box in shelf");
    }
};

export const getBoxInShelfOnStorage = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/v1/box_in_shelf_onstorage/get`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch boxes in shelf");
    }
};

export const getBoxInShelfOnStorageByShelfId = async (shelf_id: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/v1/box_in_shelf_onstorage/get/${shelf_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch box in shelf");
    }
};

export const updateBoxInShelfOnStorage = async (storage_id: string, payload: PayloadUpdateBoxInShelfOnStorage) => {
    try {
        const response = await axios.patch(`${BASE_URL}/v1/box_in_shelf_onstorage/update/${storage_id}`, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update box in shelf");
    }
};

export const deleteBoxInShelfOnStorage = async (storage_id: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/v1/box_in_shelf_onstorage/delete/${storage_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to delete box in shelf");
    }
};
