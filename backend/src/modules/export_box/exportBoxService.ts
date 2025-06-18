import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { exportBoxRepository } from './exportBoxRepository';
import { TypePayloadExportBox, TypeGetExportBoxLog } from './exportBoxModel';

export const exportBoxService = {
    // Export a box (mark it as exported and log the export)
    exportBox: async (payload: TypePayloadExportBox) => {
        try {
            const exportedBox = await exportBoxRepository.exportBoxAsync(payload);
            
            if (!exportedBox) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Failed to export box",
                    null,
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Box exported successfully",
                exportedBox,
                StatusCodes.OK
            );
        } catch (ex) {
            console.error("Error exporting box:", ex);
            const errorMessage = "Error exporting box: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    
    // Get export logs with optional filtering
    getExportLogs: async (filters?: TypeGetExportBoxLog) => {
        try {
            const exportLogs = await exportBoxRepository.getExportLogsAsync(filters);
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Export logs retrieved successfully",
                exportLogs,
                StatusCodes.OK
            );
        } catch (ex) {
            console.error("Error getting export logs:", ex);
            const errorMessage = "Error getting export logs: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    
    // Get stored boxes that can be exported, filtered by warehouse, zone, and rack
    getStoredBoxesForExport: async (warehouse_id?: string, zone_id?: string, rack_id?: string) => {
        try {
            const storedBoxes = await exportBoxRepository.getStoredBoxesForExportAsync(warehouse_id, zone_id, rack_id);
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Stored boxes retrieved successfully",
                storedBoxes,
                StatusCodes.OK
            );
        } catch (ex) {
            console.error("Error getting stored boxes for export:", ex);
            const errorMessage = "Error getting stored boxes for export: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
};
