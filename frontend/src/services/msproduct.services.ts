import { CREATE_MSPRODUCT, GET_MSPRODUCT, UPDARE_MSPRODUCT, DELETE_MSPRODUCT } from "@/apis/endpoint.api";
import { PayloadDeteleMsproduct } from "@/types/requests/request.msproduct";
import { MsproductResponse } from "@/types/response/reponse.msproduct";
import mainApi from "@/apis/main.api";

export const getMsproduct = async () => {
    const { data: response } = await mainApi.get(
        GET_MSPRODUCT
    );
    return response;
};

export const postMsproduct = async (formData: FormData) => {
    const { data: response } = await mainApi.post<MsproductResponse>(
        CREATE_MSPRODUCT,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response;
};

export const patchMsproduct = async (formData: FormData) => {
    const { data: response } = await mainApi.patch<MsproductResponse>(
        UPDARE_MSPRODUCT,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response;
};


export const deleteProduct = async (params: PayloadDeteleMsproduct) => {
    const { data: response } = await mainApi.delete<MsproductResponse>(
        DELETE_MSPRODUCT + "/" + params.master_product_id
    );
    return response;
}

