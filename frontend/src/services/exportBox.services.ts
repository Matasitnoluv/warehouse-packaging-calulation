import { EXPORT_BOX, GET_EXPORT_LOGS, GET_STORED_BOXES_FOR_EXPORT } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";

export interface ExportBoxPayload {
  storage_id: string;
  exported_by?: string;
  customer_name: string;
  export_note?: string;
}

export interface ExportLogFilters {
  warehouse_id?: string;
  zone_id?: string;
  start_date?: string;
  end_date?: string;
}

export const exportBox = async (payload: ExportBoxPayload) => {
  try {
    const { data: response } = await mainApi.post(EXPORT_BOX, payload);
    return response;
  } catch (error) {
    console.error("Error exporting box:", error);
    throw error;
  }
};

export const getExportLogs = async (filters?: ExportLogFilters) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters?.warehouse_id) {
      queryParams.append("warehouse_id", filters.warehouse_id);
    }

    if (filters?.zone_id) {
      queryParams.append("zone_id", filters.zone_id);
    }

    if (filters?.start_date) {
      queryParams.append("start_date", filters.start_date);
    }

    if (filters?.end_date) {
      queryParams.append("end_date", filters.end_date);
    }

    const { data: response } = await mainApi.get(`${GET_EXPORT_LOGS}?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("Error getting export logs:", error);
    throw error;
  }
};

export const getStoredBoxesForExport = async (warehouse_id?: string, zone_id?: string, rack_id?: string) => {
  try {
    const queryParams = new URLSearchParams();

    if (warehouse_id) {
      queryParams.append("warehouse_id", warehouse_id);
    }

    if (zone_id) {
      queryParams.append("zone_id", zone_id);
    }

    if (rack_id) {
      queryParams.append("rack_id", rack_id);
    }

    //console.log('Calling API with params:', queryParams.toString());
    const { data: response } = await mainApi.get(`${GET_STORED_BOXES_FOR_EXPORT}?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("Error getting stored boxes for export:", error);
    // Return a structured error response instead of throwing
    return {
      success: false,
      message: 'Failed to fetch stored boxes',
      responseObject: [],
      statusCode: 500
    };
  }
};
