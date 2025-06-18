import { masterbox } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadmasterbox } from "@modules/msbox/msboxModel";

export const Keys = [
  "master_box_id",
  "master_box_name",
  "code_box",
  "height",
  "length",
  "width",
  "cubic_centimeter_box",
  "description",
  "image_path",
];

export const msboxRepository = {
  findAllAsync: async () => {
    return prisma.masterbox.findMany({
      select: {
        master_box_id: true,
        master_box_name: true,
        code_box: true,
        height: true,
        length: true,
        width: true,
        cubic_centimeter_box: true,
        description: true,
        image_path: true,
      },
    });
  },

  findByName: async <Key extends keyof masterbox>(
    master_box_name: string,
    keys = Keys as Key[]
  ): Promise<Pick<masterbox, Key> | null> => {
    const selectedFields = keys.reduce(
      (obj, k) => ({ ...obj, [k]: true }),
      {} as Record<Key, true>
    );

    const result = await prisma.masterbox.findFirst({
      where: { master_box_name: master_box_name },
      select: selectedFields,
    });

    return result as Pick<masterbox, Key> | null;
  },

  create: async (payload: TypePayloadmasterbox) => {
    const master_box_name = payload.master_box_name.trim();
    const setPayload: any = {
      master_box_name: master_box_name,
      code_box: payload.code_box,
      height: Number(payload.height), // Corrected typo from `height` to `height`
      length: Number(payload.length), // Corrected typo from `length` to `length`
      width: Number(payload.width), // Corrected typo from `width` to `width`
      cubic_centimeter_box: Number(payload.cubic_centimeter_box),
      description: payload.description,
      image_path: payload.image_path
    };

    return await prisma.masterbox.create({
      data: setPayload,
    });
  },

  update: async (master_box_id: string, payload: Partial<TypePayloadmasterbox>) => {
    const updatedPayload = {
      master_box_name: payload.master_box_name,
      code_box: payload.code_box,
      height: payload.height ? Number(payload.height) : undefined,
      length: payload.length? Number(payload.length) : undefined,
      width: payload.width? Number(payload.width) : undefined,
      cubic_centimeter_box: payload.cubic_centimeter_box? Number(payload.cubic_centimeter_box) : undefined,
      description: payload.description,
      image_path: payload.image_path,    
    };

    const cleanedPayload = Object.fromEntries(
      Object.entries(updatedPayload).filter(([_, v]) => v !== undefined)
    );

    return await prisma.masterbox.update({
      where: { master_box_id: master_box_id },
      data: cleanedPayload,
    });
  },

  delete: async (master_box_id: string) => {
    return await prisma.masterbox.delete({
      where: { master_box_id: master_box_id },
    });
  },
};
