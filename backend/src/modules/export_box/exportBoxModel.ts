import { z } from "zod";

export const CreateExportBoxSchema = z.object({
  storage_id: z.string().uuid(),
  exported_by: z.string().optional(),
  customer_name: z.string(),
  export_note: z.string().optional(),
});

export const GetExportBoxLogSchema = z.object({
  warehouse_id: z.string().uuid().optional(),
  zone_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type TypePayloadExportBox = z.infer<typeof CreateExportBoxSchema>;
export type TypeGetExportBoxLog = z.infer<typeof GetExportBoxLogSchema>;
