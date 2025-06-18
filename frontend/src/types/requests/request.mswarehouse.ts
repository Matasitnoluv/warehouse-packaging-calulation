export type PayloadCreateMasterwarehouse = {
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number;
    description: string;
};

export type PayloadUpdateMswarehouse = {
    master_warehouse_id: string;
    master_warehouse_name: string;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_warehouse: number;
    description: string;
};

export type PayloadDeteleMswarehouse = {
    master_warehouse_id: string;
};
