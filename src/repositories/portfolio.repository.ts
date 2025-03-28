import { LIMIT } from "@/constant/base";
import { ContentStatus } from "@/enum/content.enum";
import prisma from "@/loaders/prisma";
import { IdentityRole, type Identity } from "@/types/base.type";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import type { Prisma } from "@prisma/client";

export class PortfolioRepository {
  public async findAll() {
    return await prisma.portfolio.findMany();
  }

  public async findAllSlug(site_user_id: string) {
    return await prisma.portfolio.findMany({
      select: {
        slug: true,
      },
      where: {
        site_user_id,
        published_at: {
          not: null,
        },
      },
    });
  }

  public buildFilter(filter: PortfolioFilter) {
    let where: Record<string, unknown> = {};
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
    if (filter.published) {
      where.published_at = {
        not: null,
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
    filter: PortfolioFilter,
    status?: ContentStatus
  ) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    if (status === ContentStatus.PUBLISHED) {
      where.published_at = { not: null };
    }
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

  public async findBySlug(slug: string, status?: ContentStatus) {
    const where: Record<string, unknown> = {};
    if (status === ContentStatus.PUBLISHED) {
      where.published_at = { not: null };
    }
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        slug,
        ...where,
      },
      include: {
        CategoryOnPorfolio: {
          include: {
            category: true,
          },
        },
        PortfolioMetric: {
          select: {
            view: true,
          },
        },
      },
    });
    if (!portfolio) return;
    const totalViews = portfolio.PortfolioMetric.reduce(
      (sum, metric) => sum + metric.view,
      0
    );
    return {
      ...portfolio,
      view: totalViews,
    };
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
    customWhere: Record<string, unknown> = {}
  ) {
    const where = {
      ...this.buildFilter(filter),
      ...customWhere,
    };
    return await prisma.portfolio.count({
      where,
    });
  }
  public async create(
    payload: CreatePortfolio,
    identity: Identity,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.portfolio.upsert({
      where: {
        slug: payload.slug,
      },
      update: {
        admin_id: identity.role === IdentityRole.ADMIN ? identity.id : null,
        site_user_id:
          identity.role === IdentityRole.SITE_USER ? identity.id : null,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content ? JSON.parse(payload.content) : null,
        gallery: payload.gallery ? payload.gallery : [],
        title: payload.title,
        slug: payload.slug,
        github_link: payload.github_link,
        preview_link: payload.preview_link,
      },
      create: {
        admin_id: identity.role === IdentityRole.ADMIN ? identity.id : null,
        site_user_id:
          identity.role === IdentityRole.SITE_USER ? identity.id : null,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content ? JSON.parse(payload.content) : null,
        gallery: payload.gallery ? payload.gallery : [],
        title: payload.title,
        slug: payload.slug,
        github_link: payload.github_link,
        preview_link: payload.preview_link,
      },
    });
  }

  public async update(
    id: string,
    payload: CreatePortfolio,
    identity: Identity,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.portfolio.update({
      where: { id },
      data: {
        admin_id: identity.role === IdentityRole.ADMIN ? identity.id : null,
        site_user_id:
          identity.role === IdentityRole.SITE_USER ? identity.id : null,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content
          ? JSON.parse(payload.content)
          : payload.content,
        gallery: payload.gallery,
        title: payload.title,
        github_link: payload.github_link,
        preview_link: payload.preview_link,
        slug: payload.slug,
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
