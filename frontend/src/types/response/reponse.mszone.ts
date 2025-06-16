export type TypeMszoneAll = {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string;
};

export type TypeMszone = {
    master_zone_id: string;
    master_zone_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_zone: number;
    description: string;
    master_warehouse_id: string;
};

export type MszoneResponse = {
    success: boolean;
    message: string;
    responseObject: TypeMszone[];
    statusCode: number;
};