import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL no definido en .env');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin ya existe: ${adminEmail}`);
    return;
  }

  await prisma.admin.create({ data: { email: adminEmail } });
  console.log(`Admin creado: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
