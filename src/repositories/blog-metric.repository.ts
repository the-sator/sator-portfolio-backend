import prisma from "@/loaders/prisma";
import type { DailyMetric, TotalMetric } from "@/types/statistic.type";
import type { Prisma } from "@prisma/client";

export class BlogMetricRepository {
  public async findAll() {
    return await prisma.blogMetric.findMany();
  }
  public async findByBlog(blog_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.findFirst({
      where: {
        blog_id,
      },
    });
  }
  public async findByBlogToday(blog_id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await client.blogMetric.findFirst({
      where: {
        blog_id,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  public async getDailyBySiteUser(
    site_user_id: string
  ): Promise<DailyMetric[]> {
    const results: DailyMetric[] = await prisma.$queryRaw`
        SELECT  SUM(bm.view)::INTEGER AS blog_views,
            DATE_TRUNC('day', bm.created_at) AS created_at
          FROM 
            "BlogMetric" AS bm
          JOIN 
            "Blog" AS b ON bm.blog_id = b.id
          WHERE 
            bm.created_at > NOW() - INTERVAL '30 days'
            AND site_user_id =${site_user_id}
          GROUP BY 
            DATE_TRUNC('day', bm.created_at)
          ORDER BY 
            created_at;
        `;
    return results;
  }

  public async getTotalBySiteUser(
    site_user_id: string
  ): Promise<Partial<TotalMetric>> {
    const totalBlogView = await prisma.blogMetric.aggregate({
      _sum: {
        view: true,
      },
      where: {
        blog: {
          site_user_id,
        },
      },
    });
    return {
      total_blog_views: totalBlogView._sum.view || 0,
    };
  }

  public async createBlogMetric(
    blog_id: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.create({
      data: {
        blog_id,
        view: 1,
      },
    });
  }
  public async increaseView(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ? tx : prisma;
    return await client.blogMetric.update({
      where: {
        id,
      },
      data: {
        view: { increment: 1 },
      },
    });
  }
}
