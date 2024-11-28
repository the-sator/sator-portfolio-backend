import prisma from "@/loaders/prisma";
import type { BaseModel } from "@/types/base.type";
import type { CreateRole, UpdateRole } from "@/types/role.type";
import type { Prisma } from "@prisma/client";

export class RoleRepository {
  public async findAll() {
    return await prisma.role.findMany({
      include: {
        permissions: true,
      },
    });
  }

  public async findById(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ? tx.role : prisma.role;
    return await client.findFirst({
      where: { id },
      include: {
        permissions: {
          include: {
            resource: true,
          },
        },
      },
    });
  }

  public async create(payload: CreateRole, tx?: Prisma.TransactionClient) {
    const client = tx ? tx.role : prisma.role;
    return await client.create({
      data: {
        name: payload.name,
      },
    });
  }

  public async delete(id: number, tx?: Prisma.TransactionClient) {
    const client = tx ? tx.role : prisma.role;
    return await client.delete({
      where: { id },
    });
  }
}
