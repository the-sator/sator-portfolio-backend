import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { FormAttemptFilter } from "@/types/portfolio-form.type";
import type { Prisma } from "@prisma/client";
export class FormAttemptRepository {
  public buildFilter(filter: FormAttemptFilter) {
    const where: Record<string, unknown> = {};
    if (filter.id) {
      where.id = { contains: filter.id };
    }
    return where;
  }
  public async findAll() {
    return await prisma.formAttempt.findMany({
      include: {
        form_response: true,
      },
    });
  }
  public async findByUser(user_id: string) {
    return await prisma.formAttempt.findMany({
      where: {
        user_id,
      },
      include: {
        form_response: {
          include: {
            form_option: true,
            form_question: true,
          },
        },
      },
    });
  }

  public async paginateByUser(user_id: string, filter: FormAttemptFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const where = this.buildFilter(filter);
    return await prisma.formAttempt.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: "asc",
      },
      where: {
        ...where,
        user_id,
      },
      include: {
        form_response: {
          include: {
            form_option: true,
            form_question: true,
          },
        },
      },
    });
  }

  public async count(filter: FormAttemptFilter) {
    const where = this.buildFilter(filter);
    return await prisma.formAttempt.count({
      where,
    });
  }

  public async findById(id: string) {
    return await prisma.formAttempt.findUnique({
      where: {
        id,
      },
      include: {
        form_response: {
          include: {
            form_option: true,
            form_question: true,
          },
        },
      },
    });
  }

  public async create(user_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.formAttempt.create({
      data: {
        user_id,
      },
    });
  }

  public async updatePrice(
    id: string,
    price: number[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.formAttempt.update({
      where: {
        id,
      },
      data: {
        quoted_price: price,
      },
    });
  }
}
