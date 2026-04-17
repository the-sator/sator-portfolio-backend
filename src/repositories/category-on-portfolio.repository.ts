import { db, type DrizzleTransaction } from "@/db";
import { categoryOnPortfolios } from "@/db/schema";
import type { AssignCategory } from "@/types/category.type";
import { eq } from "drizzle-orm";

export class CategoryOnPortfolioRepository {
  public async findAll() {
    return db.select().from(categoryOnPortfolios);
  }

  public async create(payload: AssignCategory, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(categoryOnPortfolios)
      .values({
        portfolio_id: payload.portfolio_id,
        category_id: payload.category_id,
        created_by: payload.assignedBy,
      })
      .returning();
    return result;
  }

  public async deleteByPortfolioId(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return client
      .delete(categoryOnPortfolios)
      .where(eq(categoryOnPortfolios.portfolio_id, id));
  }
}
