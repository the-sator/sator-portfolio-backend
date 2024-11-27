import prisma from "@/loaders/prisma";
import type { CreatePermission } from "@/types/permission.type";
import type { Prisma } from "@prisma/client";

export class PermissionFlagRepository {
  public async create(
    role_id: number,
    payload: CreatePermission,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx.permissionFlag : prisma.permissionFlag;
    return await client.create({
      data: {
        role_id: role_id,
        resource_id: payload.resource_id,
        read: payload.read,
        write: payload.write,
        delete: payload.delete,
      },
    });
  }

  public async upsert(
    role_id: number,
    payload: CreatePermission,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx.permissionFlag : prisma.permissionFlag;

    return await client.upsert({
      where: {
        role_id_resource_id: {
          role_id,
          resource_id: payload.resource_id,
        },
      },
      update: {
        read: payload.read,
        write: payload.write,
        delete: payload.delete,
      },
      create: {
        role_id,
        resource_id: payload.resource_id,
        read: payload.read,
        write: payload.write,
        delete: payload.delete,
      },
    });
  }

  public async findAll() {
    return await prisma.permissionFlag.findMany();
  }
}
