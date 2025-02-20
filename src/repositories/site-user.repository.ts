import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { CreateSiteUser, SiteUserFilter } from "@/types/site-user.type";
import type { Prisma } from "@prisma/client";
export class SiteUserRepository {
  private buildFilter = (filter: SiteUserFilter) => {
    const where: Record<string, any> = {};
    if (filter.email) {
      where.email = {
        contains: filter.email,
        mode: "insensitive",
      };
    }
    if (filter.username) {
      where.username = {
        contains: filter.username,
        mode: "insensitive",
      };
    }
    return where;
  };
  public async paginate(filter: SiteUserFilter) {
    const where = this.buildFilter(filter);
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    return await prisma.siteUser.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        updated_at: "desc",
      },
      where,
    });
  }
  public async findById(id: string) {
    return await prisma.siteUser.findUnique({
      where: {
        id,
      },
    });
  }
  public async count(filter: SiteUserFilter) {
    const where = this.buildFilter(filter);
    return await prisma.siteUser.count({
      where,
    });
  }

  public async create(
    payload: CreateSiteUser,
    auth_id: string,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.siteUser.create({
      data: {
        username: payload.username,
        auth_id,
      },
    });
  }
}
