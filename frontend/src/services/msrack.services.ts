import { GET_MSRACK, CREATE_MSRACK, UPDATE_MSRACK, DELETE_MSRACK } from "@/apis/endpoint.api";
import { MsrackResponse, TypeMsrack } from "@/types/response/reponse.msrack";
import mainApi from "@/apis/main.api";
import { ApiResponse } from "@/pages/warehouseCalculation/type";

export type CreateRackPayload = {
    master_rack_id: string;
    master_rack_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_rack: number;
    description: string;
    master_zone_id: string;
};

export type UpdateRackPayload = {
    master_rack_id: string;
    master_rack_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_rack: number;
    description: string;
    master_zone_id: string;
};

// Get racks, optionally filtered by zone ID
export const getMsrack = async (master_zone_id?: string): Promise<ApiResponse<TypeMsrack[]>> => {
    const params = master_zone_id ? { master_zone_id } : {};
    const { data: response } = await mainApi.get(
        GET_MSRACK,
        { params }
    );
    return response;
};

// Create a new rack
export const createMsrack = async (data: CreateRackPayload) => {
    const { data: response } = await mainApi.post<MsrackResponse>(
        CREATE_MSRACK,
        data
    );
    return response;
};

// Update an existing rack
export const updateMsrack = async (data: UpdateRackPayload) => {
    const { data: response } = await mainApi.patch<MsrackResponse>(
        UPDATE_MSRACK,
        data
    );
    return response;
};

// Delete a rack by ID
export const deleteMsrack = async (master_rack_id: string) => {
    const { data: response } = await mainApi.delete<MsrackResponse>(
        `${DELETE_MSRACK}/${master_rack_id}`
    );
    return response;
};