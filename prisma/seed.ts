import { PrismaClient } from "@prisma/client";
import { parseArgs } from "node:util";
import { seedTest } from "./seed-test";
import { seedMain } from "./seed-main";

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

const options = {
  environment: { type: "string" as const },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });
  switch (environment) {
    case "test":
    case "development":
      await seedTest();
      break;
    default:
      await seedMain();
      break;
  }
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
