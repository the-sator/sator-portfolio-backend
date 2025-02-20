import prisma from "@/loaders/prisma";
import { type CreateUser, type UserFilter } from "@/types/user.type";
import type { Prisma } from "@prisma/client";

export class UserRepository {
  public buildFilter(filter: UserFilter) {
    const where: Record<string, unknown> = {};
    if (filter.email) {
      where.email = {
        startsWith: filter.email,
      };
    }

    if (filter.username) {
      where.username = {
        startsWith: filter.username,
      };
    }
    return where;
  }
  public async findAll() {
    return prisma.user.findMany();
  }

  public async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async paginate(filter: UserFilter) {
    const where = this.buildFilter(filter);
    return prisma.user.findMany({
      where,
    });
  }

  public async count(filter: UserFilter) {
    const where = this.buildFilter(filter);
    return prisma.user.count({ where });
  }

  public async addUser(
    payload: CreateUser,
    auth_id: string,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.user.create({
      data: {
        username: payload.username,
        auth_id,
      },
    });
  }
}
