export type PayloadCreateMasterbox = {
    master_box_name: string;
    code_box: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_box: number;
    description: string;
    image_path: string;
};

export type PayloadUpdateMsbox = {
    master_box_id: string;
    master_box_name: string;
    code_box: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_box: number;
    description: string;
    image_path: string;
};

export type PayloadDeteleMsbox = {
    master_box_id: string;
};
