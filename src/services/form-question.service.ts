import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import { FormOptionRepository } from "@/repositories/form-option.repository";
import { FormQuestionRepository } from "@/repositories/form-question.repository";
import type { BaseFilter } from "@/types/base.type";
import type { CreateFormQuestion } from "@/types/portfolio-form.type";

export class FormQuestionService {
  private formQuestionRepository: FormQuestionRepository;
  private formOptionRepository: FormOptionRepository;
  constructor() {
    this.formQuestionRepository = new FormQuestionRepository();
    this.formOptionRepository = new FormOptionRepository();
  }

  public async findAll() {
    return this.formQuestionRepository.findAll();
  }

  public async paginate(filter: BaseFilter) {
    const count = await this.formQuestionRepository.count();
    const currentPage = filter.page ? Number(filter.page) : 1;
    const limit = filter.limit ? Number(filter.limit) : LIMIT;
    const page = count > currentPage * limit ? currentPage + 1 : null;
    const questions = await this.formQuestionRepository.paginate(filter);
    return { questions, currentPage, page, count };
  }

  public async create(payload: CreateFormQuestion) {
    return await prisma.$transaction(async (tx) => {
      const question = await this.formQuestionRepository.create(payload, tx);
      for (const option of payload.options) {
        await this.formOptionRepository.create(question.id, option, tx);
      }
      return question;
    });
  }

  public async delete(id: string) {
    return this.formQuestionRepository.delete(id);
  }

  public async update(id: string, payload: CreateFormQuestion) {
    return await prisma.$transaction(async (tx) => {
      const question = await this.formQuestionRepository.update(
        id,
        payload,
        tx
      );
      await this.formOptionRepository.deleteByQuestionId(id);
      for (const option of payload.options) {
        await this.formOptionRepository.create(question.id, option, tx);
      }
      return question;
    });
  }
}
