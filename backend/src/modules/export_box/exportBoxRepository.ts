import prisma from "@src/db";
import { v4 as uuidv4 } from 'uuid';
import { TypePayloadExportBox, TypeGetExportBoxLog } from './exportBoxModel';

// Define types for our raw SQL query results
type ExportBoxRecord = {
    export_id: string;
    storage_id: string;
    export_date: Date;
    exported_by: string | null;
    customer_name: string;
    export_note: string | null;
    // Box and rack information from joins
    box_no?: string;
    master_product_name?: string;
    master_rack_name?: string;
    master_zone_name?: string;
    master_warehouse_name?: string;
};

export const exportBoxRepository = {
    // Export a box (mark it as exported and log the export)
    exportBoxAsync: async (payload: TypePayloadExportBox) => {
        try {
            // Start a transaction to ensure data consistency
            return await prisma.$transaction(async (tx) => {
                // Generate a UUID for the export_id
                const export_id = uuidv4();
                const exported_by = payload.exported_by || null;
                const export_note = payload.export_note || null;

                // 1. First check if the box is still in storage
                const storedBox = await tx.$queryRawUnsafe(`
                    SELECT * FROM "rack_box_storage"
                    WHERE "storage_id" = '${payload.storage_id}'
                    AND "status" = 'stored'
                `) as any[];

                if (storedBox.length === 0) {
                    throw new Error("Box not found in storage or already exported");
                }

                // 2. Update the rack_box_storage record to mark it as exported
                await tx.$executeRawUnsafe(`
                    UPDATE "rack_box_storage"
                    SET "status" = 'exported'
                    WHERE "storage_id" = '${payload.storage_id}'
                `);

                // 3. Create a record in the export_box_log table
                await tx.$executeRawUnsafe(`
                    INSERT INTO "export_box_log" (
                        "export_id",
                        "storage_id",
                        "export_date",
                        "exported_by",
                        "customer_name",
                        "export_note"
                    ) VALUES (
                        '${export_id}',
                        '${payload.storage_id}',
                        NOW(),
                        ${exported_by ? `'${exported_by}'` : 'NULL'},
                        '${payload.customer_name}',
                        ${export_note ? `'${export_note}'` : 'NULL'}
                    )
                `);

                // 4. Return the newly created export record with related information
                const exportRecord = await tx.$queryRawUnsafe(`
                    SELECT 
                        e.export_id, 
                        e.storage_id, 
                        e.export_date, 
                        e.exported_by, 
                        e.customer_name, 
                        e.export_note,
                        b.box_no,
                        b.master_product_name,
                        r.master_rack_name,
                        z.master_zone_name,
                        w.master_warehouse_name
                    FROM "export_box_log" e
                    JOIN "rack_box_storage" s ON e."storage_id" = s."storage_id"
                    JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                    JOIN "masterrack" r ON s."master_rack_id" = r."master_rack_id"
                    JOIN "masterzone" z ON r."master_zone_id" = z."master_zone_id"
                    JOIN "masterwarehouse" w ON z."master_warehouse_id" = w."master_warehouse_id"
                    WHERE e."export_id" = '${export_id}'
                `) as ExportBoxRecord[];

                return exportRecord[0] || null;
            });
        } catch (error) {
            console.error("Error in exportBoxAsync:", error);
            throw error; // Rethrow to let service handle it
        }
    },

    // Get export logs with optional filtering
    getExportLogsAsync: async (filters?: TypeGetExportBoxLog) => {
        try {
            let whereClause = '';
            const conditions = [];

            // Build the WHERE clause based on filters
            if (filters) {
                if (filters.warehouse_id) {
                    conditions.push(`w."master_warehouse_id" = '${filters.warehouse_id}'`);
                }

                if (filters.zone_id) {
                    conditions.push(`z."master_zone_id" = '${filters.zone_id}'`);
                }

                if (filters.start_date) {
                    conditions.push(`e."export_date" >= '${filters.start_date}'`);
                }

                if (filters.end_date) {
                    conditions.push(`e."export_date" <= '${filters.end_date}'`);
                }
            }

            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }

            // Execute the query with filters
            const result = await prisma.$queryRawUnsafe(`
                SELECT 
                    e.export_id, 
                    e.storage_id, 
                    e.export_date, 
                    e.exported_by, 
                    e.customer_name, 
                    e.export_note,
                    b.box_no,
                    b.master_product_name,
                    r.master_rack_name,
                    z.master_zone_name,
                    w.master_warehouse_name
                FROM "export_box_log" e
                JOIN "rack_box_storage" s ON e."storage_id" = s."storage_id"
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                JOIN "masterrack" r ON s."master_rack_id" = r."master_rack_id"
                JOIN "masterzone" z ON r."master_zone_id" = z."master_zone_id"
                JOIN "masterwarehouse" w ON z."master_warehouse_id" = w."master_warehouse_id"
                ${whereClause}
                ORDER BY e."export_date" DESC
            `) as ExportBoxRecord[];

            return result;
        } catch (error) {
            console.error("Error in getExportLogsAsync:", error);
            return [];
        }
    },

    // Get stored boxes that can be exported, filtered by warehouse, zone, and rack
    getStoredBoxesForExportAsync: async (warehouse_id?: string, zone_id?: string, rack_id?: string) => {
        try {
            let whereClause = 'WHERE s."status" = \'stored\'';

            // Log the received IDs for debugging
            //console.log('Repository received IDs:', { warehouse_id, zone_id, rack_id });

            // Only add the filter conditions if the IDs are valid UUIDs
            // For now, we'll just check if they exist and are not empty
            if (warehouse_id && warehouse_id.trim() !== '') {
                whereClause += ` AND w."master_warehouse_id" = '${warehouse_id}'`;
            }

            if (zone_id && zone_id.trim() !== '') {
                whereClause += ` AND z."master_zone_id" = '${zone_id}'`;
            }

            if (rack_id && rack_id.trim() !== '') {
                whereClause += ` AND r."master_rack_id" = '${rack_id}'`;
            }

            const result = await prisma.$queryRawUnsafe(`
                SELECT 
                    s.storage_id, 
                    s.master_rack_id, 
                    s.cal_box_id, 
                    s.stored_date, 
                    s.stored_by, 
                    s.position, 
                    s.status,
                    s.cubic_centimeter_box,
                    s.count,
                    s.total_volume,
                    s.document_product_no,
                    b.box_no,
                    b.master_box_name,
                    b.master_product_name,
                    r.master_rack_name,
                    z.master_zone_name,
                    w.master_warehouse_name
                FROM "rack_box_storage" s
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                JOIN "masterrack" r ON s."master_rack_id" = r."master_rack_id"
                JOIN "masterzone" z ON r."master_zone_id" = z."master_zone_id"
                JOIN "masterwarehouse" w ON z."master_warehouse_id" = w."master_warehouse_id"
                ${whereClause}
                ORDER BY s."stored_date" ASC
            `) as any[];

            return result;
        } catch (error) {
            console.error("Error in getStoredBoxesForExportAsync:", error);
            return [];
        }
    }
};
