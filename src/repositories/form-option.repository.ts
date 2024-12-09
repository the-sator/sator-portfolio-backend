import prisma from "@/loaders/prisma";
import type { CreateFormOption } from "@/types/portfolio-form.type";
import type { Prisma } from "@prisma/client";

export class FormOptionRepository {
  public async findAll() {
    return await prisma.formOption.findMany();
  }

  public async create(
    question_id: string,
    payload: CreateFormOption,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.formOption.create({
      data: {
        option_text: payload.option_text,
        question_id: question_id,
        price: payload.price,
      },
    });
  }

  public async deleteByQuestionId(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.formOption.deleteMany({
      where: { question_id: id },
    });
  }
}
