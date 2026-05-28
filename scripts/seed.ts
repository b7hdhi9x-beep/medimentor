import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding users...')

  const testUsers = [
    {
      email: 'john@doe.com',
      name: 'John Doe',
      password: 'johndoe123',
    },
    {
      email: 'test@medimentor.com',
      name: 'テストユーザー',
      password: 'medimentor123',
    },
  ]

  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12)
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password: hashedPassword },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
      },
    })
    console.log(`  Upserted user: ${user.email}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
