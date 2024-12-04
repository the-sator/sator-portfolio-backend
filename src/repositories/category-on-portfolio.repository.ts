import prisma from "@/loaders/prisma";
import type { AssignCategory } from "@/types/category.type";
import type { Prisma } from "@prisma/client";

export class CategoryOnPortfolioRepository {
  public async findAll() {
    return prisma.categoryOnPorfolio.findMany();
  }

  public async create(payload: AssignCategory, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return client.categoryOnPorfolio.create({
      data: {
        portfolio_id: payload.portfolio_id,
        category_id: payload.category_id,
        assignedBy: payload.assignedBy,
      },
    });
  }

  public async deleteByPortfolioId(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.categoryOnPorfolio.deleteMany({
      where: { portfolio_id: id },
    });
  }
}
