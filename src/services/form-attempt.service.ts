import { FormAttemptRepository } from "@/repositories/form-attempt.repository";
import { FormResponseRepository } from "@/repositories/form-response.repository";
import type {
  CreateFormAttempt,
  FormAttemptFilter,
} from "@/types/portfolio-form.type";
import prisma from "@/loaders/prisma";
import { UserService } from "./user.service";
import {
  ThrowForbidden,
  ThrowNotFound,
  ThrowUnauthorized,
} from "@/utils/exception";
import { sumArray } from "@/utils/string";
import { getPaginationMetadata } from "@/utils/pagination";

export class FormAttemptService {
  private formAttemptRepository: FormAttemptRepository;
  private formResponseRepository: FormResponseRepository;
  private userService: UserService;

  constructor() {
    this.formAttemptRepository = new FormAttemptRepository();
    this.formResponseRepository = new FormResponseRepository();
    this.userService = new UserService();
  }
  public async findByUser(token: string) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    return await this.formAttemptRepository.findByUser(user.id);
  }

  public async paginateByUser(token: string, filter: FormAttemptFilter) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    const countAsync = this.formAttemptRepository.count(filter);
    const attemptsAsync = this.formAttemptRepository.paginateByUser(
      user.id,
      filter
    );
    const [count, attempts] = await Promise.all([countAsync, attemptsAsync]);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    return {
      data: attempts,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async getAttemptById(token: string, attempt_id: string) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    const attemptAsync = this.formAttemptRepository.findById(attempt_id);
    const attempt = await attemptAsync;
    if (!attempt) return ThrowNotFound();
    if (attempt.user_id !== user.id) return ThrowForbidden();
    return attempt;
  }
  //TODO: Do anonymous account later
  public async create(token: string, payload: CreateFormAttempt) {
    const user = await this.userService.getMe(token);
    if (!user) return ThrowUnauthorized();
    return prisma.$transaction(async (tx) => {
      const attempt = await this.formAttemptRepository.create(user.id, tx);
      const responses = await Promise.all(
        payload.responses.map((res) =>
          this.formResponseRepository.create(res, attempt.id, tx)
        )
      );
      const price = responses.reduce(
        (prev, curr) => {
          return sumArray(prev, curr.form_option.price);
        },
        [0, 0]
      );
      const updatedPriceAttempt = await this.formAttemptRepository.updatePrice(
        attempt.id,
        price,
        tx
      );
      return updatedPriceAttempt;
    });
  }
}
