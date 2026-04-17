import { db, type DrizzleTransaction } from "@/db";
import { blogMetric, blogs } from "@/db/schema";
import type { DailyMetric, TotalMetric } from "@/types/statistic.type";
import { and, eq, gte, lt, sql } from "drizzle-orm";

export class BlogMetricRepository {
  public async findAll() {
    return db.select().from(blogMetric);
  }

  public async findByBlog(blog_id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(blogMetric)
      .where(eq(blogMetric.blog_id, blog_id))
      .limit(1);
    return result || null;
  }

  public async findByBlogToday(blog_id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [result] = await client
      .select()
      .from(blogMetric)
      .where(
        and(
          eq(blogMetric.blog_id, blog_id),
          gte(blogMetric.created_at, today),
          lt(blogMetric.created_at, tomorrow),
        ),
      )
      .limit(1);

    return result || null;
  }

  public async getDailyBySiteUser(
    site_user_id: string,
  ): Promise<DailyMetric[]> {
    const results = await db.execute<DailyMetric>(sql`
      SELECT
        SUM(bm.view)::INTEGER AS blog_views,
        DATE_TRUNC('day', bm.created_at) AS created_at
      FROM blog_metric AS bm
      JOIN blogs AS b ON bm.blog_id = b.id
      WHERE bm.created_at > NOW() - INTERVAL '30 days'
        AND b.site_user_id = ${site_user_id}
      GROUP BY DATE_TRUNC('day', bm.created_at)
      ORDER BY created_at;
    `);

    return results.rows || [];
  }

  public async getTotalBySiteUser(
    site_user_id: string,
  ): Promise<Partial<TotalMetric>> {
    const [totalBlogView] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${blogMetric.view}), 0)::int`,
      })
      .from(blogMetric)
      .innerJoin(blogs, eq(blogMetric.blog_id, blogs.id))
      .where(eq(blogs.site_user_id, site_user_id));

    return {
      total_blog_views: totalBlogView?.total ?? 0,
    };
  }

  public async createBlogMetric(
    blog_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(blogMetric)
      .values({
        blog_id,
        view: 1,
      })
      .returning();
    return result;
  }

  public async increaseView(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(blogMetric)
      .set({
        view: sql`${blogMetric.view} + 1`,
      })
      .where(eq(blogMetric.id, id))
      .returning();
    return result;
  }
}
