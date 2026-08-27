const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default config
  await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      eventName: 'Bazar Digital 2026',
      couponPrice: 10000,
      totalCoupons: 1000,
      couponsSold: 0,
      isOpen: true,
      bankName: 'BCA',
      bankAccount: '1234567890',
      bankAccountName: 'Panitia Bazar',
      csWhatsapp: '6281234567890',
    },
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
