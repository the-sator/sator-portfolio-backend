import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
export const Resource = [
  {
    name: "User",
  },
  {
    name: "Admin",
  },
  {
    name: "Portfolio",
  },
  {
    name: "Blog",
  },
];

const prisma = new PrismaClient();

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
    },
  });
  console.log("Role ", superAdminRole.name, " Created ✅");
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
    },
  });
  console.log("Role ", adminRole.name, " Created ✅");
  let resourceIds: number[] = [];
  for (const resource of Resource) {
    const result = await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: {
        name: resource.name,
      },
    });

    resourceIds.push(result.id);
    console.log("Resource ", result.name, " Created ✅");
  }

  resourceIds.forEach(async (id) => {
    await prisma.permissionFlag.upsert({
      where: {
        role_id_resource_id: {
          role_id: superAdminRole.id,
          resource_id: id,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        resource_id: id,
        read: true,
        write: true,
        delete: true,
      },
    });
  });

  console.log("Permission ", adminRole.name, " Created ✅");

  const saltRounds = process.env.PASSWORD_SALT;
  const passwordHash = await bcrypt.hash("12345678", Number(saltRounds));
  const adminTest = await prisma.admin.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      username: "test",
      password: passwordHash,
      role_id: superAdminRole.id,
    },
  });
  console.log("Admin ", adminTest.username, " Created ✅");
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
