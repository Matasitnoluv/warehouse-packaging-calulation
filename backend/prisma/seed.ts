import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // เข้ารหัสรหัสผ่าน rootadmin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // สร้างหรืออัปเดตผู้ใช้ rootadmin
    const rootAdmin = await prisma.user.upsert({
        where: { username: 'rootadmin' }, // ใช้ username เพราะ @unique
        update: { update_date: new Date() },
        create: {
            username: 'rootadmin',
            password: hashedPassword, // ใช้รหัสผ่านที่เข้ารหัส
            age: 10,
            address: 'system',
            status_role: 'admin',
            create_by: 'system',
            create_date: new Date(),
            update_by: 'system',
            update_date: new Date(),
        },
    });

    // เข้ารหัสรหัสผ่าน rootadmin
    const hashedPassword2 = await bcrypt.hash('Judpaipeechainaijail@2003', 10);

    // สร้างหรืออัปเดตผู้ใช้ rootadmin
    const rootAdmin2 = await prisma.user.upsert({
        where: { username: 'herekorpudpai' }, // ใช้ username เพราะ @unique
        update: { update_date: new Date() },
        create: {
            username: 'herekorpudpai',
            password: hashedPassword2, // ใช้รหัสผ่านที่เข้ารหัส
            age: 10,
            address: 'system',
            status_role: 'admin',
            create_by: 'system',
            create_date: new Date(),
            update_by: 'system',
            update_date: new Date(),
        },
    });

    console.log('Seeded rootAdmin:', rootAdmin);
}

main()
    .catch(async (e) => {
        console.error('Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
