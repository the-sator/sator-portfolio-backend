import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { BlogFilter, CreateBlog } from "@/types/blog.type";
import { Prisma } from "@prisma/client";

export class BlogRepository {
  public buildFilter(filter: BlogFilter) {
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
        CategoryOnBlog: {
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

  public async findAll() {
    return await prisma.blog.findMany();
  }

  public async findBySlug(slug: string) {
    return await prisma.blog.findFirst({
      where: { slug },
      include: {
        CategoryOnBlog: true,
      },
    });
  }

  public async paginateAdmin(filter: BlogFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    return await prisma.blog.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "asc",
      },
      include: {
        CategoryOnBlog: {
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

  public async count(
    filter: BlogFilter,
    customWhere: Record<string, any> = {}
  ) {
    const where = {
      ...this.buildFilter(filter),
      ...customWhere,
    };
    return await prisma.blog.count({
      where,
    });
  }

  public async create(payload: CreateBlog, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.create({
      data: {
        admin_id: payload.admin_id,
        title: payload.title,
        description: payload.description,
        cover_url: payload.cover_url,
        slug: payload.slug,
        content: payload.content ? JSON.parse(payload.content) : null,
      },
    });
  }
  public async update(
    id: string,
    payload: CreateBlog,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: {
        admin_id: payload.admin_id,
        title: payload.title,
        slug: payload.slug,
        cover_url: payload.cover_url,
        description: payload.description,
        content: payload.content ? JSON.parse(payload.content) : null,
      },
    });
  }
  public async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.delete({
      where: {
        id,
      },
    });
  }
  public async publish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: {
        published_at: new Date(),
      },
    });
  }
  public async unpublish(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blog.update({
      where: {
        id,
      },
      data: { published_at: null },
    });
  }
}
