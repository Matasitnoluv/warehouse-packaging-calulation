import { z } from "zod";

export const CreateRackBoxStorageSchema = z.object({
  master_rack_id: z.string().uuid(),
  cal_box_id: z.string().uuid(),
  stored_by: z.string().optional(),
  position: z.number().optional(),
  // Added volume information
  cubic_centimeter_box: z.number().optional(),
  count: z.number().optional(),
  total_volume: z.number().optional(),
  // Document information
  document_product_no: z.string().optional(),
});

export const UpdateRackBoxStorageSchema = z.object({
  storage_id: z.string().uuid(),
  status: z.string().optional(),
  position: z.number().optional(),
});

export const DeleteRackBoxStorageSchema = z.object({
  storage_id: z.string().uuid(),
});

export type TypePayloadRackBoxStorage = z.infer<typeof CreateRackBoxStorageSchema>;
export type TypeUpdateRackBoxStorage = z.infer<typeof UpdateRackBoxStorageSchema>;
