export interface TypeMsshelfAll {
    master_shelf_id: string;
    master_shelf_name: string;
    shelf_level: number;
    height: number;
    length: number;
    width: number;
    cubic_centimeter_shelf: number;
    description: string;
    master_rack_id: string;
}

export interface TypeMsshelfResponse {
    success: boolean;
    message: string;
    responseObject: TypeMsshelfAll[] | null;
}

export interface TypeMsshelfSingleResponse {
    success: boolean;
    message: string;
    responseObject: TypeMsshelfAll | null;
}
