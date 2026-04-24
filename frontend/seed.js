import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log('====================================');
  console.log('🎬 MovieLix Database Auto-Provision');
  console.log('====================================');

  console.log('Checking admin user...');
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Admin user '${username}' created successfully based on .env`);
  } else {
    // Optionally update if password changed
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        username,
        password: hashedPassword
      }
    });
    console.log(`✅ Admin user '${username}' updated based on .env`);
  }
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seed process finished.');
  });
