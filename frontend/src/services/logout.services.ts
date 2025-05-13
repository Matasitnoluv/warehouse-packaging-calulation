import mainApi from "@/apis/main.api";

export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
    const { data: response } = await mainApi.post("/v1/auth/logout", {}, {
        withCredentials: true,
    });
    return response;
}