import prisma from "@/loaders/prisma";
import type { DailyMetric, TotalMetric } from "@/types/statistic.type";
import type { Prisma } from "@prisma/client";

export class PortfolioMetricRepository {
  public async findAll() {
    return await prisma.portfolioMetric.findMany();
  }
  public async findByPortfolio(
    portfolio_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.portfolioMetric.findFirst({
      where: {
        portfolio_id,
      },
    });
  }
  public async findByToday(
    portfolio_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await client.portfolioMetric.findFirst({
      where: {
        portfolio_id,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  public async getTotalBySiteUser(
    site_user_id: string
  ): Promise<Partial<TotalMetric>> {
    const totalPortfolioView = await prisma.portfolioMetric.aggregate({
      _sum: {
        view: true,
      },
      where: {
        portfolio: {
          site_user_id,
        },
      },
    });
    return {
      total_portfolio_views: totalPortfolioView._sum.view || 0,
    };
  }

  public async getDailyBySiteUser(
    site_user_id: string
  ): Promise<DailyMetric[]> {
    const results: DailyMetric[] = await prisma.$queryRaw`
      SELECT 
        SUM(pm.view)::INTEGER AS portfolio_views,
        DATE_TRUNC('day', pm.created_at) AS created_at
      FROM 
        "PortfolioMetric" AS pm
      JOIN 
        "Portfolio" AS p ON pm.portfolio_id = p.id
      WHERE 
        pm.created_at > NOW() - INTERVAL '30 days'
        AND p.site_user_id = ${site_user_id}
      GROUP BY 
        DATE_TRUNC('day', pm.created_at)
      ORDER BY 
        created_at;
    `;
    return results;
  }

  public async createMetric(
    portfolio_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.portfolioMetric.create({
      data: {
        portfolio_id: portfolio_id,
        view: 1,
      },
    });
  }

  public async increaseView(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.portfolioMetric.update({
      where: {
        id,
      },
      data: {
        view: { increment: 1 },
      },
    });
  }
}
