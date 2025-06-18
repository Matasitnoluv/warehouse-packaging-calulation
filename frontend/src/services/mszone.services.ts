import { GET_MSZONE, CREATE_MSZONE, UPDATE_MSZONE, DELETE_MSZONE } from "@/apis/endpoint.api";
import { MszoneResponse } from "@/types/response/reponse.mszone";
import mainApi from "@/apis/main.api";

export type CreateZonePayload = {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string;
};

export type UpdateZonePayload = {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string;
};

// Get zones, optionally filtered by warehouse ID
export const getMszone = async (master_warehouse_id?: string): Promise<MszoneResponse> => {
    const params = master_warehouse_id ? { master_warehouse_id } : {};
    const { data: response } = await mainApi.get(
        GET_MSZONE,
        { params }
    );
    return response;
};

// Create a new zone
export const createMszone = async (data: CreateZonePayload) => {
    const { data: response } = await mainApi.post<MszoneResponse>(
        CREATE_MSZONE,
        data
    );
    return response;
};

// Update an existing zone
export const updateMszone = async (data: UpdateZonePayload) => {
    const { data: response } = await mainApi.patch<MszoneResponse>(
        UPDATE_MSZONE,
        data
    );
    return response;
};

// Delete a zone by ID
export const deleteMszone = async (master_zone_id: string) => {
    const { data: response } = await mainApi.delete<MszoneResponse>(
        `${DELETE_MSZONE}/${master_zone_id}`
    );
    return response;
};
