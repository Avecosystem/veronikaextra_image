
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
