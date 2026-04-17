import { db, type DrizzleTransaction } from "@/db";
import {
  formAttempts,
  formOptions,
  formQuestions,
  formResponses,
} from "@/db/schema";
import type { CreateFormResponse } from "@/types/portfolio-form.type";
import { eq } from "drizzle-orm";

export class FormResponseRepository {
  public async findAll() {
    const rows = await db
      .select({
        response: formResponses,
        form_option: formOptions,
        form_question: formQuestions,
      })
      .from(formResponses)
      .innerJoin(formOptions, eq(formResponses.option_id, formOptions.id))
      .innerJoin(formQuestions, eq(formResponses.question_id, formQuestions.id));

    return rows.map((row) => ({
      ...row.response,
      form_option: row.form_option,
      form_question: row.form_question,
    }));
  }

  public async findPriceByAttemptId(attempt_id: string) {
    const options = await db
      .select({ price: formOptions.price })
      .from(formResponses)
      .innerJoin(formOptions, eq(formResponses.option_id, formOptions.id))
      .where(eq(formResponses.attempt_id, attempt_id));

    return options.map((option) => option.price);
  }

  public async findPriceByUser(user_id: string) {
    const options = await db
      .select({
        id: formAttempts.id,
        price: formOptions.price,
      })
      .from(formResponses)
      .innerJoin(formAttempts, eq(formResponses.attempt_id, formAttempts.id))
      .innerJoin(formOptions, eq(formResponses.option_id, formOptions.id))
      .where(eq(formAttempts.user_id, user_id));

    return options.map((option) => ({
      id: option.id,
      price: option.price,
    }));
  }

  public async create(
    payload: CreateFormResponse,
    attempt_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [response] = await client
      .insert(formResponses)
      .values({
        question_id: payload.question_id,
        option_id: payload.option_id,
        attempt_id,
        metadata: payload.metadata,
      })
      .returning();

    const [option] = await client
      .select()
      .from(formOptions)
      .where(eq(formOptions.id, payload.option_id))
      .limit(1);

    return {
      ...response,
      form_option: option,
    };
  }
}
