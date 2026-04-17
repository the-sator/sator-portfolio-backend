import { db } from "@/db";
import { categories } from "@/db/schema";
import type { CreateCategory } from "@/types/category.type";
import { eq } from "drizzle-orm";

export class CategoryRepository {
  public async findAll() {
    return db.select().from(categories);
  }

  public async findBySiteUser(site_user_id: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.site_user_id, site_user_id));
  }

  public async create(auth_id: string, payload: CreateCategory) {
    const [result] = await db
      .insert(categories)
      .values({
        name: payload.name,
        color: payload.color,
        site_user_id: auth_id,
      })
      .returning();
    return result;
  }

  public async update(id: string, payload: CreateCategory) {
    const [result] = await db
      .update(categories)
      .set({
        name: payload.name,
        color: payload.color,
      })
      .where(eq(categories.id, id))
      .returning();
    return result;
  }

  public async delete(id: string) {
    const [result] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return result;
  }
}
