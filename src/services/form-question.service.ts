import { LIMIT } from "@/constant/base";
import { db } from "@/db";
import { NotFoundException } from "@/core/response/error/exception";
import { FormOptionRepository } from "@/repositories/form-option.repository";
import { FormQuestionRepository } from "@/repositories/form-question.repository";
import type {
  CreateFormQuestion,
  PortfolioFormFilter,
} from "@/types/portfolio-form.type";

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

  public async paginate(filter: PortfolioFormFilter) {
    const count = await this.formQuestionRepository.count(filter);
    const current_page = filter.page ? Number(filter.page) : 1;
    const page_size = filter.page_size ? Number(filter.page_size) : LIMIT;
    const page_count = Math.ceil(count / page_size);
    const page = count > current_page * page_size ? current_page + 1 : null;
    const questions = await this.formQuestionRepository.paginate(filter);
    return { questions, current_page, page, count, page_size, page_count };
  }

  public async findById(id: string) {
    if (id === "first") {
      const formQuestion = await this.formQuestionRepository.findFirstEntry();
      if (!formQuestion) throw new NotFoundException();
      const nextPrevious =
        await this.formQuestionRepository.findNextPreviousQuestionIds(
          formQuestion.order
        );
      return {
        ...formQuestion,
        ...nextPrevious,
      };
    }
    const formQuestion = await this.formQuestionRepository.findById(id);
    if (!formQuestion) throw new NotFoundException();
    const nextPrevious =
      await this.formQuestionRepository.findNextPreviousQuestionIds(
        formQuestion.order
      );
    return {
      ...formQuestion,
      ...nextPrevious,
    };
  }

  public async create(payload: CreateFormQuestion) {
    return await db.transaction(async (tx) => {
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
    return await db.transaction(async (tx) => {
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
