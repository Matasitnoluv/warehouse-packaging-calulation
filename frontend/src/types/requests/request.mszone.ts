export type PayloadCreateMSzone = {
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
};

export type PayloadUpdateMszone= {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
};

export type PayloadDeteleMszone = {
    master_zone_id: string;
};
