import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import type { BaseFilter } from "@/types/base.type";
import type { CreateFormQuestion } from "@/types/portfolio-form.type";
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

  public async paginate(filter: BaseFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    return await prisma.formQuestion.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        order: "asc",
      },
      include: {
        form_option: true,
      },
    });
  }

  public async count() {
    return await prisma.formQuestion.count();
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
