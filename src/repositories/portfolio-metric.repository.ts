import { db, type DrizzleTransaction } from "@/db";
import { portfolioMetric, portfolios } from "@/db/schema";
import type { DailyMetric, TotalMetric } from "@/types/statistic.type";
import { and, eq, gte, lt, sql } from "drizzle-orm";

export class PortfolioMetricRepository {
  public async findAll() {
    return db.select().from(portfolioMetric);
  }

  public async findByPortfolio(
    portfolio_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .select()
      .from(portfolioMetric)
      .where(eq(portfolioMetric.portfolio_id, portfolio_id))
      .limit(1);
    return result || null;
  }

  public async findByToday(
    portfolio_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [result] = await client
      .select()
      .from(portfolioMetric)
      .where(
        and(
          eq(portfolioMetric.portfolio_id, portfolio_id),
          gte(portfolioMetric.created_at, today),
          lt(portfolioMetric.created_at, tomorrow),
        ),
      )
      .limit(1);

    return result || null;
  }

  public async getTotalBySiteUser(
    site_user_id: string,
  ): Promise<Partial<TotalMetric>> {
    const [totalPortfolioView] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${portfolioMetric.view}), 0)::int`,
      })
      .from(portfolioMetric)
      .innerJoin(portfolios, eq(portfolioMetric.portfolio_id, portfolios.id))
      .where(eq(portfolios.site_user_id, site_user_id));

    return {
      total_portfolio_views: totalPortfolioView?.total ?? 0,
    };
  }

  public async getDailyBySiteUser(
    site_user_id: string,
  ): Promise<DailyMetric[]> {
    const results = await db.execute<DailyMetric>(sql`
      SELECT
        SUM(pm.view)::INTEGER AS portfolio_views,
        DATE_TRUNC('day', pm.created_at) AS created_at
      FROM portfolio_metric AS pm
      JOIN portfolios AS p ON pm.portfolio_id = p.id
      WHERE pm.created_at > NOW() - INTERVAL '30 days'
        AND p.site_user_id = ${site_user_id}
      GROUP BY DATE_TRUNC('day', pm.created_at)
      ORDER BY created_at;
    `);

    return results.rows || [];
  }

  public async createMetric(
    portfolio_id: string,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(portfolioMetric)
      .values({
        portfolio_id,
        view: 1,
      })
      .returning();
    return result;
  }

  public async increaseView(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(portfolioMetric)
      .set({
        view: sql`${portfolioMetric.view} + 1`,
      })
      .where(eq(portfolioMetric.id, id))
      .returning();
    return result;
  }
}
