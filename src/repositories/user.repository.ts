import prisma from "@/loaders/prisma";
import { type CreateUser, type UserFilter } from "@/types/user.type";

export class UserRepository {
  public buildFilter(filter: UserFilter) {
    let where: Record<string, any> = {};
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
    return prisma.user.findMany({
      omit: {
        password: true,
        totp_key: true,
      },
    });
  }

  public async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async paginate(filter: UserFilter) {
    const where = this.buildFilter(filter);
    return prisma.user.findMany({
      omit: {
        password: true,
        totp_key: true,
      },
      where,
    });
  }

  public async count(filter: UserFilter) {
    const where = this.buildFilter(filter);
    return prisma.user.count({ where });
  }

  public async addUser(payload: CreateUser) {
    return prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: payload.password,
      },
    });
  }
  public async checkEmailAndUsername(email: string, username: string) {
    return prisma.user.findUnique({
      where: { email, username },
    });
  }
}
