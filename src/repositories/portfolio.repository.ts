import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { BaseFilter } from "@/types/base.type";
import type { CreatePortfolio } from "@/types/portfolio.type";
import type { Prisma } from "@prisma/client";

export class PortfolioRepository {
  public async findAll() {
    return await prisma.portfolio.findMany();
  }

  public async paginateAll(filter: BaseFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    return await prisma.portfolio.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "asc",
      },
    });
  }

  public async findBySlug(slug: string) {
    return await prisma.portfolio.findFirst({
      where: { slug },
      include: {
        CategoryOnPorfolio: true,
      },
    });
  }
  public async count() {
    return await prisma.portfolio.count();
  }
  public async create(payload: CreatePortfolio, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolio.create({
      data: {
        admin_id: payload.admin_id,
        description: payload.description,
        cover_url: payload.cover_url || "",
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
