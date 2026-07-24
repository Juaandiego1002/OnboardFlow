const { PrismaClient } = require('@prisma/client');
const { scryptSync, randomBytes } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const salt = randomBytes(32).toString('hex');
  const hash = scryptSync('Admin123', salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  await prisma.admin.update({
    where: { email: 'admin@startup.com' },
    data: { passwordHash: salt + ':' + hash },
  });
  console.log('Contraseña configurada correctamente');
}

main().catch(console.error).finally(() => prisma.$disconnect());