import prisma from "@/loaders/prisma";
import type { CreateFormResponse } from "@/types/portfolio-form.type";
import type { Prisma } from "@prisma/client";
export class FormResponseRepository {
  public async findAll() {
    return await prisma.formResponse.findMany({
      include: {
        form_option: true,
        form_question: true,
      },
    });
  }

  public async findPriceByAttemptId(attempt_id: string) {
    const options = await prisma.formResponse.findMany({
      select: {
        form_option: {
          select: {
            price: true,
          },
        },
      },
      where: {
        attempt_id,
      },
    });
    const prices = options.map((option) => option.form_option.price);
    return prices;
  }

  public async findPriceByUser(user_id: string) {
    const options = await prisma.formResponse.findMany({
      select: {
        form_attempt: {
          select: {
            id: true,
          },
        },
        form_option: {
          select: {
            price: true,
          },
        },
      },
      where: {
        form_attempt: {
          user_id,
        },
      },
    });
    const prices = options.map((option) => ({
      id: option.form_attempt.id,
      price: option.form_option.price,
    }));
    return prices;
  }

  public async create(
    payload: CreateFormResponse,
    attempt_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.formResponse.create({
      data: {
        question_id: payload.question_id,
        option_id: payload.option_id,
        attempt_id: attempt_id,
      },
      include: {
        form_option: true,
      },
    });
  }
}
