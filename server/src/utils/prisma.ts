import { PrismaClient, Prisma } from '@prisma/client'

// Decimal 序列化为 number 而非 string，保持与前端 Float 时期兼容
Prisma.Decimal.prototype.toJSON = function () {
  return this.toNumber()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
