import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { CreateSiteUser, SiteUserFilter } from "@/types/site-user.type";
import { encryptApiKey } from "@/utils/encryption";
import type { Prisma } from "@prisma/client";
export class SiteUserRepository {
  private buildFilter = (filter: SiteUserFilter) => {
    const where: Record<string, unknown> = {};
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

  public async findByApiKey(api_key: string) {
    const encrypted = encryptApiKey(api_key);
    return await prisma.siteUser.findUnique({
      where: {
        api_key: encrypted,
      },
    });
  }
  public async count(filter: SiteUserFilter) {
    const where = this.buildFilter(filter);
    return await prisma.siteUser.count({
      where,
    });
  }

  public async checkIsRegister(id: string) {
    const count = await prisma.siteUser.count({
      where: {
        AND: [
          {
            id,
          },
          {
            registered_at: {
              not: null,
            },
          },
        ],
      },
    });
    return count > 0;
  }

  public async create(
    payload: CreateSiteUser,
    auth_id: string,
    apiKey: string,
    tx: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return client.siteUser.create({
      data: {
        website_name: payload.website_name,
        link: payload.link,
        user_id: payload.user_id,
        api_key: apiKey,
        auth_id,
      },
    });
  }

  public async updateRegisteredAt(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return client.siteUser.update({
      where: { id },
      data: {
        registered_at: new Date(),
      },
    });
  }
}
