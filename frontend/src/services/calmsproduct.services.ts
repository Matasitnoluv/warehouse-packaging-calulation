import { CREATE_CAL_MSPRODUCT, UPDATE_CAL_MSPRODUCT, DELETE_CAL_MSPRODUCT, GET_CAL_MSPRODUCT } from "@/apis/endpoint.api";
import { PayloadCreateCalMasterproduct, PayloadUpdateCalMsproduct, PayloadDeteleCalMsproduct } from "@/types/requests/request.cal_msproduct";
import { CalMsproductResponse } from "@/types/response/reponse.cal_msproduct";
import mainApi from "@/apis/main.api";

export const getCalMsproduct = async () => {
    const { data: response } = await mainApi.get(
        GET_CAL_MSPRODUCT,
    );
    return response;
};

export const getCalMsproductByType = async (type: "single" | "mixed") => {
    const { data: response } = await mainApi.get(
        GET_CAL_MSPRODUCT,
    );

    // Filter the response objects by document_product_no prefix
    if (response && response.responseObject && Array.isArray(response.responseObject)) {
        const filteredResponse = {
            ...response,
            responseObject: response.responseObject.filter((item: { document_product_no: string; }) => {
                if (type === "single") {
                    // Only include SBox for single type
                    return item.document_product_no.startsWith("(SBox");
                } else if (type === "mixed") {
                    // Only include MBox for mixed type
                    return item.document_product_no.startsWith("(MBox");
                }
                return false;
            })
        };
        return filteredResponse;
    }

    return response;
};

export const postCalMsproduct = async (data: PayloadCreateCalMasterproduct) => {
    const { data: response } = await mainApi.post<CalMsproductResponse>(
        CREATE_CAL_MSPRODUCT,
        data
    );
    return response;
};

export const patchCalMsproduct = async (data: PayloadUpdateCalMsproduct) => {
    const { data: response } = await mainApi.patch<CalMsproductResponse>(
        UPDATE_CAL_MSPRODUCT,
        data
    );
    return response;
};

export const deleteCalProduct = async (params: PayloadDeteleCalMsproduct) => {
    const { data: response } = await mainApi.delete<CalMsproductResponse>(
        DELETE_CAL_MSPRODUCT + "/" + params.document_product_id
    );
    return response;
};