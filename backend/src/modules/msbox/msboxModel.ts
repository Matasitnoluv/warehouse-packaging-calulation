import { z } from "zod";

export type TypePayloadmasterbox = {
  image_path: any;
  master_box_id: string;
  master_box_name: string;
  code_box: string;
  height: number;
  length: number;
  width: number;
  cubic_centimeter_box: number;
  description: string;
  image: string;
};

export const CreateMsboxSchema = z.object({
  body: z.object({
    master_box_name: z.string().max(50),
    code_box: z.string(),
    height: z.number(),
    length: z.number(),
    width: z.number(),
    cubic_centimeter_box: z.number(),
    description: z.string(),
    image: z.string(),
  }),
});

export const UpdateMsboxSchema = z.object({
  body: z.object({
    master_box_id: z.string(),
    master_box_name: z.string().max(50),
    height: z.number(),
    length: z.number(),
    width: z.number(),
    cubic_centimeter_box: z.number(),
    image: z.string(),
  }),
});

export const DeleteMsboxSchema = z.object({
  params: z.object({
    master_box_id: z.string(),
  }),
});
