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
  {
    name: "Role",
  },
  {
    name: "Resource",
  },
  {
    name: "Chat",
  },
  {
    name: "Site User",
  },
];

type Resource = {
  name: string;
  id: number;
};

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
  let resources: Resource[] = [];
  for (const resource of Resource) {
    const result = await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: {
        name: resource.name,
      },
    });

    resources.push({
      id: result.id,
      name: result.name,
    });
    console.log("Resource ", result.name, " Created ✅");
  }

  resources.forEach(async (resource) => {
    await prisma.permissionFlag.upsert({
      where: {
        role_id_resource_id: {
          role_id: superAdminRole.id,
          resource_id: resource.id,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        resource_id: resource.id,
        read: true,
        write: true,
        delete: true,
      },
    });
  });

  console.log("Permission for ", superAdminRole.name, " Created ✅");

  resources.forEach(async (resource) => {
    let isUserResource;
    switch (resource.name) {
      case "User":
      case "Portfolio":
      case "Role":
      case "Chat":
      case "Blog":
        isUserResource = true;
        break;
      default:
        isUserResource = false;
        break;
    }
    console.log("resource.name:", resource.name, " : ", isUserResource);
    await prisma.permissionFlag.upsert({
      where: {
        role_id_resource_id: {
          role_id: adminRole.id,
          resource_id: resource.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        resource_id: resource.id,
        read: true,
        write: isUserResource,
        delete: isUserResource,
      },
    });
  });

  console.log("Permission for ", adminRole.name, " Created ✅");

  const saltRounds = process.env.PASSWORD_SALT;

  const superPasswordHash = await bcrypt.hash("super123", Number(saltRounds));
  const superAdminTest = await prisma.admin.upsert({
    where: { email: "super@test.com" },
    update: {},
    create: {
      email: "super@test.com",
      username: "super",
      password: superPasswordHash,
      role_id: superAdminRole.id,
    },
  });
  console.log("Super Admin ", superAdminTest.username, " Created ✅");

  const passwordHash = await bcrypt.hash("12345678", Number(saltRounds));
  const adminTest = await prisma.admin.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      username: "admin",
      password: passwordHash,
      role_id: adminRole.id,
    },
  });
  console.log("Admin ", adminTest.username, " Created ✅");

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      username: "user",
      password: passwordHash,
    },
  });
  console.log("User ", user.username, " Created ✅");
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
