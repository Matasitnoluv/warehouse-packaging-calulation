import { env } from '@common/utils/envConfig';
import { PrismaClient } from '@prisma/client';

declare global {
    // สำหรับ dev mode ให้เก็บ PrismaClient instance ไว้ใน globalThis
    // เพื่อไม่ให้สร้างซ้ำเวลา hot reload
    var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
