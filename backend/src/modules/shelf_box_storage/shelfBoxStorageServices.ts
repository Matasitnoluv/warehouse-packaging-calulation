import { v4 as uuidv4 } from "uuid";
import { shelfBoxStorageRepository } from "./shelfBoxStorageRepository";
import { msshelfRepository } from "../msshelf/msshelfRepository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const omitKeys = ['cal_box', 'modified', 'box_no'];

function cleanPayload(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !omitKeys.includes(key))
  );
}
export const shelfBoxStorageServices = {
    getAllAsync: async () => {
        try {
            const data = await shelfBoxStorageRepository.findAllAsync();
            return {
                success: true,
                responseObject: data,
                message: "Get all shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },


    getShelfExportAsync: async ({ master_warehouse_id, master_zone_id }: { master_warehouse_id: string, master_zone_id: string }) => {

        try {
            const warehouse = await prisma.masterwarehouse.findUnique({
                where: {
                    master_warehouse_id: master_warehouse_id,
                }
            })
            const zone = await prisma.masterzone.findUnique({
                where: {
                    master_zone_id: master_zone_id,
                }
            });


            const racks = await prisma.masterrack.findMany({
                where: {
                    master_zone_id: master_zone_id,
                }
            });
            const rackIds = racks.map(rack => rack.master_rack_id);
            const shelfs = await prisma.mastershelf.findMany({
                where: {
                    master_rack_id: {
                        in: rackIds,
                    },
                },
            });

            const shelfBoxStorage = await prisma.shelf_box_storage.findMany({
                where: {
                    master_warehouse_id: master_warehouse_id,
                    master_zone_id: master_zone_id,
                },include:{cal_box:true}
            });
        
           
            const data = {
                warehouse,
                zone,
                racks,
                shelfs,
                shelfBoxStorage,
            }
            return {
                success: true,
                responseObject: data,
                message: "Get data export successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },


  
    getShelfCompileAsync: async (master_warehouse_id:string) => {
  const storage = await prisma.masterwarehouse.findUnique({where:{master_warehouse_id:master_warehouse_id},include:{masterzone:{include:{racks:{include:{shelves:{include:{stored_boxes:{include:{cal_box:true}}}}}}}}}})
  return storage
    },

    getByDocumentWarehouseNoAsync: async (document_warehouse_no: string, master_zone_id: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentWareHouseAndZoneAsync(document_warehouse_no, master_zone_id);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document warehouse number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByShelfIdAsync: async (master_shelf_id: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByShelfIdAsync(master_shelf_id);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by shelf ID successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByDocumentNoAsync: async (document_product_no: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentNoAsync(document_product_no);

            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    getByDocumentWareHouse: async (document_warehouse_no: string) => {
        try {
            const data = await shelfBoxStorageRepository.findByDocumentWareHouse(document_warehouse_no);
            console.log('GetByDocumentWareHouse data:', data);
            return {
                success: true,
                responseObject: data,
                message: "Get shelf box storage by document number successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },
createAsync: async (payload: any[]) => {
  // เอา cal_box ออกไว้ใช้ later
 const boxWithProductId = payload
  .filter((item) => item.cal_box?.document_product_no)
  .map((item) =>  item.cal_box?.document_product_no);
  // เคลียร์ field ที่ไม่ต้องส่ง
  const cleanedPayload: { storage_id?: string }[] = payload.map(({ cal_box,modified, box_no, ...rest }) => {
    const cleanRest = Object.fromEntries(
      Object.entries(rest).filter(
        ([key, value]) => !(key.includes('id') && (value === '' || value === null))
      )
    );
    return cleanRest;
  });

  // หาว่า storage_id ไหนมีอยู่แล้ว
  const existing = await prisma.shelf_box_storage.findMany({
    where: {
      storage_id: {
        in: cleanedPayload
          .map((item) => item.storage_id)
          .filter((id): id is string => typeof id === 'string'),
      },
    },
    select: { storage_id: true },
  });

  const existingIds = new Set(existing.map((e) => e.storage_id));

  const filteredPayload = cleanedPayload.filter(
    (item) => !item.storage_id || !existingIds.has(item.storage_id)
  );

  if (filteredPayload.length === 0) {
    return { success: true, message: "No new items to insert." };
  }

  // ทำการ create
  const result = await prisma.shelf_box_storage.createMany({
    data: filteredPayload as any[],
    skipDuplicates: true,
  });



if (result.count > 0 && boxWithProductId.length > 0) {
  const uniqueProductOn = [...new Set(boxWithProductId)];
  await prisma.cal_msproduct.updateMany({
    where: {
      document_product_no: {
        in: uniqueProductOn,
      },
    },
    data: {
      status: true,
    },
  });
  const warehouseUpdates = payload
  .filter(item => item.cal_warehouse_id && item.master_warehouse_id) // เอาเฉพาะที่มี id ครบ
  .map(item => ({
    cal_warehouse_id: item.cal_warehouse_id,
    master_warehouse_id: item.master_warehouse_id
  }));
const uniqueUpdates = Array.from(
  new Map(warehouseUpdates.map(item => [item.cal_warehouse_id, item])).values()
);

await Promise.all(
  uniqueUpdates.map(({ cal_warehouse_id, master_warehouse_id }) =>
    prisma.cal_warehouse.update({
      where: { cal_warehouse_id },
      data: { master_warehouse_id },
    })
  )
);
}

  return { success: true, message: "Inserted successfully.", count: result.count };
},
 updateMany: async (payload: any[]) => {
    try {
      const results = await Promise.all(
        payload.map(async (item) => {
          const { storage_id, ...rest } = item;
          if (!storage_id) return null;

          const cleanedData = cleanPayload(rest);

          return await prisma.shelf_box_storage.updateMany({
            where: { storage_id },
            data: cleanedData,
          });
        })
      );

      return {
        success: true,
        responseObject: results,
        message: 'Update shelf box storage successful',
      };
    } catch (error: any) {
      return {
        success: false,
        responseObject: null,
        message: error.message,
      };
    }
  }

   , updateAsync: async (storage_id: string, payload: any) => {
        try {
            const data = await shelfBoxStorageRepository.updateAsync(storage_id, payload);
            return {
                success: true,
                responseObject: data,
                message: "Update shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },



    deleteAsync: async (storage_id: string) => {
        try {
            const data = await shelfBoxStorageRepository.deleteAsync(storage_id);
            return {
                success: true,
                responseObject: data,
                message: "Delete shelf box storage successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

    // Store multiple boxes in a shelf
    storeMultipleBoxesAsync: async (payload: any[]) => {
        try {
            const results = [];
            const errors = [];

            // Process each box storage request
            for (const item of payload) {
                // Check if the shelf exists
                const shelf = await msshelfRepository.findByIdAsync(item.master_shelf_id);
                if (!shelf || !shelf.cubic_centimeter_shelf) {
                    errors.push({
                        cal_box_id: item.cal_box_id,
                        message: "Shelf not found or invalid shelf volume",
                    });
                    continue;
                }

                // For single box storage, we don't need to check volume since we're storing one box at a time
                // The volume check will be handled by the shelf capacity constraint
                const totalVolumeToAdd = item.cubic_centimeter_box; // Just use the box volume since count is 1

                // Generate a new UUID for the storage
                const storage_id = uuidv4();
                const newPayload = {
                    ...item,
                    storage_id,
                    total_volume: totalVolumeToAdd // Keep total_volume for backward compatibility
                };

                // Create the storage record
                const result = await shelfBoxStorageRepository.createAsync(newPayload);
                results.push(result);
            }

            return {
                success: true,
                responseObject: {
                    successful: results,
                    failed: errors,
                },
                message: `Stored ${results.length} boxes successfully. ${errors.length} boxes failed.`,
            };
        } catch (error) {
            console.error("Error storing multiple boxes:", error);
            throw error;
        }
    },

    getStoredBoxesByShelfIdAsync: async (master_shelf_id: string) => {
        try {
            const storedBoxes = await prisma.shelf_box_storage.findMany({
                where: {
                    master_shelf_id: { in: [master_shelf_id] }
                },
                include: {
                    cal_box: true,
                    mastershelf: true,
                }
            });

            return {
                success: true,
                responseObject: storedBoxes,
                message: "Get stored boxes by shelf ID successful",
            };
        } catch (error: any) {
            return {
                success: false,
                responseObject: null,
                message: error.message,
            };
        }
    },

  
};
