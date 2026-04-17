import { LIMIT } from "@/constant/base";
import { db, type DrizzleTransaction } from "@/db";
import {
  formAttempts,
  formOptions,
  formQuestions,
  formResponses,
} from "@/db/schema";
import type { FormAttemptFilter } from "@/types/portfolio-form.type";
import { and, asc, count, eq, ilike, type SQL } from "drizzle-orm";

export class FormAttemptRepository {
  public buildFilter(filter: FormAttemptFilter) {
    const conditions: SQL[] = [];
    if (filter.id) {
      conditions.push(ilike(formAttempts.id, `%${filter.id}%`));
    }
    return conditions;
  }

  private async withResponses(attempt: typeof formAttempts.$inferSelect) {
    const responses = await db
      .select({
        response: formResponses,
        form_option: formOptions,
        form_question: formQuestions,
      })
      .from(formResponses)
      .innerJoin(formOptions, eq(formResponses.option_id, formOptions.id))
      .innerJoin(formQuestions, eq(formResponses.question_id, formQuestions.id))
      .where(eq(formResponses.attempt_id, attempt.id));

    return {
      ...attempt,
      form_response: responses.map((row) => ({
        ...row.response,
        form_option: row.form_option,
        form_question: row.form_question,
      })),
    };
  }

  public async findAll() {
    const attempts = await db.select().from(formAttempts);
    return Promise.all(attempts.map((attempt) => this.withResponses(attempt)));
  }

  public async findByUser(user_id: string) {
    const attempts = await db
      .select()
      .from(formAttempts)
      .where(eq(formAttempts.user_id, user_id));
    return Promise.all(attempts.map((attempt) => this.withResponses(attempt)));
  }

  public async paginateByUser(user_id: string, filter: FormAttemptFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    conditions.push(eq(formAttempts.user_id, user_id));

    const attempts = await db
      .select()
      .from(formAttempts)
      .where(and(...conditions))
      .orderBy(asc(formAttempts.created_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return Promise.all(attempts.map((attempt) => this.withResponses(attempt)));
  }

  public async count(filter: FormAttemptFilter, user_id?: string) {
    const conditions = this.buildFilter(filter);
    if (user_id) {
      conditions.push(eq(formAttempts.user_id, user_id));
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: count() })
      .from(formAttempts)
      .where(whereClause);

    return result.count;
  }

  public async findById(id: string) {
    const [attempt] = await db
      .select()
      .from(formAttempts)
      .where(eq(formAttempts.id, id))
      .limit(1);

    return attempt ? this.withResponses(attempt) : null;
  }

  public async create(user_id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(formAttempts)
      .values({
        user_id,
        quoted_price: [],
      })
      .returning();
    return result;
  }

  public async updatePrice(
    id: string,
    price: number[],
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(formAttempts)
      .set({
        quoted_price: price,
      })
      .where(eq(formAttempts.id, id))
      .returning();
    return result;
  }
}
