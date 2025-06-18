export type TypeMsrackAll = {
    master_rack_id: string;
    master_rack_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_rack: number;
    description: string;
    master_zone_id: string;
};

export type TypeMsrack = {
    master_rack_id: string;
    master_rack_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_rack: number;
    description: string;
    master_zone_id: string;
};

export type MsrackResponse = {
    success: boolean;
    message: string;
    responseObject: TypeMsrack;
    statusCode: number;
};