import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { BaseFilter } from "@/types/base.type";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import type { Prisma } from "@prisma/client";

export class PortfolioRepository {
  public async findAll() {
    return await prisma.portfolio.findMany();
  }
  public buildFilter(filter: PortfolioFilter) {
    let where: Record<string, any> = {};
    if (filter.title) {
      where.title = { contains: filter.title, mode: "insensitive" };
    }
    const categoryArray = filter.categories
      ? Array.isArray(filter.categories)
        ? filter.categories
        : [filter.categories]
      : undefined;
    if (categoryArray && categoryArray.length > 0) {
      where = {
        CategoryOnPorfolio: {
          some: {
            category_id: {
              in: categoryArray,
            },
          },
        },
      };
    }
    return where;
  }

  public async paginateAdmin(filter: PortfolioFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    return await prisma.portfolio.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "asc",
      },
      include: {
        CategoryOnPorfolio: {
          include: {
            category: true,
          },
        },
      },
      where: {
        admin_id: {
          not: null,
        },
        ...where,
      },
    });
  }

  public async paginateBySiteUserId(
    site_user_id: string,
    filter: PortfolioFilter
  ) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    return await prisma.portfolio.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "asc",
      },
      include: {
        CategoryOnPorfolio: {
          include: {
            category: true,
          },
        },
      },
      where: {
        site_user_id,
        ...where,
      },
    });
  }

  public async findBySlug(slug: string) {
    return await prisma.portfolio.findFirst({
      where: { slug },
      include: {
        CategoryOnPorfolio: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  public async findById(id: string) {
    return await prisma.portfolio.findFirst({
      where: { id },
      include: {
        CategoryOnPorfolio: {
          include: {
            category: true,
          },
        },
      },
    });
  }
  public async count(
    filter: PortfolioFilter,
    customWhere: Record<string, any> = {}
  ) {
    const where = {
      ...this.buildFilter(filter),
      ...customWhere,
    };
    return await prisma.portfolio.count({
      where,
    });
  }
  public async create(payload: CreatePortfolio, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolio.upsert({
      where: {
        slug: payload.slug,
      },
      update: {
        admin_id: payload.admin_id,
        site_user_id: payload.site_user_id,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content ? JSON.parse(payload.content) : null,
        gallery: payload.gallery ? payload.gallery : [],
        title: payload.title,
        slug: payload.slug,
      },
      create: {
        admin_id: payload.admin_id,
        site_user_id: payload.site_user_id,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content ? JSON.parse(payload.content) : null,
        gallery: payload.gallery ? payload.gallery : [],
        title: payload.title,
        slug: payload.slug,
      },
    });
  }

  public async update(
    id: string,
    payload: CreatePortfolio,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.portfolio.update({
      where: { id },
      data: {
        admin_id: payload.admin_id,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content
          ? JSON.parse(payload.content)
          : payload.content,
        gallery: payload.gallery,
        title: payload.title,
      },
    });
  }
  public async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolio.delete({
      where: { id },
    });
  }
  public async publish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolio.update({
      where: { id },
      data: {
        published_at: new Date(),
      },
    });
  }
  public async unpublish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolio.update({
      where: { id },
      data: {
        published_at: null,
      },
    });
  }
}
