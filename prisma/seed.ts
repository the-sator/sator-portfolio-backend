import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
  const saltRounds = process.env.PASSWORD_SALT;
  const passwordHash = await bcrypt.hash("12345678", Number(saltRounds));

  const adminTest = await prisma.admin.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      username: "test",
      password: passwordHash,
    },
  });
  console.log({ adminTest });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
