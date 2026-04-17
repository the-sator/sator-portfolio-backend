import { db, type DrizzleTransaction } from "@/db";
import { formOptions } from "@/db/schema";
import type { CreateFormOption } from "@/types/portfolio-form.type";
import { eq } from "drizzle-orm";

export class FormOptionRepository {
  public async findAll() {
    return db.select().from(formOptions);
  }

  public async create(
    question_id: string,
    payload: CreateFormOption,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(formOptions)
      .values({
        option_text: payload.option_text,
        question_id,
        price: payload.price,
      })
      .returning();

    return result;
  }

  public async deleteByQuestionId(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return client.delete(formOptions).where(eq(formOptions.question_id, id));
  }
}
