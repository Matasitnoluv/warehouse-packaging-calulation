export type TypeMswarehouseAll = {
    master_warehouse_id: string;
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number;
    description: string;
}

export type TypeMswarehouse = {
    master_warehouse_id: string;
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number;
    description: string;
}

export type MswarehouseResponse = {
    success: boolean;
    message: string;
    responseObject: TypeMswarehouse[] | [];
    statusCode: number;
};
