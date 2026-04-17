import { db, type DrizzleTransaction } from "@/db";
import { categoryOnBlogs } from "@/db/schema";
import type { AssignCategoryOnBlog } from "@/types/category.type";
import { eq } from "drizzle-orm";

export class CategoryOnBlogRepository {
  public async findAll() {
    return db.select().from(categoryOnBlogs);
  }

  public async create(
    payload: AssignCategoryOnBlog,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(categoryOnBlogs)
      .values({
        blog_id: payload.blog_id,
        category_id: payload.category_id,
        created_by: payload.assignedBy,
      })
      .returning();
    return result;
  }

  public deleteByBlogId(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    return client.delete(categoryOnBlogs).where(eq(categoryOnBlogs.blog_id, id));
  }
}
