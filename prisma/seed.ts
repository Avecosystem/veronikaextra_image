import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@veronikaextra.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin',
                passwordHash,
                credits: 999999,
                isAdmin: true,
                country: 'India'
            }
        });

        console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
        console.log(`Admin user already exists: ${adminEmail}`);
    }

    // Initialize global settings
    const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
        await prisma.globalSettings.create({
            data: {
                id: 1,
                globalNotice: '',
                creditsPageNotice: '',
                termsOfService: '',
                privacyPolicy: '',
                socialMediaLinks: '{}',
                creditPlans: '[]',
                contactDetails: '[]'
            }
        });
        console.log('✅ Global settings initialized');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
