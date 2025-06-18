import { user } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloaduser } from "./userModel";

export const Keys = [
  "users_id",
  "fullname",
  "age",
  "address",
  "username",
  "password",
  "status_role",
  "create_date",
  "create_by",
  "update_by",
  "update_date",
];

export const userRepository = {
  findAllAsync: async () => {
    return prisma.user.findMany({
      select: {
        users_id: true,
        fullname: true,
        address: true,
        age: true,
        username: true,
        password: true,
        status_role: true,
        create_by: true,
        create_date: true,
        update_by: true,
        update_date: true,
      },
    });
  },

  findByName: async <Key extends keyof user>(
    fullname: string,
    keys = Keys as Key[]
  ): Promise<Pick<user, Key> | null> => {
    const selectedFields = keys.reduce(
      (obj, k) => ({ ...obj, [k]: true }),
      {} as Record<Key, true>
    );

    const result = await prisma.user.findFirst({
      where: { fullname: fullname },
      select: selectedFields,
    });

    return result as Pick<user, Key> | null;
  },


  findByUsername: async (username: string, keys = Keys as Array<keyof user>) => { //Method
    return prisma.user.findUnique({
      where: { username: username },
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    }) as Promise<Pick<user, keyof user> | null>;
  },

  findByPassword: async (password: string, keys = Keys as Array<keyof user>) => { //Method
    return prisma.user.findFirst({
      where: { password: password },
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    }) as Promise<Pick<user, keyof user> | null>;
  },

  create: async (payload: TypePayloaduser) => {
    const fullname = payload.fullname.trim();
    const setPayload: any = {
      fullname: fullname,
      age: payload.age,
      address: payload.address,
      username: payload.username,
      password: payload.password,
      status_role: payload.status_role,
      create_by: payload.create_by,
      update_by: payload.update_by,
    };

    return await prisma.user.create({
      data: setPayload
    })
  },

  findByIdAsync: async <Key extends keyof user>(
    id: string,
    keys = Keys as Key[]) => {
    return await prisma.user.findUnique({
      where: { users_id: id },
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    }) as Promise<Pick<user, Key> | null>;
  },

  update: async (users_id: string, payload: Partial<TypePayloaduser>) => {
    const updatePayload = { ...payload, users_id: payload.users_id ? String(payload.users_id) : undefined, };

    return await prisma.user.update({
      where: { users_id: users_id },
      data: updatePayload,
    });
  },


  delete: async (users_id: string) => {
    return await prisma.user.delete({
      where: { users_id: users_id },
    });
  },



};
