import { CREATE_MSWAREHOUSE, GET_MSWAREHOUSE, GET_MSWAREHOUSE_USAGE, UPDATE_MSWAREHOUSE, DELETE_MSWAREHOUSE } from "@/apis/endpoint.api";
import { PayloadCreateMasterwarehouse, PayloadUpdateMswarehouse, PayloadDeteleMswarehouse } from "@/types/requests/request.mswarehouse";
import { MswarehouseResponse } from "@/types/response/reponse.mswarehouse";
import mainApi from "@/apis/main.api";

export const getMswarehouse = async () => {
    try {
        const { data: response } = await mainApi.get(
            GET_MSWAREHOUSE
        );
        return response;
    } catch (error) {
        console.error('Error in getMswarehouse:', error);
        return {
            status: 'Failed',
            message: 'Failed to fetch warehouse data',
            data: []
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