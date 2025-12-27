// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Start seeding...')

    // ダミーユーザーを作成
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' }, // 既にいたら何もしない
        update: {},
        create: {
            email: 'test@example.com',
            password: 'password123'
        },
    })

    console.log(`Created user with id: ${user.id}`)
    console.log('✅ Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })