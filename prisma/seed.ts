import { getRandomString } from "../src/utils/encryption";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createCipheriv } from "crypto";
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
  // Increase transaction timeout
  await prisma.$transaction(
    async (tx) => {
      // Create roles
      const [superAdminRole, adminRole] = await Promise.all([
        tx.role.upsert({
          where: { name: "Super Admin" },
          update: {},
          create: { name: "Super Admin" },
        }),
        tx.role.upsert({
          where: { name: "Admin" },
          update: {},
          create: { name: "Admin" },
        }),
      ]);
      console.log("Roles created ✅");

      // Create resources
      const resources = await Promise.all(
        Resource.map((resource) =>
          tx.resource.upsert({
            where: { name: resource.name },
            update: {},
            create: { name: resource.name },
          })
        )
      );
      console.log("Resources created ✅");

      // Create permissions
      await Promise.all(
        resources.map((resource) =>
          tx.permissionFlag.upsert({
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
          })
        )
      );
      console.log("Permissions for Super Admin created ✅");

      // Create admin permissions
      await Promise.all(
        resources.map((resource) => {
          const isUserResource = [
            "User",
            "Portfolio",
            "Role",
            "Chat",
            "Blog",
          ].includes(resource.name);
          return tx.permissionFlag.upsert({
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
        })
      );
      console.log("Permissions for Admin created ✅");

      // Create users
      const saltRounds = process.env.PASSWORD_SALT;
      const superPasswordHash = await bcrypt.hash(
        "super123",
        Number(saltRounds)
      );
      const passwordHash = await bcrypt.hash("12345678", Number(saltRounds));

      const [superAdminAuth, adminAuth, userAuth, siteUserAuth] =
        await Promise.all([
          tx.auth.upsert({
            where: { email: "super@test.com" },
            update: {},
            create: {
              email: "super@test.com",
              password: superPasswordHash,
            },
          }),
          tx.auth.upsert({
            where: { email: "admin@test.com" },
            update: {},
            create: {
              email: "admin@test.com",
              password: passwordHash,
            },
          }),
          tx.auth.upsert({
            where: { email: "user@test.com" },
            update: {},
            create: {
              email: "user@test.com",
              password: passwordHash,
            },
          }),
          tx.auth.upsert({
            where: { email: "default@test.com" },
            update: {},
            create: {
              email: "default@test.com",
              password: passwordHash,
            },
          }),
        ]);
      console.log("Auth records created ✅");
      const apiKey = getRandomString();
      const encryptedKey = encryptApiKey(apiKey);
      const [, , user] = await Promise.all([
        tx.admin.upsert({
          where: { auth_id: superAdminAuth.id },
          update: {},
          create: {
            username: "super",
            auth_id: superAdminAuth.id,
            role_id: superAdminRole.id,
          },
        }),
        tx.admin.upsert({
          where: { auth_id: adminAuth.id },
          update: {},
          create: {
            username: "admin",
            auth_id: adminAuth.id,
            role_id: adminRole.id,
          },
        }),
        tx.user.upsert({
          where: { auth_id: userAuth.id },
          update: {},
          create: {
            username: "user",
            auth_id: userAuth.id,
          },
        }),
      ]);

      await tx.siteUser.upsert({
        where: { auth_id: siteUserAuth.id },
        update: {},
        create: {
          website_name: "Ponleu's Portfolio",
          link: "https://putponleu.vercel.app",
          api_key: encryptedKey,
          user_id: user.id,
          auth_id: siteUserAuth.id,
        },
      });
      console.log("Super Admin, Admin & User created ✅");
    },
    {
      timeout: 30000, // Increase transaction timeout
    }
  );
  console.log("Done 1");
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

function encryptApiKey(text: string): string {
  const secretKey = Buffer.from(process.env.API_KEY_SECRET!, "hex");
  const iv = Buffer.from(process.env.API_KEY_IV!, "hex");
  const cipher = createCipheriv(process.env.API_KEY_ALGO!, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
