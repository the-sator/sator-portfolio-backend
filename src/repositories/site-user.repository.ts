import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { CreateSiteUser, SiteUserFilter } from "@/types/site-user.type";
const omit = {
  password: true,
  totp_key: true,
};
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
      omit,
    });
  }
  public async findById(id: string) {
    return await prisma.siteUser.findUnique({
      where: {
        id,
      },
      omit,
    });
  }
  public async findByEmail(email: string) {
    return await prisma.siteUser.findUnique({
      where: {
        email,
      },
    });
  }

  public async checkByEmailUsername(email: string, username: string) {
    return await prisma.siteUser.findUnique({
      where: {
        email,
        username,
      },
    });
  }
  public async count(filter: SiteUserFilter) {
    const where = this.buildFilter(filter);
    return await prisma.siteUser.count({
      where,
    });
  }

  public async create(data: CreateSiteUser) {
    return await prisma.siteUser.create({
      data,
      omit,
    });
  }
}
