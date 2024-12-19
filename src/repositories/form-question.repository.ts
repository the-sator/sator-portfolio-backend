import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { BaseFilter } from "@/types/base.type";
import type {
  CreateFormQuestion,
  PortfolioFormFilter,
} from "@/types/portfolio-form.type";
import type { Prisma } from "@prisma/client";

export class FormQuestionRepository {
  public async findAll() {
    return await prisma.formQuestion.findMany({
      include: {
        form_option: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }

  public buildFilter(filter: PortfolioFormFilter) {
    let where: Record<string, any> = {};

    if (filter.order) {
      where.order = Number(filter.order);
    }

    if (filter.id) {
      where.id = { startsWith: filter.id };
    }

    return where;
  }

  public async paginate(filter: PortfolioFormFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    return await prisma.formQuestion.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
      orderBy: {
        order: "asc",
      },
      include: {
        form_option: true,
      },
    });
  }
  public async count(filter: PortfolioFormFilter) {
    const where = this.buildFilter(filter);
    return await prisma.formQuestion.count({
      where,
    });
  }

  public async create(
    payload: CreateFormQuestion,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.formQuestion.create({
      data: {
        order: payload.order,
        form_text: payload.form_text,
      },
    });
  }

  public async delete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.formQuestion.delete({
      where: { id },
    });
  }

  public async update(
    id: string,
    payload: CreateFormQuestion,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.formQuestion.update({
      where: { id },
      data: {
        form_text: payload.form_text,
        order: payload.order,
      },
    });
  }
}
