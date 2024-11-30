import prisma from "@/loaders/prisma";
import type { CreatePortfolio } from "@/types/portfolio.type";

export class PortfolioRepository {
  public async findAll() {
    return await prisma.portfolio.findMany();
  }

  public async findBySlug(slug: string) {
    return await prisma.portfolio.findFirst({
      where: { slug },
    });
  }

  public async create(payload: CreatePortfolio) {
    return await prisma.portfolio.create({
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
}
