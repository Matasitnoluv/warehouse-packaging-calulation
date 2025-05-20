export type TypeMsboxAll = {
    master_box_id: string;
    master_box_name: string;
    code_box: string;
    scale_box: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_box: number;
    description?: string;
    image_path?: string;
}

export type TypeMsbox = {
    master_box_id: string;
    master_box_name: string;
    code_box: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_box: number;
    description: string;
    image_path: string;
}

export type MsboxResponse = {
    success: boolean;
    message: string;
    responseObject: TypeMsbox;
    statusCode: number;
};
