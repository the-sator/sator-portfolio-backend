import { LIMIT } from "@/constant/base";
import { db, type DrizzleTransaction } from "@/db";
import { formOptions, formQuestions } from "@/db/schema";
import type {
  CreateFormQuestion,
  PortfolioFormFilter,
} from "@/types/portfolio-form.type";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  lt,
  type SQL,
} from "drizzle-orm";

export class FormQuestionRepository {
  private async withOptions(question: typeof formQuestions.$inferSelect) {
    const options = await db
      .select()
      .from(formOptions)
      .where(eq(formOptions.question_id, question.id));

    return {
      ...question,
      form_option: options,
    };
  }

  public async findAll() {
    const questions = await db
      .select()
      .from(formQuestions)
      .orderBy(asc(formQuestions.order));
    return Promise.all(questions.map((question) => this.withOptions(question)));
  }

  public async findById(id: string) {
    const [question] = await db
      .select()
      .from(formQuestions)
      .where(eq(formQuestions.id, id))
      .limit(1);

    return question ? this.withOptions(question) : null;
  }

  public async findFirstEntry() {
    const [question] = await db
      .select()
      .from(formQuestions)
      .orderBy(asc(formQuestions.order))
      .limit(1);

    return question ? this.withOptions(question) : null;
  }

  public async findNextPreviousQuestionIds(order: number) {
    const nextQuestionAsync = db
      .select()
      .from(formQuestions)
      .where(gt(formQuestions.order, order))
      .orderBy(asc(formQuestions.order))
      .limit(1);

    const previousQuestionAsync = db
      .select()
      .from(formQuestions)
      .where(lt(formQuestions.order, order))
      .orderBy(desc(formQuestions.order))
      .limit(1);

    const [[nextQuestion], [previousQuestion]] = await Promise.all([
      nextQuestionAsync,
      previousQuestionAsync,
    ]);

    return {
      next: nextQuestion ? nextQuestion.id : null,
      previous: previousQuestion ? previousQuestion.id : null,
    };
  }

  public buildFilter(filter: PortfolioFormFilter) {
    const conditions: SQL[] = [];

    if (filter.order) {
      conditions.push(eq(formQuestions.order, Number(filter.order)));
    }

    if (filter.id) {
      conditions.push(ilike(formQuestions.id, `${filter.id}%`));
    }

    return conditions;
  }

  public async paginate(filter: PortfolioFormFilter) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const questions = await db
      .select()
      .from(formQuestions)
      .where(whereClause)
      .orderBy(asc(formQuestions.order))
      .limit(limit)
      .offset((page - 1) * limit);

    return Promise.all(questions.map((question) => this.withOptions(question)));
  }

  public async count(filter: PortfolioFormFilter) {
    const conditions = this.buildFilter(filter);
    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: count() })
      .from(formQuestions)
      .where(whereClause);

    return result.count;
  }

  public async create(
    payload: CreateFormQuestion,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(formQuestions)
      .values({
        order: payload.order,
        form_text: payload.form_text,
      })
      .returning();
    return result;
  }

  public async delete(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .delete(formQuestions)
      .where(eq(formQuestions.id, id))
      .returning();
    return result;
  }

  public async update(
    id: string,
    payload: CreateFormQuestion,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(formQuestions)
      .set({
        form_text: payload.form_text,
        order: payload.order,
      })
      .where(eq(formQuestions.id, id))
      .returning();
    return result;
  }
}
