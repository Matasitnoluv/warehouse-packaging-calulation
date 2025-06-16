import { TypePayloadRackBoxStorage } from '@modules/rack_box_storage/rack_box_storageModel';
import prisma from "@src/db";
import { v4 as uuidv4 } from 'uuid';

// Define types for our raw SQL query results
type RackBoxStorageRecord = {
    storage_id: string;
    master_rack_id: string;
    cal_box_id: string;
    stored_date: Date;
    stored_by: string | null;
    position: number | null;
    status: string;
    // Add box properties that we need
    cubic_centimeter_box?: number;
    count?: number;
    // Add any other properties that might be returned from the JOIN
};

export const rack_box_storageRepository = {
    // Find all stored boxes
    findAllAsync: async () => {
        try {
            // Use direct SQL query to avoid Prisma client issues
            const result = await prisma.$queryRawUnsafe(`
                SELECT s.*, b.* 
                FROM "rack_box_storage" s
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
            `) as RackBoxStorageRecord[];
            return result;
        } catch (error) {
            console.error("Error in findAllAsync:", error);
            return [];
        }
    },

    // Find stored boxes by rack ID
    findByRackIdAsync: async (master_rack_id: string) => {
        try {
            // Use direct SQL query to avoid Prisma client issues
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
                    b.code_box,
                    b.master_product_name,
                    b.code_product
                FROM "rack_box_storage" s
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                WHERE s."master_rack_id" = '${master_rack_id}'
                AND s."status" = 'stored'
                ORDER BY s."stored_date" ASC
            `) as RackBoxStorageRecord[];
            console.log(`Found ${result.length} stored boxes for rack ${master_rack_id}:`, result);
            return result;
        } catch (error) {
            console.error(`Error in findByRackIdAsync for rack ${master_rack_id}:`, error);
            return [];
        }
    },

    // Find stored box by ID
    findByIdAsync: async (storage_id: string) => {
        try {
            // Use direct SQL query to avoid Prisma client issues
            const result = await prisma.$queryRawUnsafe(`
                SELECT s.*, r.*, b.* 
                FROM "rack_box_storage" s
                JOIN "masterrack" r ON s."master_rack_id" = r."master_rack_id"
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                WHERE s."storage_id" = '${storage_id}'
            `) as RackBoxStorageRecord[];

            return result[0] || null;
        } catch (error) {
            console.error(`Error in findByIdAsync for storage ${storage_id}:`, error);
            return null;
        }
    },

    // Check if a box is already stored in any rack
    isBoxStoredAsync: async (cal_box_id: string) => {
        try {
            // Use direct SQL query to avoid Prisma client issues
            const result = await prisma.$queryRawUnsafe(`
                SELECT COUNT(*) as count
                FROM "rack_box_storage"
                WHERE "cal_box_id" = '${cal_box_id}'
                AND "status" = 'stored'
            `) as { count: string }[];

            return parseInt(result[0]?.count, 10) > 0;
        } catch (error) {
            console.error(`Error in isBoxStoredAsync for box ${cal_box_id}:`, error);
            return false;
        }
    },

    // Calculate total volume of boxes stored in a rack
    calculateUsedVolumeAsync: async (master_rack_id: string) => {
        try {
            // Use direct SQL query to avoid Prisma client issues
            const result = await prisma.$queryRawUnsafe(`
                SELECT SUM(b."cubic_centimeter_box" * b."count") as total_volume
                FROM "rack_box_storage" s
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                WHERE s."master_rack_id" = '${master_rack_id}'
                AND s."status" = 'stored'
            `) as { total_volume: string }[];

            return parseInt(result[0]?.total_volume || '0', 10);
        } catch (error) {
            console.error(`Error in calculateUsedVolumeAsync for rack ${master_rack_id}:`, error);
            return 0;
        }
    },

    // Store a box in a rack
    createAsync: async (payload: TypePayloadRackBoxStorage) => {
        try {
            // Generate a UUID for the storage_id
            const storage_id = uuidv4();
            const stored_by = payload.stored_by || null;
            const position = payload.position !== undefined ? payload.position : null;

            // Extract additional fields from payload
            const cubic_centimeter_box = payload.cubic_centimeter_box || null;
            const count = payload.count || null;
            const total_volume = payload.total_volume || null;
            const document_product_no = payload.document_product_no || null;

            console.log('Storing box with additional information:', {
                cubic_centimeter_box,
                count,
                total_volume,
                document_product_no
            });

            // Use direct SQL query to avoid Prisma client issues
            await prisma.$executeRawUnsafe(`
                INSERT INTO "rack_box_storage" (
                    "storage_id", 
                    "master_rack_id", 
                    "cal_box_id", 
                    "stored_date", 
                    "stored_by", 
                    "position", 
                    "status",
                    "cubic_centimeter_box",
                    "count",
                    "total_volume",
                    "document_product_no"
                ) VALUES (
                    '${storage_id}', 
                    '${payload.master_rack_id}', 
                    '${payload.cal_box_id}', 
                    NOW(), 
                    ${stored_by ? `'${stored_by}'` : 'NULL'}, 
                    ${position !== null ? position : 'NULL'}, 
                    'stored',
                    ${cubic_centimeter_box !== null ? cubic_centimeter_box : 'NULL'},
                    ${count !== null ? count : 'NULL'},
                    ${total_volume !== null ? total_volume : 'NULL'},
                    ${document_product_no ? `'${document_product_no}'` : 'NULL'}
                )
            `);

            // Return the newly created record
            const newRecord = await prisma.$queryRawUnsafe(`
                SELECT s.*, r.*, b.* 
                FROM "rack_box_storage" s
                JOIN "masterrack" r ON s."master_rack_id" = r."master_rack_id"
                JOIN "cal_box" b ON s."cal_box_id" = b."cal_box_id"
                WHERE s."storage_id" = '${storage_id}'
            `) as RackBoxStorageRecord[];

            return newRecord[0] || null;
        } catch (error) {
            console.error("Error in createAsync:", error);
            throw error; // Rethrow to let service handle it
        }
    },

    // Update a stored box (change status or position)
    updateAsync: async (storage_id: string, payload: any) => {
        try {
            let updateQuery = '';

            if (payload.status) {
                updateQuery += `"status" = '${payload.status}'`;
            }

            if (payload.position !== undefined) {
                if (updateQuery) updateQuery += ', ';
                updateQuery += `"position" = ${payload.position === null ? 'NULL' : payload.position}`;
            }

            if (updateQuery) {
                await prisma.$executeRawUnsafe(`
                    UPDATE "rack_box_storage"
                    SET ${updateQuery}
                    WHERE "storage_id" = '${storage_id}'
                `);
            }

            // Return the updated record
            return await rack_box_storageRepository.findByIdAsync(storage_id);
        } catch (error) {
            console.error(`Error in updateAsync for storage ${storage_id}:`, error);
            throw error; // Rethrow to let service handle it
        }
    },

    // Delete a stored box record
    deleteAsync: async (storage_id: string) => {
        try {
            return prisma.$executeRawUnsafe(`
                DELETE FROM "rack_box_storage"
                WHERE "storage_id" = '${storage_id}'
            `);
        } catch (error) {
            console.error(`Error in deleteAsync for storage ${storage_id}:`, error);
            throw error; // Rethrow to let service handle it
        }
    }
};
