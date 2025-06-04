import { CREATE_MSWAREHOUSE, GET_MSWAREHOUSE, GET_MSWAREHOUSE_USAGE, UPDATE_MSWAREHOUSE, DELETE_MSWAREHOUSE } from "@/apis/endpoint.api";
import { PayloadCreateMasterwarehouse, PayloadUpdateMswarehouse, PayloadDeteleMswarehouse } from "@/types/requests/request.mswarehouse";
import { MswarehouseResponse } from "@/types/response/reponse.mswarehouse";
import mainApi from "@/apis/main.api";

export const getMswarehouse = async (): Promise<MswarehouseResponse> => {
    try {
        //console.log("Fetching warehouse data..."); // Debug log
        const response = await mainApi.get(GET_MSWAREHOUSE);
        //console.log("Warehouse API raw response:", response); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error in getMswarehouse:', error);
        return {
            success: false,
            statusCode: 500,
            message: 'Failed to fetch warehouse data',
            responseObject: []
        };
    }
};

export const postMswarehouse = async (payload: PayloadCreateMasterwarehouse) => {
    const { data: response } = await mainApi.post(
        CREATE_MSWAREHOUSE,
        payload
    );
    return response;
};

export const patchMswarehouse = async (data: PayloadUpdateMswarehouse) => {
    const { data: response } = await mainApi.patch<MswarehouseResponse>(
        UPDATE_MSWAREHOUSE,
        data
    );
    return response;
};

export const deleteMswarehouse = async (params: PayloadDeteleMswarehouse) => {
    const { data: response } = await mainApi.delete<MswarehouseResponse>(
        DELETE_MSWAREHOUSE + "/" + params.master_warehouse_id,
    );
    return response;
};

// ดึงข้อมูลการใช้พื้นที่ของ warehouse ทั้งหมด
export const getMswarehouseUsage = async () => {
    try {
        const { data: response } = await mainApi.get(
            GET_MSWAREHOUSE_USAGE
        );
        return response;
    } catch (error) {
        console.error("Error fetching warehouse usage:", error);
        return {
            success: false,
            message: "Failed to fetch warehouse usage data",
            responseObject: [],
            statusCode: 500
        };
    }
};

export const getMswarehouseById = async (master_warehouse_id: string): Promise<MswarehouseResponse> => {
    const { data: response } = await mainApi.get(
        GET_MSWAREHOUSE + "/" + master_warehouse_id
    );
    return response;
};
