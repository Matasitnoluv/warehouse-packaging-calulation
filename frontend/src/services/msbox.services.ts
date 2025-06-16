import { CREATE_MSBOX, GET_MSBOX, UPDATE_MSBOX, DELETE_MSBOX } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";
import { PayloadDeteleMsbox } from "@/types/requests/request.msbox";
import { MsboxResponse } from '@/types/response/reponse.msbox';

export const getMsbox = async (): Promise<MsboxResponse> => {
    const { data: response } = await mainApi.get(
        GET_MSBOX
    );
    return response;
};

export const postMsbox = async (formData: FormData) => {
    const { data: response } = await mainApi.post<MsboxResponse>(
        CREATE_MSBOX,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response;
};

export const patchMsbox = async (formData: FormData) => {
    const { data: response } = await mainApi.patch<MsboxResponse>(
        UPDATE_MSBOX,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response;
};

export const deleteBox = async (params: PayloadDeteleMsbox) => {
    const { data: response } = await mainApi.delete<MsboxResponse>(
        DELETE_MSBOX + "/" + params.master_box_id
    );
    return response;
}

export const getBoxes = () => mainApi.get("/v1/msbox");

