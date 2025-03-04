import type { DailyMetric, TotalMetric } from "@/types/statistic.type";
import prisma from "@/loaders/prisma";
import type { Prisma } from "@prisma/client";

export class SiteMetricRepository {
  public async getTotalBySiteUser(
    site_user_id: string
  ): Promise<Partial<TotalMetric>> {
    const totalSiteView = await prisma.siteMetric.aggregate({
      _sum: {
        view: true,
      },
      where: {
        site_user_id,
      },
    });
    return {
      total_site_views: totalSiteView._sum.view || 0,
    };
  }

  public async getDailyBySiteUser(
    site_user_id: string
  ): Promise<DailyMetric[]> {
    const results: DailyMetric[] = await prisma.$queryRaw`
        SELECT  SUM(sm.view)::INTEGER AS site_views,
            DATE_TRUNC('day', sm.created_at) AS created_at
          FROM 
            "SiteMetric" AS sm
          WHERE 
            sm.created_at > NOW() - INTERVAL '30 days'
            AND site_user_id = ${site_user_id}
          GROUP BY 
            DATE_TRUNC('day', sm.created_at)
          ORDER BY 
            created_at;
        `;
    return results;
  }

  public async findByToday(
    site_user_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await client.siteMetric.findFirst({
      where: {
        site_user_id,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  public async createMetric(site_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.siteMetric.create({
      data: {
        site_user_id: site_id,
        view: 1,
      },
    });
  }

  public async increaseView(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.siteMetric.update({
      where: {
        id,
      },
      data: {
        view: { increment: 1 },
      },
    });
  }
}
