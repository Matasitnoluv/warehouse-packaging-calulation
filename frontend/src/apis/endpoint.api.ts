export const GET_CATGORY_ALL = "/v1/category/get";
export const CREATE_CATGORY = "/v1/category/create";
export const UPDATE_CATGORY = "/v1/category/update";
export const DELETE_CATGORY = "/v1/category/delete";
// masterproduct
export const GET_MSPRODUCT = "/v1/msproduct/get";
export const CREATE_MSPRODUCT = "/v1/msproduct/create";
export const UPDARE_MSPRODUCT = "/v1/msproduct/update";
export const DELETE_MSPRODUCT = "/v1/msproduct/delete";
// masterbox
export const GET_MSBOX = "/v1/msbox/get";
export const CREATE_MSBOX = "/v1/msbox/create";
export const UPDATE_MSBOX = "/v1/msbox/update";
export const DELETE_MSBOX = "/v1/msbox/delete";
//masterwarehouse
export const GET_MSWAREHOUSE = "/v1/mswarehouse/get";
export const GET_MSWAREHOUSE_USAGE = "/v1/mswarehouse/usage";
export const CREATE_MSWAREHOUSE = "/v1/mswarehouse/create";
export const UPDATE_MSWAREHOUSE = "/v1/mswarehouse/update";
export const DELETE_MSWAREHOUSE = "/v1/mswarehouse/delete";
//mszone
export const GET_MSZONE = "/v1/mszone/get";
export const CREATE_MSZONE = "/v1/mszone/create";
export const UPDATE_MSZONE = "/v1/mszone/update";
export const DELETE_MSZONE = "/v1/mszone/delete";
//msrack
export const GET_MSRACK = "/v1/msrack/get";
export const CREATE_MSRACK = "/v1/msrack/create";
export const UPDATE_MSRACK = "/v1/msrack/update";
export const DELETE_MSRACK = "/v1/msrack/delete";
export const GET_ZONE_LIST = "/v1/zone/list";
export const CREATE_ZONE = "/v1/zone/create";
export const UPDATE_ZONE = "/v1/zone/update";
export const DELETE_ZONE = "/v1/zone/delete";
// calproduct
export const GET_CAL_MSPRODUCT = "/v1/cal_msproduct/get";
export const CREATE_CAL_MSPRODUCT = "/v1/cal_msproduct/create";
export const UPDATE_CAL_MSPRODUCT = "/v1/cal_msproduct/update";
export const DELETE_CAL_MSPRODUCT = "/v1/cal_msproduct/delete";
// calbox
export const GET_CAL_BOX = "/v1/cal_box/get";
export const CREATE_CAL_BOX = "/v1/cal_box/create";
export const UPDATE_CAL_BOX = "/v1/cal_box/update";
export const DELETE_CAL_BOX = "/v1/cal_box/delete";
// rack_box_storage - old endpoints (keeping for backward compatibility)
export const GET_RACK_BOX_STORAGE = "/v1/rack_box_storage/get";
export const GET_RACK_BOX_STORAGE_BY_RACK = "/v1/rack_box_storage/get";
export const GET_RACK_BOX_STORAGE_DETAIL = "/v1/rack_box_storage/detail";
export const STORE_BOX_IN_RACK = "/v1/rack_box_storage/store";
export const UPDATE_STORED_BOX = "/v1/rack_box_storage/update";
export const DELETE_STORED_BOX = "/v1/rack_box_storage/delete";
//calwarehouse
export const GET_CAL_WAREHOUSE = "/v1/cal_warehouse/get";
export const CREATE_CAL_WAREHOUSE = "/v1/cal_warehouse/create";
export const UPDATE_CAL_WAREHOUSE = "/v1/cal_warehouse/update";
export const DELETE_CAL_WAREHOUSE = "/v1/cal_warehouse/delete";

// export box
export const EXPORT_BOX = "/v1/export-box";
export const GET_EXPORT_LOGS = "/v1/export-box/logs";
export const GET_STORED_BOXES_FOR_EXPORT = "/v1/export-box/stored-boxes";
//login
export const LOGIN = "/v1/auth/login";

// New structured API endpoints
export const API_ENDPOINTS = {
  CAL_BOX: {
    GET: "/v1/cal_box/get",
    CREATE: "/v1/cal_box/create",
    UPDATE: "/v1/cal_box/update",
    DELETE: "/v1/cal_box/delete"
  },
  MSRACK: {
    GET: "/v1/msrack/get",
    CREATE: "/v1/msrack/create",
    UPDATE: "/v1/msrack/update",
    DELETE: "/v1/msrack/delete"
  },
  RACK_BOX_STORAGE: {
    GET_ALL: "/v1/rack_box_storage",
    GET_BY_RACK_ID: "/v1/rack_box_storage/rack/:master_rack_id",
    GET_BY_ID: "/v1/rack_box_storage/:storage_id",
    STORE: "/v1/rack_box_storage",
    UPDATE: "/v1/rack_box_storage/:storage_id",
    DELETE: "/v1/rack_box_storage/:storage_id"
  },
  SHELF_BOX_STORAGE: {
    GET_ALL: "/v1/shelf_box_storage",
    GET_BY_SHELF_ID: "/v1/shelf_box_storage/shelf/:master_shelf_id",
    GET_BY_DOCUMENT: "/v1/shelf_box_storage/document",
    GET_BY_DOCUMENT_WAREHOUSE: "/v1/shelf_box_storage/document-warehouse",
    STORE: "/v1/shelf_box_storage",
    STORE_MULTIPLE: "/v1/shelf_box_storage/store-multiple",
    UPDATE: "/v1/shelf_box_storage/:storage_id",
    DELETE: "/v1/shelf_box_storage/:storage_id"
  }
};
