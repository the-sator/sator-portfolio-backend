import prisma from "@/loaders/prisma";
import type { CreateResource } from "@/types/resource.type";
import type { Prisma } from "@prisma/client";

export class ResourceRepository {
  public async findAll() {
    return await prisma.resource.findMany();
  }
  public async create(payload: CreateResource) {
    return await prisma.resource.create({
      data: {
        name: payload.name,
      },
    });
  }

  public async findByName(name: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx.resource : prisma.resource;
    return await client.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });
  }
}
