import { TypeCalBox } from "./reponse.cal_box";
import { TypeShelfBoxStorage } from "./reponse.msproduct";
import { TypeMsrack } from "./reponse.msrack";
import { TypeMsshelfAll } from "./reponse.msshelf";
import { TypeMszoneAll } from "./reponse.mszone";

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


export type TypeWarehouseCompile = TypeMswarehouse & {
  masterzone?: Array<
    TypeMszoneAll & {
      racks?: Array<
        TypeMsrack & {
          shelves?: Array<
            TypeMsshelfAll & {
              stored_boxes: (TypeShelfBoxStorage & { cal_box: TypeCalBox })[];
            }
          >;
        }
      >;
    }
  >;
};
