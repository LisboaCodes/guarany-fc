import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Criar configurações do sistema
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      membershipValue: 50.00,
      paymentDueDayOfMonth: 10,
      birthdayMessageEnabled: true,
      reminderMessageEnabled: true,
      reminderDaysBeforeDue: 5,
    },
  })
  console.log('✅ System settings created:', settings)

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@guarany.com' },
    update: {},
    create: {
      email: 'admin@guarany.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      active: true,
    },
  })
  console.log('✅ Admin user created:', { email: admin.email, name: admin.name })

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
