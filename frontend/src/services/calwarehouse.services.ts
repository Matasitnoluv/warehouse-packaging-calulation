import { GET_CAL_WAREHOUSE, CREATE_CAL_WAREHOUSE, UPDATE_CAL_WAREHOUSE, DELETE_CAL_WAREHOUSE } from "@/apis/endpoint.api";
import { PayloadCreateCal_Warehouse, PayloadUpdateCal_Warehouse, PayloadDeleteCal_Warehouse } from "@/types/requests/request.cal_warehouse";
import mainApi from "@/apis/main.api";
import { CalWarehouseResponse } from "@/types/response/reponse.cal_warehouse";

export const getCalWarehouse = async (): Promise<CalWarehouseResponse> => {
    const { data: response } = await mainApi.get(
        GET_CAL_WAREHOUSE,
    );
    return response;
};

export const getCalWarehouseByMasterWarehouseId = async (master_warehouse_id: string): Promise<CalWarehouseResponse> => {
    const { data: response } = await mainApi.get(
        GET_CAL_WAREHOUSE + "/" + master_warehouse_id
    );
    return response;
};

export const getCalWarehouseByDocumentWarehouseNo = async (document_warehouse_no: string): Promise<CalWarehouseResponse> => {
    const { data: response } = await mainApi.get(
        GET_CAL_WAREHOUSE + "/" + document_warehouse_no
    );
    return response;
};


export const postCalWarehouse = async (payload: PayloadCreateCal_Warehouse) => {
    const { data: response } = await mainApi.post<CalWarehouseResponse>(
        CREATE_CAL_WAREHOUSE,
        payload
    );
    return response;
};

export const patchCalWarehouse = async (payload: PayloadUpdateCal_Warehouse) => {
    const { data: response } = await mainApi.patch<CalWarehouseResponse>(
        UPDATE_CAL_WAREHOUSE,
        payload
    );
    return response;
};

export const deleteCalWarehouse = async (payload: PayloadDeleteCal_Warehouse) => {
    const { data: response } = await mainApi.delete<CalWarehouseResponse>(
        DELETE_CAL_WAREHOUSE + "/" + payload.document_warehouse_id
    );
    return response;
};
