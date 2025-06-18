import { CREATE_CAL_BOX, DELETE_CAL_BOX, GET_CAL_BOX, UPDATE_CAL_BOX } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";
import { PayloadCreateCalBox, PayloadDeteleCalBox, PayloadUpdateCalBox } from "@/types/requests/request.cal_box";
import { CalBoxResponse } from "@/types/response/reponse.cal_box";

export const getCalBox = async (documentProductNo: any) => {
    const { data: response } = await mainApi.get(
        `${GET_CAL_BOX}/${documentProductNo}`,
    );
    return response;
};

export const postCalBox = async (data: PayloadCreateCalBox) => {
    const { data: response } = await mainApi.post<CalBoxResponse>(
        CREATE_CAL_BOX,
        data
    );
    return response;
};

export const patchCalBox = async (data: PayloadUpdateCalBox) => {
    const { data: response } = await mainApi.patch<CalBoxResponse>(
        UPDATE_CAL_BOX,
        data
    );
    return response;
};

export const deleteCalBox = async (params: PayloadDeteleCalBox) => {
    const { data: response } = await mainApi.delete<CalBoxResponse>(
        DELETE_CAL_BOX + "/" + params.cal_box_id
    );
    return response;
}